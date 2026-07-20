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

type DespesaUseCase struct {
	repo       repository.DespesaRepository
	perfilRepo repository.PerfilRepository
	catRepo    repository.CategoriaRepository
	finRepo    repository.FinanciamentoRepository
}

func NewDespesaUseCase(
	repo repository.DespesaRepository,
	perfilRepo repository.PerfilRepository,
	catRepo repository.CategoriaRepository,
	finRepo repository.FinanciamentoRepository,
) *DespesaUseCase {
	return &DespesaUseCase{
		repo:       repo,
		perfilRepo: perfilRepo,
		catRepo:    catRepo,
		finRepo:    finRepo,
	}
}

func (uc *DespesaUseCase) CreateDespesa(ctx context.Context, perfilID uuid.UUID, req dto.CreateDespesaRequest) (*dto.DespesaResponse, error) {
	// Verify profile existence
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	// Resolve Category
	cat, err := uc.resolveOrCreateCategory(ctx, req.Categoria)
	if err != nil {
		return nil, err
	}

	// Resolve Subcategory
	subcatID, err := uc.resolveOrCreateSubcategory(ctx, req.SubcategoriaInvestimento)
	if err != nil {
		return nil, err
	}

	// Resolve Financiamento
	finID, err := uc.resolveFinanciamento(ctx, req.FinanciamentoID)
	if err != nil {
		return nil, err
	}

	d := &entity.Despesa{
		ID:                         uuid.New(),
		PerfilID:                   perfilID,
		Descricao:                  req.Descricao,
		Valor:                      req.Valor,
		CategoriaID:                cat.ID,
		SubcategoriaInvestimentoID: subcatID,
		FinanciamentoID:            finID,
		MesInicio:                  req.MesInicio,
		AnoInicio:                  req.AnoInicio,
		Parcelas:                   req.Parcelas,
		Recorrente:                 req.Recorrente,
	}

	if err := d.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	if err := uc.repo.Create(ctx, d); err != nil {
		return nil, err
	}

	return uc.toResponse(ctx, d)
}

func (uc *DespesaUseCase) GetByID(ctx context.Context, id uuid.UUID) (*dto.DespesaResponse, error) {
	d, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return uc.toResponse(ctx, d)
}

func (uc *DespesaUseCase) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*dto.DespesaResponse, error) {
	// Verify profile
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	despesas, err := uc.repo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.DespesaResponse, len(despesas))
	for i, d := range despesas {
		resp, err := uc.toResponse(ctx, d)
		if err != nil {
			return nil, err
		}
		res[i] = resp
	}
	return res, nil
}

