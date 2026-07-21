package repository

import (
	"context"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
)

type FinanciamentoRepository interface {
	Create(ctx context.Context, financiamento *entity.Financiamento) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Financiamento, error)
	GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Financiamento, error)
	Update(ctx context.Context, financiamento *entity.Financiamento) error
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error
}
