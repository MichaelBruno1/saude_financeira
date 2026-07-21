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

type DespesaPostgres struct {
	db *sql.DB
}

func NewDespesaPostgres(db *sql.DB) *DespesaPostgres {
	return &DespesaPostgres{db: db}
}

func (r *DespesaPostgres) Create(ctx context.Context, d *entity.Despesa) error {
	query := `
		INSERT INTO despesas (
			id, perfil_id, descricao, valor, categoria_id, subcategoria_investimento_id,
			financiamento_id, mes_inicio, ano_inicio, parcelas, recorrente, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}

	err := r.db.QueryRowContext(ctx, query,
		d.ID, d.PerfilID, d.Descricao, d.Valor, d.CategoriaID, d.SubcategoriaInvestimentoID,
		d.FinanciamentoID, d.MesInicio, d.AnoInicio, d.Parcelas, d.Recorrente,
	).Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create despesa: %w", err)
	}
	return nil
}

func (r *DespesaPostgres) GetByID(ctx context.Context, id uuid.UUID) (*entity.Despesa, error) {
	query := `
		SELECT id, perfil_id, descricao, valor, categoria_id, subcategoria_investimento_id,
		       financiamento_id, mes_inicio, ano_inicio, parcelas, recorrente, created_at, updated_at
		FROM despesas
		WHERE id = $1
	`
	d := &entity.Despesa{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&d.ID, &d.PerfilID, &d.Descricao, &d.Valor, &d.CategoriaID, &d.SubcategoriaInvestimentoID,
		&d.FinanciamentoID, &d.MesInicio, &d.AnoInicio, &d.Parcelas, &d.Recorrente, &d.CreatedAt, &d.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get despesa by id: %w", err)
	}
	return d, nil
}

func (r *DespesaPostgres) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Despesa, error) {
	query := `
		SELECT id, perfil_id, descricao, valor, categoria_id, subcategoria_investimento_id,
		       financiamento_id, mes_inicio, ano_inicio, parcelas, recorrente, created_at, updated_at
		FROM despesas
		WHERE perfil_id = $1
		ORDER BY ano_inicio DESC, mes_inicio DESC, created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, perfilID)
	if err != nil {
		return nil, fmt.Errorf("failed to query despesas by perfil: %w", err)
	}
	defer rows.Close()

	var despesas []*entity.Despesa
	for rows.Next() {
		d := &entity.Despesa{}
		err := rows.Scan(
			&d.ID, &d.PerfilID, &d.Descricao, &d.Valor, &d.CategoriaID, &d.SubcategoriaInvestimentoID,
			&d.FinanciamentoID, &d.MesInicio, &d.AnoInicio, &d.Parcelas, &d.Recorrente, &d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan despesa: %w", err)
		}
		despesas = append(despesas, d)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return despesas, nil
}

func (r *DespesaPostgres) Update(ctx context.Context, d *entity.Despesa) error {
	query := `
		UPDATE despesas
		SET descricao = $1, valor = $2, categoria_id = $3, subcategoria_investimento_id = $4,
		    financiamento_id = $5, mes_inicio = $6, ano_inicio = $7, parcelas = $8, recorrente = $9, updated_at = NOW()
		WHERE id = $10
	`
	res, err := r.db.ExecContext(ctx, query,
		d.Descricao, d.Valor, d.CategoriaID, d.SubcategoriaInvestimentoID,
		d.FinanciamentoID, d.MesInicio, d.AnoInicio, d.Parcelas, d.Recorrente, d.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update despesa: %w", err)
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

func (r *DespesaPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM despesas
		WHERE id = $1
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete despesa: %w", err)
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

func (r *DespesaPostgres) DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error {
	query := `
		DELETE FROM despesas
		WHERE perfil_id = $1
	`
	_, err := r.db.ExecContext(ctx, query, perfilID)
	if err != nil {
		return fmt.Errorf("failed to delete despesas by perfil: %w", err)
	}
	return nil
}

func (r *DespesaPostgres) BulkCreate(ctx context.Context, despesas []*entity.Despesa) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to start transaction for bulk create: %w", err)
	}
	defer tx.Rollback()

	query := `
		INSERT INTO despesas (
			id, perfil_id, descricao, valor, categoria_id, subcategoria_investimento_id,
			financiamento_id, mes_inicio, ano_inicio, parcelas, recorrente, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
	`
	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, d := range despesas {
		if d.ID == uuid.Nil {
			d.ID = uuid.New()
		}
		_, err := stmt.ExecContext(ctx,
			d.ID, d.PerfilID, d.Descricao, d.Valor, d.CategoriaID, d.SubcategoriaInvestimentoID,
			d.FinanciamentoID, d.MesInicio, d.AnoInicio, d.Parcelas, d.Recorrente,
		)
		if err != nil {
			return fmt.Errorf("failed to insert bulk despesa: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit bulk transaction: %w", err)
	}
	return nil
}
