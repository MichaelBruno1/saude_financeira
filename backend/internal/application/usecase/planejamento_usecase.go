package usecase

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

type PlanejamentoUseCase struct {
	repo    repository.PlanejamentoRepository
	catRepo repository.CategoriaRepository
}

func NewPlanejamentoUseCase(repo repository.PlanejamentoRepository, catRepo repository.CategoriaRepository) *PlanejamentoUseCase {
	return &PlanejamentoUseCase{
		repo:    repo,
		catRepo: catRepo,
	}
}

func (uc *PlanejamentoUseCase) GetPlanejamento(ctx context.Context) ([]*dto.PlanejamentoResponse, error) {
	limits, err := uc.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Fetch all categories to map IDs to Names
	cats, err := uc.catRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	catMap := make(map[uuid.UUID]string)
	for _, c := range cats {
		catMap[c.ID] = c.Nome
	}

	// Group by Method
	grouped := make(map[string]map[string]float64)
	methods := []string{"Conservador", "Equilibrado", "Agressivo", "Personalizado"}
	for _, m := range methods {
		grouped[m] = make(map[string]float64)
	}

	for _, limit := range limits {
		catName, ok := catMap[limit.CategoriaID]
		if !ok {
			continue // Skip if category not found
		}
		if _, ok := grouped[limit.Metodo]; !ok {
			grouped[limit.Metodo] = make(map[string]float64)
		}
		grouped[limit.Metodo][catName] = limit.Percentual
	}

	res := make([]*dto.PlanejamentoResponse, 0, len(grouped))
	for m, limites := range grouped {
		res = append(res, &dto.PlanejamentoResponse{
			Metodo:  m,
			Limites: limites,
		})
	}

	return res, nil
}

func (uc *PlanejamentoUseCase) UpdatePlanejamento(ctx context.Context, metodo string, req dto.UpdatePlanejamentoRequest) error {
	if metodo != "Conservador" && metodo != "Equilibrado" && metodo != "Agressivo" && !strings.HasPrefix(metodo, "Personalizado") {
		return fmt.Errorf("%w: invalid planning method", domainErr.ErrInvalidInput)
	}

	// 1. Verify percentage sum <= 100
	totalPercent := 0.0
	for _, pct := range req.Limites {
		if pct < 0 || pct > 100 {
			return fmt.Errorf("%w: percentual must be between 0 and 100", domainErr.ErrValidation)
		}
		totalPercent += pct
	}

	if totalPercent > 100.0 {
		return fmt.Errorf("%w: total percentage limit cannot exceed 100%%, got %.2f%%", domainErr.ErrValidation, totalPercent)
	}

	// 2. Clear current limits for this method to prevent orphans
	if err := uc.repo.DeleteByMetodo(ctx, metodo); err != nil {
		return err
	}

	// 3. Insert new limits
	for catName, percent := range req.Limites {
		// Resolve category
		cat, err := uc.catRepo.GetByNome(ctx, catName)
		if err != nil {
			if errors.Is(err, domainErr.ErrNotFound) {
				// Create dynamically
				cat = &entity.Categoria{
					ID:       uuid.New(),
					Nome:     catName,
					Cor:      "#64748b",
					IsSystem: false,
				}
				if err := uc.catRepo.Create(ctx, cat); err != nil {
					return err
				}
			} else {
				return err
			}
		}

		pl := &entity.Planejamento{
			ID:          uuid.New(),
			Metodo:      metodo,
			CategoriaID: cat.ID,
			Percentual:  percent,
		}

		if err := uc.repo.Create(ctx, pl); err != nil {
			return err
		}
	}

	return nil
}
