package usecase

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

type MetaUseCase struct {
	repo       repository.MetaRepository
	perfilRepo repository.PerfilRepository
	despRepo   repository.DespesaRepository
	catRepo    repository.CategoriaRepository
}

func NewMetaUseCase(
	repo repository.MetaRepository,
	perfilRepo repository.PerfilRepository,
	despRepo repository.DespesaRepository,
	catRepo repository.CategoriaRepository,
) *MetaUseCase {
	return &MetaUseCase{
		repo:       repo,
		perfilRepo: perfilRepo,
		despRepo:   despRepo,
		catRepo:    catRepo,
	}
}

func (uc *MetaUseCase) CreateMeta(ctx context.Context, perfilID uuid.UUID, req dto.CreateMetaRequest) (*dto.MetaResponse, error) {
	// Verify profile
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	// Fetch metas to calculate priority
	allMetas, err := uc.repo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	priority := 0
	for _, m := range allMetas {
		if !m.Comprado && m.Prioridade >= priority {
			priority = m.Prioridade + 1
		}
	}

	m := &entity.Meta{
		ID:         uuid.New(),
		PerfilID:   perfilID,
		Nome:       req.Nome,
		Valor:      req.Valor,
		Foto:       req.Foto,
		Comprado:   req.Comprado,
		Prioridade: priority,
	}

	if err := m.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	if err := uc.repo.Create(ctx, m); err != nil {
		return nil, err
	}

	// Recalculate targets
	if err := uc.recalcularMetasTargets(ctx, perfilID); err != nil {
		return nil, fmt.Errorf("failed to recalculate targets: %w", err)
	}

	// Fetch updated meta to return correct valorTarget
	updated, err := uc.repo.GetByID(ctx, m.ID)
	if err != nil {
		return nil, err
	}

	return uc.toResponse(updated), nil
}

func (uc *MetaUseCase) GetByID(ctx context.Context, id uuid.UUID) (*dto.MetaResponse, error) {
	m, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return uc.toResponse(m), nil
}

func (uc *MetaUseCase) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*dto.MetaResponse, error) {
	// Verify profile
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	metas, err := uc.repo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.MetaResponse, len(metas))
	for i, m := range metas {
		res[i] = uc.toResponse(m)
	}
	return res, nil
}

func (uc *MetaUseCase) UpdateMeta(ctx context.Context, id uuid.UUID, req dto.UpdateMetaRequest) error {
	m, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	m.Nome = req.Nome
	m.Valor = req.Valor
	m.Foto = req.Foto
	m.Comprado = req.Comprado

	if err := m.Validate(); err != nil {
		return fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	if err := uc.repo.Update(ctx, m); err != nil {
		return err
	}

	return uc.recalcularMetasTargets(ctx, m.PerfilID)
}

func (uc *MetaUseCase) DeleteMeta(ctx context.Context, id uuid.UUID) error {
	m, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if err := uc.repo.Delete(ctx, id); err != nil {
		return err
	}

	// Reorder remaining metas priority
	allMetas, err := uc.repo.GetByPerfil(ctx, m.PerfilID)
	if err != nil {
		return err
	}

	var activeUpdates []repository.MetaPrioridadeUpdate
	idx := 0
	for _, meta := range allMetas {
		if !meta.Comprado {
			activeUpdates = append(activeUpdates, repository.MetaPrioridadeUpdate{
				ID:         meta.ID,
				Prioridade: idx,
			})
			idx++
		}
	}

	if len(activeUpdates) > 0 {
		if err := uc.repo.BulkUpdatePrioridades(ctx, activeUpdates); err != nil {
			return err
		}
	}

	return uc.recalcularMetasTargets(ctx, m.PerfilID)
}

func (uc *MetaUseCase) ReorderMetas(ctx context.Context, perfilID uuid.UUID, ids []uuid.UUID) error {
	// Verify profile
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return err
	}

	updates := make([]repository.MetaPrioridadeUpdate, len(ids))
	for i, id := range ids {
		updates[i] = repository.MetaPrioridadeUpdate{
			ID:         id,
			Prioridade: i,
		}
	}

	if err := uc.repo.BulkUpdatePrioridades(ctx, updates); err != nil {
		return err
	}

	return uc.recalcularMetasTargets(ctx, perfilID)
}

