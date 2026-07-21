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

type FinanciamentoPostgres struct {
	db *sql.DB
}

func NewFinanciamentoPostgres(db *sql.DB) *FinanciamentoPostgres {
	return &FinanciamentoPostgres{db: db}
}

func (r *FinanciamentoPostgres) Create(ctx context.Context, f *entity.Financiamento) error {
	query := `
		INSERT INTO financiamentos (
			id, perfil_id, nome, valor_total, valor_parcela, parcelas_totais,
			taxa_tr, mes_inicio, ano_inicio, sistema, taxa_juros_anual, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}

	err := r.db.QueryRowContext(ctx, query,
		f.ID, f.PerfilID, f.Nome, f.ValorTotal, f.ValorParcela, f.ParcelasTotais,
		f.TaxaTR, f.MesInicio, f.AnoInicio, f.Sistema, f.TaxaJurosAnual,
	).Scan(&f.ID, &f.CreatedAt, &f.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create financiamento: %w", err)
	}
	return nil
}

func (r *FinanciamentoPostgres) GetByID(ctx context.Context, id uuid.UUID) (*entity.Financiamento, error) {
	query := `
		SELECT id, perfil_id, nome, valor_total, valor_parcela, parcelas_totais,
		       taxa_tr, mes_inicio, ano_inicio, sistema, taxa_juros_anual, created_at, updated_at
		FROM financiamentos
		WHERE id = $1
	`
	f := &entity.Financiamento{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&f.ID, &f.PerfilID, &f.Nome, &f.ValorTotal, &f.ValorParcela, &f.ParcelasTotais,
		&f.TaxaTR, &f.MesInicio, &f.AnoInicio, &f.Sistema, &f.TaxaJurosAnual, &f.CreatedAt, &f.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get financiamento by id: %w", err)
	}
	return f, nil
}

func (r *FinanciamentoPostgres) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Financiamento, error) {
	query := `
		SELECT id, perfil_id, nome, valor_total, valor_parcela, parcelas_totais,
		       taxa_tr, mes_inicio, ano_inicio, sistema, taxa_juros_anual, created_at, updated_at
		FROM financiamentos
		WHERE perfil_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, perfilID)
	if err != nil {
		return nil, fmt.Errorf("failed to query financiamentos by perfil: %w", err)
	}
	defer rows.Close()

	var fin []*entity.Financiamento
	for rows.Next() {
		f := &entity.Financiamento{}
		err := rows.Scan(
			&f.ID, &f.PerfilID, &f.Nome, &f.ValorTotal, &f.ValorParcela, &f.ParcelasTotais,
			&f.TaxaTR, &f.MesInicio, &f.AnoInicio, &f.Sistema, &f.TaxaJurosAnual, &f.CreatedAt, &f.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan financiamento: %w", err)
		}
		fin = append(fin, f)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return fin, nil
}

func (r *FinanciamentoPostgres) Update(ctx context.Context, f *entity.Financiamento) error {
	query := `
		UPDATE financiamentos
		SET nome = $1, valor_total = $2, valor_parcela = $3, parcelas_totais = $4,
		    taxa_tr = $5, mes_inicio = $6, ano_inicio = $7, sistema = $8, taxa_juros_anual = $9, updated_at = NOW()
		WHERE id = $10
	`
	res, err := r.db.ExecContext(ctx, query,
		f.Nome, f.ValorTotal, f.ValorParcela, f.ParcelasTotais,
		f.TaxaTR, f.MesInicio, f.AnoInicio, f.Sistema, f.TaxaJurosAnual, f.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to update financiamento: %w", err)
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

func (r *FinanciamentoPostgres) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM financiamentos
		WHERE id = $1
	`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete financiamento: %w", err)
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

func (r *FinanciamentoPostgres) DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error {
	query := `
		DELETE FROM financiamentos
		WHERE perfil_id = $1
	`
	_, err := r.db.ExecContext(ctx, query, perfilID)
	if err != nil {
		return fmt.Errorf("failed to delete financiamentos by perfil: %w", err)
	}
	return nil
}
