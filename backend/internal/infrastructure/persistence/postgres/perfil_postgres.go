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

type PerfilPostgres struct {
	db *sql.DB
}

func NewPerfilPostgres(db *sql.DB) *PerfilPostgres {
	return &PerfilPostgres{db: db}
}

func (r *PerfilPostgres) Create(ctx context.Context, perfil *entity.Perfil) error {
	query := `
		INSERT INTO perfis (id, nome, salario, fgts, meta_baseline, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	if perfil.ID == uuid.Nil {
		perfil.ID = uuid.New()
	}

	err := r.db.QueryRowContext(ctx, query,
		perfil.ID,
		perfil.Nome,
		perfil.Salario,
		perfil.FGTS,
		perfil.MetaBaseline,
	).Scan(&perfil.ID, &perfil.CreatedAt, &perfil.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create perfil: %w", err)
	}
	return nil
}

func (r *PerfilPostgres) GetByID(ctx context.Context, id uuid.UUID) (*entity.Perfil, error) {
	query := `
		SELECT id, nome, salario, fgts, meta_baseline, created_at, updated_at
		FROM perfis
		WHERE id = $1
	`
	perfil := &entity.Perfil{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&perfil.ID,
		&perfil.Nome,
		&perfil.Salario,
		&perfil.FGTS,
		&perfil.MetaBaseline,
		&perfil.CreatedAt,
		&perfil.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get perfil by id: %w", err)
	}
	return perfil, nil
}

func (r *PerfilPostgres) GetByNome(ctx context.Context, nome string) (*entity.Perfil, error) {
	query := `
		SELECT id, nome, salario, fgts, meta_baseline, created_at, updated_at
		FROM perfis
		WHERE LOWER(nome) = LOWER($1)
	`
	perfil := &entity.Perfil{}
	err := r.db.QueryRowContext(ctx, query, nome).Scan(
		&perfil.ID,
		&perfil.Nome,
		&perfil.Salario,
		&perfil.FGTS,
		&perfil.MetaBaseline,
		&perfil.CreatedAt,
		&perfil.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get perfil by nome: %w", err)
	}
	return perfil, nil
}

func (r *PerfilPostgres) GetAll(ctx context.Context) ([]*entity.Perfil, error) {
	query := `
		SELECT id, nome, salario, fgts, meta_baseline, created_at, updated_at
		FROM perfis
		ORDER BY nome ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all perfis: %w", err)
	}
	defer rows.Close()

	var perfis []*entity.Perfil
	for rows.Next() {
		perfil := &entity.Perfil{}
		err := rows.Scan(
			&perfil.ID,
			&perfil.Nome,
			&perfil.Salario,
			&perfil.FGTS,
			&perfil.MetaBaseline,
			&perfil.CreatedAt,
			&perfil.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan perfil: %w", err)
		}
		perfis = append(perfis, perfil)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return perfis, nil
}

func (r *PerfilPostgres) Update(ctx context.Context, perfil *entity.Perfil) error {
	query := `
		UPDATE perfis
		SET nome = $1, salario = $2, fgts = $3, meta_baseline = $4, updated_at = NOW()
		WHERE id = $5
	`
	res, err := r.db.ExecContext(ctx, query,
		perfil.Nome,
		perfil.Salario,
		perfil.FGTS,
		perfil.MetaBaseline,
		perfil.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update perfil: %w", err)
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

func (r *PerfilPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM perfis
		WHERE id = $1
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete perfil: %w", err)
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
