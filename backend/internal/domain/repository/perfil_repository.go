package repository

import (
	"context"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
)

type PerfilRepository interface {
	Create(ctx context.Context, perfil *entity.Perfil) error
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Perfil, error)
	GetByNome(ctx context.Context, nome string) (*entity.Perfil, error)
	GetAll(ctx context.Context) ([]*entity.Perfil, error)
	Update(ctx context.Context, perfil *entity.Perfil) error
	Delete(ctx context.Context, id uuid.UUID) error
}
