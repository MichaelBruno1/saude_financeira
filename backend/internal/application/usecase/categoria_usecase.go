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

type CategoriaUseCase struct {
	repo repository.CategoriaRepository
}

func NewCategoriaUseCase(repo repository.CategoriaRepository) *CategoriaUseCase {
	return &CategoriaUseCase{repo: repo}
}

func (uc *CategoriaUseCase) CreateCategoria(ctx context.Context, req dto.CreateCategoriaRequest) (*dto.CategoriaResponse, error) {
	existing, err := uc.repo.GetByNome(ctx, req.Nome)
	if err == nil && existing != nil {
		return nil, domainErr.ErrAlreadyExists
	}
	if err != nil && !errors.Is(err, domainErr.ErrNotFound) {
		return nil, fmt.Errorf("failed checking existing category: %w", err)
	}

	c := &entity.Categoria{
		ID:       uuid.New(),
		Nome:     req.Nome,
		Cor:      req.Cor,
		IsSystem: false,
	}

	if err := c.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	if err := uc.repo.Create(ctx, c); err != nil {
		return nil, err
	}

	return uc.toResponse(c), nil
}

func (uc *CategoriaUseCase) GetAll(ctx context.Context) ([]*dto.CategoriaResponse, error) {
	categorias, err := uc.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.CategoriaResponse, len(categorias))
	for i, c := range categorias {
		res[i] = uc.toResponse(c)
	}
	return res, nil
}

func (uc *CategoriaUseCase) UpdateCor(ctx context.Context, id uuid.UUID, cor string) error {
	c := &entity.Categoria{ID: id, Cor: cor, Nome: "dummy"} // dummy name just to validate color
	if err := c.Validate(); err != nil {
		return fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}
	return uc.repo.UpdateCor(ctx, id, cor)
}

func (uc *CategoriaUseCase) CreateCategoriaInvestimento(ctx context.Context, req dto.CreateCategoriaInvestimentoRequest) (*dto.CategoriaInvestimentoResponse, error) {
	existing, err := uc.repo.GetInvestimentoByNome(ctx, req.Nome)
	if err == nil && existing != nil {
		return nil, domainErr.ErrAlreadyExists
	}
	if err != nil && !errors.Is(err, domainErr.ErrNotFound) {
		return nil, fmt.Errorf("failed checking existing investment category: %w", err)
	}

	ci := &entity.CategoriaInvestimento{
		ID:       uuid.New(),
		Nome:     req.Nome,
		IsSystem: false,
	}

	if err := ci.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	if err := uc.repo.CreateInvestimento(ctx, ci); err != nil {
		return nil, err
	}

	return uc.toInvResponse(ci), nil
}

func (uc *CategoriaUseCase) GetAllInvestimento(ctx context.Context) ([]*dto.CategoriaInvestimentoResponse, error) {
	categorias, err := uc.repo.GetAllInvestimento(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.CategoriaInvestimentoResponse, len(categorias))
	for i, c := range categorias {
		res[i] = uc.toInvResponse(c)
	}
	return res, nil
}

func (uc *CategoriaUseCase) toResponse(c *entity.Categoria) *dto.CategoriaResponse {
	return &dto.CategoriaResponse{
		ID:        c.ID.String(),
		Nome:      c.Nome,
		Cor:       c.Cor,
		IsSystem:  c.IsSystem,
		CreatedAt: c.CreatedAt.Format(time.RFC3339),
	}
}

func (uc *CategoriaUseCase) toInvResponse(c *entity.CategoriaInvestimento) *dto.CategoriaInvestimentoResponse {
	return &dto.CategoriaInvestimentoResponse{
		ID:        c.ID.String(),
		Nome:      c.Nome,
		IsSystem:  c.IsSystem,
		CreatedAt: c.CreatedAt.Format(time.RFC3339),
	}
}
