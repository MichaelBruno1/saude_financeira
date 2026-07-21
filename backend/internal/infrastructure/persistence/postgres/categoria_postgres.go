package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type CategoriaPostgres struct {
	db *sql.DB
}

func NewCategoriaPostgres(db *sql.DB) *CategoriaPostgres {
	return &CategoriaPostgres{db: db}
}

func (r *CategoriaPostgres) Create(ctx context.Context, categoria *entity.Categoria) error {
	query := `
		INSERT INTO categorias (id, nome, cor, is_system, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id, created_at
	`
	if categoria.ID == uuid.Nil {
		categoria.ID = uuid.New()
	}

	err := r.db.QueryRowContext(ctx, query,
		categoria.ID,
		categoria.Nome,
		categoria.Cor,
		categoria.IsSystem,
	).Scan(&categoria.ID, &categoria.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create categoria: %w", err)
	}
	return nil
}

func (r *CategoriaPostgres) GetAll(ctx context.Context) ([]*entity.Categoria, error) {
	query := `
		SELECT id, nome, cor, is_system, created_at
		FROM categorias
		ORDER BY nome ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all categorias: %w", err)
	}
	defer rows.Close()

	var categorias []*entity.Categoria
	for rows.Next() {
		cat := &entity.Categoria{}
		err := rows.Scan(
			&cat.ID,
			&cat.Nome,
			&cat.Cor,
			&cat.IsSystem,
			&cat.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan categoria: %w", err)
		}
		categorias = append(categorias, cat)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return categorias, nil
}

func (r *CategoriaPostgres) GetByNome(ctx context.Context, nome string) (*entity.Categoria, error) {
	query := `
		SELECT id, nome, cor, is_system, created_at
		FROM categorias
		WHERE LOWER(nome) = LOWER($1)
	`
	cat := &entity.Categoria{}
	err := r.db.QueryRowContext(ctx, query, nome).Scan(
		&cat.ID,
		&cat.Nome,
		&cat.Cor,
		&cat.IsSystem,
		&cat.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get categoria by nome: %w", err)
	}
	return cat, nil
}

func (r *CategoriaPostgres) UpdateCor(ctx context.Context, id uuid.UUID, cor string) error {
	query := `
		UPDATE categorias
		SET cor = $1
		WHERE id = $2
	`
	res, err := r.db.ExecContext(ctx, query, cor, id)
	if err != nil {
		return fmt.Errorf("failed to update categoria cor: %w", err)
	}

	rows, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return domainErr.ErrNotFound
	}
	return nil
}

func (r *CategoriaPostgres) CreateInvestimento(ctx context.Context, catInv *entity.CategoriaInvestimento) error {
	query := `
		INSERT INTO categorias_investimento (id, nome, is_system, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, created_at
	`
	if catInv.ID == uuid.Nil {
		catInv.ID = uuid.New()
	}

	err := r.db.QueryRowContext(ctx, query,
		catInv.ID,
		catInv.Nome,
		catInv.IsSystem,
	).Scan(&catInv.ID, &catInv.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create categoria investimento: %w", err)
	}
	return nil
}

func (r *CategoriaPostgres) GetAllInvestimento(ctx context.Context) ([]*entity.CategoriaInvestimento, error) {
	query := `
		SELECT id, nome, is_system, created_at
		FROM categorias_investimento
		ORDER BY nome ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all categorias investimento: %w", err)
	}
	defer rows.Close()

	var categorias []*entity.CategoriaInvestimento
	for rows.Next() {
		cat := &entity.CategoriaInvestimento{}
		err := rows.Scan(
			&cat.ID,
			&cat.Nome,
			&cat.IsSystem,
			&cat.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan categoria investimento: %w", err)
		}
		categorias = append(categorias, cat)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return categorias, nil
}

func (r *CategoriaPostgres) GetInvestimentoByNome(ctx context.Context, nome string) (*entity.CategoriaInvestimento, error) {
	query := `
		SELECT id, nome, is_system, created_at
		FROM categorias_investimento
		WHERE LOWER(nome) = LOWER($1)
	`
	cat := &entity.CategoriaInvestimento{}
	err := r.db.QueryRowContext(ctx, query, nome).Scan(
		&cat.ID,
		&cat.Nome,
		&cat.IsSystem,
		&cat.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get categoria investimento by nome: %w", err)
	}
	return cat, nil
}