func (uc *DespesaUseCase) UpdateDespesa(ctx context.Context, id uuid.UUID, req dto.UpdateDespesaRequest) error {
	d, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Resolve Category
	cat, err := uc.resolveOrCreateCategory(ctx, req.Categoria)
	if err != nil {
		return err
	}

	// Resolve Subcategory
	subcatID, err := uc.resolveOrCreateSubcategory(ctx, req.SubcategoriaInvestimento)
	if err != nil {
		return err
	}

	// Resolve Financiamento
	finID, err := uc.resolveFinanciamento(ctx, req.FinanciamentoID)
	if err != nil {
		return err
	}

	d.Descricao = req.Descricao
	d.Valor = req.Valor
	d.CategoriaID = cat.ID
	d.SubcategoriaInvestimentoID = subcatID
	d.FinanciamentoID = finID
	d.MesInicio = req.MesInicio
	d.AnoInicio = req.AnoInicio
	d.Parcelas = req.Parcelas
	d.Recorrente = req.Recorrente

	if err := d.Validate(); err != nil {
		return fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	return uc.repo.Update(ctx, d)
}

func (uc *DespesaUseCase) DeleteDespesa(ctx context.Context, id uuid.UUID) error {
	_, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return uc.repo.Delete(ctx, id)
}

func (uc *DespesaUseCase) BulkCreateDespesas(ctx context.Context, perfilID uuid.UUID, req dto.BulkCreateDespesasRequest) ([]*dto.DespesaResponse, error) {
	// Verify profile
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	despesas := make([]*entity.Despesa, len(req.Despesas))
	for i, r := range req.Despesas {
		cat, err := uc.resolveOrCreateCategory(ctx, r.Categoria)
		if err != nil {
			return nil, err
		}

		subcatID, err := uc.resolveOrCreateSubcategory(ctx, r.SubcategoriaInvestimento)
		if err != nil {
			return nil, err
		}

		finID, err := uc.resolveFinanciamento(ctx, r.FinanciamentoID)
		if err != nil {
			return nil, err
		}

		d := &entity.Despesa{
			ID:                         uuid.New(),
			PerfilID:                   perfilID,
			Descricao:                  r.Descricao,
			Valor:                      r.Valor,
			CategoriaID:                cat.ID,
			SubcategoriaInvestimentoID: subcatID,
			FinanciamentoID:            finID,
			MesInicio:                  r.MesInicio,
			AnoInicio:                  r.AnoInicio,
			Parcelas:                   r.Parcelas,
			Recorrente:                 r.Recorrente,
		}

		if err := d.Validate(); err != nil {
			return nil, fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
		}
		despesas[i] = d
	}

	if err := uc.repo.BulkCreate(ctx, despesas); err != nil {
		return nil, err
	}

	res := make([]*dto.DespesaResponse, len(despesas))
	for i, d := range despesas {
		resp, err := uc.toResponse(ctx, d)
		if err != nil {
			return nil, err
		}
		res[i] = resp
	}
	return res, nil
}

// Helpers for resolution
func (uc *DespesaUseCase) resolveOrCreateCategory(ctx context.Context, name string) (*entity.Categoria, error) {
	cat, err := uc.catRepo.GetByNome(ctx, name)
	if err != nil {
		if errors.Is(err, domainErr.ErrNotFound) {
			// Create category dynamically
			c := &entity.Categoria{
				ID:       uuid.New(),
				Nome:     name,
				Cor:      "#64748b", // slate hex color
				IsSystem: false,
			}
			if err := uc.catRepo.Create(ctx, c); err != nil {
				return nil, err
			}
			return c, nil
		}
		return nil, err
	}
	return cat, nil
}

func (uc *DespesaUseCase) resolveOrCreateSubcategory(ctx context.Context, name *string) (*uuid.UUID, error) {
	if name == nil || *name == "" {
		return nil, nil
	}

	subcat, err := uc.catRepo.GetInvestimentoByNome(ctx, *name)
	if err != nil {
		if errors.Is(err, domainErr.ErrNotFound) {
			sc := &entity.CategoriaInvestimento{
				ID:       uuid.New(),
				Nome:     *name,
				IsSystem: false,
			}
			if err := uc.catRepo.CreateInvestimento(ctx, sc); err != nil {
				return nil, err
			}
			return &sc.ID, nil
		}
		return nil, err
	}
	return &subcat.ID, nil
}

func (uc *DespesaUseCase) resolveFinanciamento(ctx context.Context, finIDStr *string) (*uuid.UUID, error) {
	if finIDStr == nil || *finIDStr == "" || *finIDStr == "null" {
		return nil, nil
	}

	id, err := uuid.Parse(*finIDStr)
	if err != nil {
		return nil, nil // Return nil UUID if string is not a valid UUID format (fail-safe)
	}

	// Verify it exists in db
	_, err = uc.finRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, domainErr.ErrNotFound) {
			return nil, nil // Silently ignore non-existing financing link to keep system resilient
		}
		return nil, err
	}

	return &id, nil
}

func (uc *DespesaUseCase) toResponse(ctx context.Context, d *entity.Despesa) (*dto.DespesaResponse, error) {
	// We need to resolve Categoria name
	var catName string
	// Query categories, this is usually fast because database query uses B-Tree
	// In production, we might load them in memory cache, but since connection is local it's fast
	cats, err := uc.catRepo.GetAll(ctx)
	if err == nil {
		for _, c := range cats {
			if c.ID == d.CategoriaID {
				catName = c.Nome
				break
			}
		}
	}

	var subcatName *string
	if d.SubcategoriaInvestimentoID != nil {
		invs, err := uc.catRepo.GetAllInvestimento(ctx)
		if err == nil {
			for _, inv := range invs {
				if inv.ID == *d.SubcategoriaInvestimentoID {
					nameCopy := inv.Nome
					subcatName = &nameCopy
					break
				}
			}
		}
	}

	var subcatIDStr *string
	if d.SubcategoriaInvestimentoID != nil {
		idStr := d.SubcategoriaInvestimentoID.String()
		subcatIDStr = &idStr
	}

	var finIDStr *string
	if d.FinanciamentoID != nil {
		idStr := d.FinanciamentoID.String()
		finIDStr = &idStr
	}

	return &dto.DespesaResponse{
		ID:                         d.ID.String(),
		PerfilID:                   d.PerfilID.String(),
		Descricao:                  d.Descricao,
		Valor:                      d.Valor,
		CategoriaID:                d.CategoriaID.String(),
		Categoria:                  catName,
		SubcategoriaInvestimentoID: subcatIDStr,
		SubcategoriaInvestimento:   subcatName,
		FinanciamentoID:            finIDStr,
		MesInicio:                  d.MesInicio,
		AnoInicio:                  d.AnoInicio,
		Parcelas:                   d.Parcelas,
		Recorrente:                 d.Recorrente,
		CreatedAt:                  d.CreatedAt.Format(time.RFC3339),
		UpdatedAt:                  d.UpdatedAt.Format(time.RFC3339),
	}, nil
}
