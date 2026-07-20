package repository

import (
	"context"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
)

type PlanejamentoRepository interface {
	GetByMetodo(ctx context.Context, metodo string) ([]*entity.Planejamento, error)
	GetAll(ctx context.Context) ([]*entity.Planejamento, error)
	UpdatePercentual(ctx context.Context, metodo string, categoriaID uuid.UUID, percentual float64) error
	DeleteByMetodo(ctx context.Context, metodo string) error
	Create(ctx context.Context, planejamento *entity.Planejamento) error
}
