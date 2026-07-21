package repository

import (
	"context"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
)

type DespesaRepository interface {
	Create(ctx context.Context, despesa *entity.Despesa) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Despesa, error)
	GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Despesa, error)
	Update(ctx context.Context, despesa *entity.Despesa) error
	Delete(ctx context.Context, id uuid.UUID) error
	DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error
	BulkCreate(ctx context.Context, despesas []*entity.Despesa) error
}
