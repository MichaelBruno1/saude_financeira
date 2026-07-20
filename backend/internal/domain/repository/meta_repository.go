package repository

import (
	"context"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
)

type MetaPrioridadeUpdate struct {
	ID         uuid.UUID
	Prioridade int
}

type MetaTargetUpdate struct {
	ID          uuid.UUID
	ValorTarget float64
}

type MetaRepository interface {
	Create(ctx context.Context, meta *entity.Meta) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Meta, error)
	GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Meta, error)
	Update(ctx context.Context, meta *entity.Meta) error
	Delete(ctx context.Context, id uuid.UUID) error
	BulkUpdatePrioridades(ctx context.Context, updates []MetaPrioridadeUpdate) error
	BulkUpdateTargets(ctx context.Context, updates []MetaTargetUpdate) error
}
