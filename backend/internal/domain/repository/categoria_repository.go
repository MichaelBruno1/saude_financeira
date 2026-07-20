package repository

import (
	"context"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
)

type CategoriaRepository interface {
	Create(ctx context.Context, categoria *entity.Categoria) error
	GetAll(ctx context.Context) ([]*entity.Categoria, error)
	GetByNome(ctx context.Context, nome string) (*entity.Categoria, error)
	UpdateCor(ctx context.Context, id uuid.UUID, cor string) error

	CreateInvestimento(ctx context.Context, catInv *entity.CategoriaInvestimento) error
	GetAllInvestimento(ctx context.Context) ([]*entity.CategoriaInvestimento, error)
	GetInvestimentoByNome(ctx context.Context, nome string) (*entity.CategoriaInvestimento, error)
}
