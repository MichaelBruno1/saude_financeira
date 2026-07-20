package usecase

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

type FinanciamentoUseCase struct {
	repo       repository.FinanciamentoRepository
	perfilRepo repository.PerfilRepository
}

func NewFinanciamentoUseCase(repo repository.FinanciamentoRepository, perfilRepo repository.PerfilRepository) *FinanciamentoUseCase {
	return &FinanciamentoUseCase{
		repo:       repo,
		perfilRepo: perfilRepo,
	}
}

func (uc *FinanciamentoUseCase) CreateFinanciamento(ctx context.Context, perfilID uuid.UUID, req dto.CreateFinanciamentoRequest) (*dto.FinanciamentoResponse, error) {
	// Verify profile existence
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	f := &entity.Financiamento{
		ID:             uuid.New(),
		PerfilID:       perfilID,
		Nome:           req.Nome,
		ValorTotal:     req.ValorTotal,
		ValorParcela:   req.ValorParcela,
		ParcelasTotais: req.ParcelasTotais,
		TaxaTR:         req.TaxaTR,
		MesInicio:      req.MesInicio,
		AnoInicio:      req.AnoInicio,
		Sistema:        req.Sistema,
		TaxaJurosAnual: req.TaxaJurosAnual,
	}

	if err := f.Validate(); err != nil {
		return nil, fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	if err := uc.repo.Create(ctx, f); err != nil {
		return nil, err
	}

	return uc.toResponse(f), nil
}

func (uc *FinanciamentoUseCase) GetByID(ctx context.Context, id uuid.UUID) (*dto.FinanciamentoResponse, error) {
	f, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return uc.toResponse(f), nil
}

func (uc *FinanciamentoUseCase) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*dto.FinanciamentoResponse, error) {
	// Verify profile existence
	_, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	fins, err := uc.repo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return nil, err
	}

	res := make([]*dto.FinanciamentoResponse, len(fins))
	for i, f := range fins {
		res[i] = uc.toResponse(f)
	}
	return res, nil
}

func (uc *FinanciamentoUseCase) UpdateFinanciamento(ctx context.Context, id uuid.UUID, req dto.UpdateFinanciamentoRequest) error {
	f, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Update fields
	f.Nome = req.Nome
	f.ValorTotal = req.ValorTotal
	f.ValorParcela = req.ValorParcela
	f.ParcelasTotais = req.ParcelasTotais
	f.TaxaTR = req.TaxaTR
	f.MesInicio = req.MesInicio
	f.AnoInicio = req.AnoInicio
	f.Sistema = req.Sistema
	f.TaxaJurosAnual = req.TaxaJurosAnual

	if err := f.Validate(); err != nil {
		return fmt.Errorf("%w: %s", domainErr.ErrValidation, err.Error())
	}

	return uc.repo.Update(ctx, f)
}

func (uc *FinanciamentoUseCase) DeleteFinanciamento(ctx context.Context, id uuid.UUID) error {
	_, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return uc.repo.Delete(ctx, id)
}

func (uc *FinanciamentoUseCase) toResponse(f *entity.Financiamento) *dto.FinanciamentoResponse {
	return &dto.FinanciamentoResponse{
		ID:             f.ID.String(),
		PerfilID:       f.PerfilID.String(),
		Nome:           f.Nome,
		ValorTotal:     f.ValorTotal,
		ValorParcela:   f.ValorParcela,
		ParcelasTotais: f.ParcelasTotais,
		TaxaTR:         f.TaxaTR,
		MesInicio:      f.MesInicio,
		AnoInicio:      f.AnoInicio,
		Sistema:        f.Sistema,
		TaxaJurosAnual: f.TaxaJurosAnual,
		CreatedAt:      f.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      f.UpdatedAt.Format(time.RFC3339),
	}
}
