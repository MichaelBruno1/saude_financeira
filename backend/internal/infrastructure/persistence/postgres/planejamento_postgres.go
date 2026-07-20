package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
)

type PlanejamentoPostgres struct {
	db *sql.DB
}

func NewPlanejamentoPostgres(db *sql.DB) *PlanejamentoPostgres {
	return &PlanejamentoPostgres{db: db}
}

func (r *PlanejamentoPostgres) Create(ctx context.Context, pl *entity.Planejamento) error {
	query := `
		INSERT INTO planejamento (id, metodo, categoria_id, percentual, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (metodo, categoria_id) DO UPDATE
		SET percentual = EXCLUDED.percentual, updated_at = NOW()
		RETURNING id, updated_at
	`
	if pl.ID == uuid.Nil {
		pl.ID = uuid.New()
	}

	err := r.db.QueryRowContext(ctx, query,
		pl.ID,
		pl.Metodo,
		pl.CategoriaID,
		pl.Percentual,
	).Scan(&pl.ID, &pl.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create or update planejamento: %w", err)
	}
	return nil
}

func (r *PlanejamentoPostgres) GetByMetodo(ctx context.Context, metodo string) ([]*entity.Planejamento, error) {
	query := `
		SELECT id, metodo, categoria_id, percentual, updated_at
		FROM planejamento
		WHERE metodo = $1
	`
	rows, err := r.db.QueryContext(ctx, query, metodo)
	if err != nil {
		return nil, fmt.Errorf("failed to query planejamento by metodo: %w", err)
	}
	defer rows.Close()

	var limits []*entity.Planejamento
	for rows.Next() {
		pl := &entity.Planejamento{}
		err := rows.Scan(
			&pl.ID,
			&pl.Metodo,
			&pl.CategoriaID,
			&pl.Percentual,
			&pl.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan planejamento: %w", err)
		}
		limits = append(limits, pl)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return limits, nil
}

func (r *PlanejamentoPostgres) GetAll(ctx context.Context) ([]*entity.Planejamento, error) {
	query := `
		SELECT id, metodo, categoria_id, percentual, updated_at
		FROM planejamento
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all planejamento: %w", err)
	}
	defer rows.Close()

	var limits []*entity.Planejamento
	for rows.Next() {
		pl := &entity.Planejamento{}
		err := rows.Scan(
			&pl.ID,
			&pl.Metodo,
			&pl.CategoriaID,
			&pl.Percentual,
			&pl.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan planejamento: %w", err)
		}
		limits = append(limits, pl)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return limits, nil
}

func (r *PlanejamentoPostgres) UpdatePercentual(ctx context.Context, metodo string, categoriaID uuid.UUID, percentual float64) error {
	query := `
		INSERT INTO planejamento (id, metodo, categoria_id, percentual, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (metodo, categoria_id) DO UPDATE
		SET percentual = EXCLUDED.percentual, updated_at = NOW()
	`
	id := uuid.New()
	_, err := r.db.ExecContext(ctx, query, id, metodo, categoriaID, percentual)
	if err != nil {
		return fmt.Errorf("failed to update percentual: %w", err)
	}
	return nil
}

func (r *PlanejamentoPostgres) DeleteByMetodo(ctx context.Context, metodo string) error {
	query := `
		DELETE FROM planejamento
		WHERE metodo = $1
	`
	_, err := r.db.ExecContext(ctx, query, metodo)
	if err != nil {
		return fmt.Errorf("failed to delete limits by metodo: %w", err)
	}
	return nil
}
