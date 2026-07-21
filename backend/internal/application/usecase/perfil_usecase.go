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

type PerfilUseCase struct {
	repo repository.PerfilRepository
}

func NewPerfilUseCase(repo repository.PerfilRepository) *PerfilUseCase {
	return &PerfilUseCase{repo: repo}
}

func (uc *PerfilUseCase) CreatePerfil(ctx context.Context, req dto.CreatePerfilRequest) (*dto.PerfilResponse, error) {
	// Check if already exists case-insensitive
	existing, err := uc.repo.GetByNome(ctx, req.Nome)
	if err == nil && existing != nil {
		return nil, domainErr.ErrAlreadyExists
	}
	if err != nil && !errors.Is(err, domainErr.ErrNotFound) {
		return nil, fmt.Errorf("failed checking existing profile: %w", err)
	}

	p := &entity.Perfil{
		ID:      uuid.New(),
		Nome:    req.Nome,
		Salario: req.Salario,
	}

	if err := p.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	if err := uc.repo.Create(ctx, p); err != nil {
		return nil, err
	}

	return uc.toResponse(p), nil
}

func (uc *PerfilUseCase) GetByID(ctx context.Context, id uuid.UUID) (*dto.PerfilResponse, error) {
	p, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return uc.toResponse(p), nil
}

func (uc *PerfilUseCase) GetAll(ctx context.Context) ([]*dto.PerfilResponse, error) {
	perfis, err := uc.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.PerfilResponse, len(perfis))
	for i, p := range perfis {
		res[i] = uc.toResponse(p)
	}
	return res, nil
}

func (uc *PerfilUseCase) UpdateSalario(ctx context.Context, id uuid.UUID, salario float64) error {
	p, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	p.Salario = salario
	if err := p.Validate(); err != nil {
		return fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	return uc.repo.Update(ctx, p)
}

func (uc *PerfilUseCase) UpdateFGTS(ctx context.Context, id uuid.UUID, fgts float64) error {
	p, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	p.FGTS = fgts
	if err := p.Validate(); err != nil {
		return fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	return uc.repo.Update(ctx, p)
}

func (uc *PerfilUseCase) DeletePerfil(ctx context.Context, id uuid.UUID) error {
	// Verifies existence first
	_, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return uc.repo.Delete(ctx, id)
}

func (uc *PerfilUseCase) toResponse(p *entity.Perfil) *dto.PerfilResponse {
	return &dto.PerfilResponse{
		ID:           p.ID.String(),
		Nome:         p.Nome,
		Salario:      p.Salario,
		FGTS:         p.FGTS,
		MetaBaseline: p.MetaBaseline,
		CreatedAt:    p.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    p.UpdatedAt.Format(time.RFC3339),
	}
}