func (uc *MetaUseCase) ComprarMeta(ctx context.Context, id uuid.UUID) error {
	m, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	if m.Comprado {
		return nil
	}

	m.Comprado = true
	if err := uc.repo.Update(ctx, m); err != nil {
		return err
	}

	p, err := uc.perfilRepo.GetByID(ctx, m.PerfilID)
	if err != nil {
		return err
	}

	totalInvested, err := uc.calcularTotalInvestido(ctx, m.PerfilID)
	if err != nil {
		return err
	}

	if p.MetaBaseline == nil {
		p.MetaBaseline = &totalInvested
	}

	newBaseline := *p.MetaBaseline + m.Valor
	p.MetaBaseline = &newBaseline

	if err := uc.perfilRepo.Update(ctx, p); err != nil {
		return err
	}

	return uc.recalcularMetasTargets(ctx, m.PerfilID)
}

func (uc *MetaUseCase) UpdateMetaTargets(ctx context.Context, perfilID uuid.UUID, reajustes []dto.MetaReajusteTarget) error {
	// Verify profile
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return err
	}

	updates := make([]repository.MetaTargetUpdate, len(reajustes))
	for i, r := range reajustes {
		id, err := uuid.Parse(r.ID)
		if err != nil {
			return fmt.Errorf("%w: invalid meta ID format", domainErr.ErrInvalidInput)
		}
		updates[i] = repository.MetaTargetUpdate{
			ID:          id,
			ValorTarget: r.ValorTarget,
		}
	}

	return uc.repo.BulkUpdateTargets(ctx, updates)
}

// target recalculation algorithm
func (uc *MetaUseCase) recalcularMetasTargets(ctx context.Context, perfilID uuid.UUID) error {
	p, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return err
	}

	totalInvested, err := uc.calcularTotalInvestido(ctx, perfilID)
	if err != nil {
		return err
	}

	metas, err := uc.repo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return err
	}

	var activeMetas []*entity.Meta
	for _, m := range metas {
		if !m.Comprado {
			activeMetas = append(activeMetas, m)
		}
	}

	if len(activeMetas) == 0 {
		p.MetaBaseline = nil
		return uc.perfilRepo.Update(ctx, p)
	}

	if p.MetaBaseline == nil {
		p.MetaBaseline = &totalInvested
	}

	currentBaseline := *p.MetaBaseline
	accumulatedValue := 0.0

	updates := make([]repository.MetaTargetUpdate, len(activeMetas))
	for i, m := range activeMetas {
		accumulatedValue += m.Valor
		m.ValorTarget = currentBaseline + accumulatedValue
		updates[i] = repository.MetaTargetUpdate{
			ID:          m.ID,
			ValorTarget: m.ValorTarget,
		}
	}

	if err := uc.repo.BulkUpdateTargets(ctx, updates); err != nil {
		return err
	}

	return uc.perfilRepo.Update(ctx, p)
}

func (uc *MetaUseCase) calcularTotalInvestido(ctx context.Context, perfilID uuid.UUID) (float64, error) {
	despesas, err := uc.despRepo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return 0, err
	}

	cat, err := uc.catRepo.GetByNome(ctx, "Investimento")
	if err != nil {
		if errors.Is(err, domainErr.ErrNotFound) {
			return 0, nil
		}
		return 0, err
	}

	total := 0.0
	for _, d := range despesas {
		if d.CategoriaID == cat.ID {
			total += d.Valor
		}
	}
	return total, nil
}

func (uc *MetaUseCase) toResponse(m *entity.Meta) *dto.MetaResponse {
	return &dto.MetaResponse{
		ID:          m.ID.String(),
		PerfilID:    m.PerfilID.String(),
		Nome:        m.Nome,
		Valor:       m.Valor,
		Foto:        m.Foto,
		Comprado:    m.Comprado,
		Prioridade:  m.Prioridade,
		ValorTarget: m.ValorTarget,
		CreatedAt:   m.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   m.UpdatedAt.Format(time.RFC3339),
	}
}
