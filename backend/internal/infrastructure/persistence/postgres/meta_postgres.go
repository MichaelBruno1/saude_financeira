package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

type MetaPostgres struct {
	db *sql.DB
}

func NewMetaPostgres(db *sql.DB) *MetaPostgres {
	return &MetaPostgres{db: db}
}

func (r *MetaPostgres) Create(ctx context.Context, m *entity.Meta) error {
	query := `
		INSERT INTO metas (
			id, perfil_id, nome, valor, foto, comprado, prioridade, valor_target, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}

	err := r.db.QueryRowContext(ctx, query,
		m.ID, m.PerfilID, m.Nome, m.Valor, m.Foto, m.Comprado, m.Prioridade, m.ValorTarget,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create meta: %w", err)
	}
	return nil
}

func (r *MetaPostgres) GetByID(ctx context.Context, id uuid.UUID) (*entity.Meta, error) {
	query := `
		SELECT id, perfil_id, nome, valor, foto, comprado, prioridade, valor_target, created_at, updated_at
		FROM metas
		WHERE id = $1
	`
	m := &entity.Meta{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&m.ID, &m.PerfilID, &m.Nome, &m.Valor, &m.Foto, &m.Comprado, &m.Prioridade, &m.ValorTarget, &m.CreatedAt, &m.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get meta by id: %w", err)
	}
	return m, nil
}

func (r *MetaPostgres) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Meta, error) {
	query := `
		SELECT id, perfil_id, nome, valor, foto, comprado, prioridade, valor_target, created_at, updated_at
		FROM metas
		WHERE perfil_id = $1
		ORDER BY prioridade ASC, created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, perfilID)
	if err != nil {
		return nil, fmt.Errorf("failed to query metas by perfil: %w", err)
	}
	defer rows.Close()

	var metas []*entity.Meta
	for rows.Next() {
		m := &entity.Meta{}
		err := rows.Scan(
			&m.ID, &m.PerfilID, &m.Nome, &m.Valor, &m.Foto, &m.Comprado, &m.Prioridade, &m.ValorTarget, &m.CreatedAt, &m.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan meta: %w", err)
		}
		metas = append(metas, m)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return metas, nil
}

func (r *MetaPostgres) Update(ctx context.Context, m *entity.Meta) error {
	query := `
		UPDATE metas
		SET nome = $1, valor = $2, foto = $3, comprado = $4, prioridade = $5, valor_target = $6, updated_at = NOW()
		WHERE id = $7
	`
	res, err := r.db.ExecContext(ctx, query,
		m.Nome, m.Valor, m.Foto, m.Comprado, m.Prioridade, m.ValorTarget, m.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update meta: %w", err)
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

func (r *MetaPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM metas
		WHERE id = $1
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete meta: %w", err)
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

func (r *MetaPostgres) BulkUpdatePrioridades(ctx context.Context, updates []repository.MetaPrioridadeUpdate) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		UPDATE metas
		SET prioridade = $1, updated_at = NOW()
		WHERE id = $2
	`
	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, update := range updates {
		_, err := stmt.ExecContext(ctx, update.Prioridade, update.ID)
		if err != nil {
			return fmt.Errorf("failed to update meta prioridade: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}

func (r *MetaPostgres) BulkUpdateTargets(ctx context.Context, updates []repository.MetaTargetUpdate) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	query := `
		UPDATE metas
		SET valor_target = $1, updated_at = NOW()
		WHERE id = $2
	`
	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, update := range updates {
		_, err := stmt.ExecContext(ctx, update.ValorTarget, update.ID)
		if err != nil {
			return fmt.Errorf("failed to update meta target: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	return nil
}
