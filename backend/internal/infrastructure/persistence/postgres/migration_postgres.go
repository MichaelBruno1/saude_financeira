package postgres

import (
	"context"
	"database/sql"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
)

type MigrationPostgres struct {
	db *sql.DB
}

func NewMigrationPostgres(db *sql.DB) *MigrationPostgres {
	return &MigrationPostgres{db: db}
}

func (r *MigrationPostgres) ImportState(ctx context.Context, state *dto.LocalStorageState, uploadsPath string) (*dto.MigrationResult, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback()

	// 1. Clear database tables in order of dependency
	if _, err := tx.ExecContext(ctx, "DELETE FROM despesas"); err != nil {
		return nil, fmt.Errorf("failed to clear despesas: %w", err)
	}
	if _, err := tx.ExecContext(ctx, "DELETE FROM metas"); err != nil {
		return nil, fmt.Errorf("failed to clear metas: %w", err)
	}
	if _, err := tx.ExecContext(ctx, "DELETE FROM financiamentos"); err != nil {
		return nil, fmt.Errorf("failed to clear financiamentos: %w", err)
	}
	if _, err := tx.ExecContext(ctx, "DELETE FROM perfis"); err != nil {
		return nil, fmt.Errorf("failed to clear perfis: %w", err)
	}
	if _, err := tx.ExecContext(ctx, "DELETE FROM categorias WHERE is_system = false"); err != nil {
		return nil, fmt.Errorf("failed to clear custom categorias: %w", err)
	}
	if _, err := tx.ExecContext(ctx, "DELETE FROM categorias_investimento WHERE is_system = false"); err != nil {
		return nil, fmt.Errorf("failed to clear custom investment subcategories: %w", err)
	}

	result := &dto.MigrationResult{
		ValidationPassed: true,
	}

	// 2. Import custom categories
	catMap := make(map[string]uuid.UUID)
	// Fetch system categories first to map them
	rows, err := tx.QueryContext(ctx, "SELECT id, nome FROM categorias")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch categories: %w", err)
	}
	for rows.Next() {
		var id uuid.UUID
		var name string
		if err := rows.Scan(&id, &name); err == nil {
			catMap[strings.ToLower(name)] = id
		}
	}
	rows.Close()

	for catName, catCor := range state.Categorias {
		lowerName := strings.ToLower(catName)
		if id, exists := catMap[lowerName]; exists {
			// Update color if system category
			_, err = tx.ExecContext(ctx, "UPDATE categorias SET cor = $1 WHERE id = $2", catCor, id)
			if err != nil {
				return nil, fmt.Errorf("failed to update category color: %w", err)
			}
		} else {
			// Insert as new custom category
			newID := uuid.New()
			_, err = tx.ExecContext(ctx, "INSERT INTO categorias (id, nome, cor, is_system, created_at) VALUES ($1, $2, $3, false, NOW())", newID, catName, catCor)
			if err != nil {
				return nil, fmt.Errorf("failed to insert custom category: %w", err)
			}
			catMap[lowerName] = newID
			result.CategoriasMigradas++
		}
	}

	// 3. Import Perfis
	profileMap := make(map[string]uuid.UUID)
	for _, p := range state.Perfis {
		newID := uuid.New()
		_, err = tx.ExecContext(ctx, `
			INSERT INTO perfis (id, nome, salario, fgts, meta_baseline, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		`, newID, p.Nome, p.Salario, p.FGTS, p.MetaBaseline)
		if err != nil {
			return nil, fmt.Errorf("failed to import perfil %s: %w", p.Nome, err)
		}
		profileMap[strings.ToLower(p.Nome)] = newID
		result.PerfisMigrados++
	}

	// 4. Import Financiamentos
	finMap := make(map[string]uuid.UUID)
	for _, f := range state.Financiamentos {
		pID, exists := profileMap[strings.ToLower(f.Perfil)]
		if !exists {
			result.OrphansDetectados++
			continue // Skip orphans
		}

		newID := uuid.New()
		sistema := strings.ToLower(f.Sistema)
		if sistema != "sac" && sistema != "price" {
			sistema = "price"
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO financiamentos (
				id, perfil_id, nome, valor_total, valor_parcela, parcelas_totais,
				taxa_tr, mes_inicio, ano_inicio, sistema, taxa_juros_anual, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		`, newID, pID, f.Nome, f.ValorTotal, f.ValorParcela, f.ParcelasTotais,
			f.TaxaTR, f.MesInicio, f.AnoInicio, sistema, f.TaxaJurosAnual)
		if err != nil {
			return nil, fmt.Errorf("failed to import financing %s: %w", f.Nome, err)
		}
		finMap[strings.ToLower(f.ID)] = newID
		result.FinanciamentosMigrados++
	}

	// 5. Import Investment Subcategories
	subcatMap := make(map[string]uuid.UUID)
	// Fetch system investment subcategories first
	rows, err = tx.QueryContext(ctx, "SELECT id, nome FROM categorias_investimento")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch investment categories: %w", err)
	}
	for rows.Next() {
		var id uuid.UUID
		var name string
		if err := rows.Scan(&id, &name); err == nil {
			subcatMap[strings.ToLower(name)] = id
		}
	}
	rows.Close()

	// 6. Import Despesas
	for _, d := range state.Despesas {
		pID, exists := profileMap[strings.ToLower(d.Perfil)]
		if !exists {
			result.OrphansDetectados++
			continue // Skip orphans
		}

		// Resolve category
		catID, exists := catMap[strings.ToLower(d.Categoria)]
		if !exists {
			// Create dynamically
			catID = uuid.New()
			_, err = tx.ExecContext(ctx, "INSERT INTO categorias (id, nome, cor, is_system, created_at) VALUES ($1, $2, '#64748b', false, NOW())", catID, d.Categoria, "#64748b")
			if err != nil {
				return nil, fmt.Errorf("failed to create category %s dynamically: %w", d.Categoria, err)
			}
			catMap[strings.ToLower(d.Categoria)] = catID
			result.CategoriasMigradas++
		}

		// Resolve subcategory
		var subcatID *uuid.UUID
		if d.Subcategoria != nil && *d.Subcategoria != "" {
			nameLower := strings.ToLower(*d.Subcategoria)
			scID, exists := subcatMap[nameLower]
			if !exists {
				// Create dynamically
				scID = uuid.New()
				_, err = tx.ExecContext(ctx, "INSERT INTO categorias_investimento (id, nome, is_system, created_at) VALUES ($1, $2, false, NOW())", scID, *d.Subcategoria)
				if err != nil {
					return nil, fmt.Errorf("failed to create subcategory %s dynamically: %w", *d.Subcategoria, err)
				}
				subcatMap[nameLower] = scID
			}
			subcatID = &scID
		}

		// Resolve financing link
		var finID *uuid.UUID
		if d.FinanciamentoID != nil && *d.FinanciamentoID != "" {
			if fUUID, exists := finMap[strings.ToLower(*d.FinanciamentoID)]; exists {
				finID = &fUUID
			}
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO despesas (
				id, perfil_id, descricao, valor, categoria_id, subcategoria_investimento_id,
				financiamento_id, mes_inicio, ano_inicio, parcelas, recorrente, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		`, uuid.New(), pID, d.Descricao, d.Valor, catID, subcatID, finID, d.MesInicio, d.AnoInicio, d.Parcelas, d.Recorrente)
		if err != nil {
			return nil, fmt.Errorf("failed to import expense %s: %w", d.Descricao, err)
		}
		result.DespesasMigradas++
	}

	// 7. Import Metas
	for _, m := range state.Metas {
		pID, exists := profileMap[strings.ToLower(m.Perfil)]
		if !exists {
			result.OrphansDetectados++
			continue // Skip orphans
		}

		// Decode photo if base64
		var finalFoto *string
		if m.Foto != nil && *m.Foto != "" {
			decoded, err := decodeBase64Image(*m.Foto, uploadsPath)
			if err != nil {
				return nil, fmt.Errorf("failed to decode base64 image: %w", err)
			}
			finalFoto = &decoded
			if strings.HasPrefix(decoded, "/uploads/") {
				result.FotosExtraidas++
			}
		}

		_, err = tx.ExecContext(ctx, `
			INSERT INTO metas (
				id, perfil_id, nome, valor, foto, comprado, prioridade, valor_target, created_at, updated_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		`, uuid.New(), pID, m.Nome, m.Valor, finalFoto, m.Comprado, m.Prioridade, m.ValorTarget)
		if err != nil {
			return nil, fmt.Errorf("failed to import meta %s: %w", m.Nome, err)
		}
		result.MetasMigradas++
	}

	// 8. Import Settings
	if len(state.Theme) > 0 {
		_, err = tx.ExecContext(ctx, "INSERT INTO settings (key, value, updated_at) VALUES ('theme', $1, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()", []byte(state.Theme))
		if err != nil {
			return nil, fmt.Errorf("failed to import theme setting: %w", err)
		}
	}
	if len(state.UltimoBackup) > 0 {
		_, err = tx.ExecContext(ctx, "INSERT INTO settings (key, value, updated_at) VALUES ('ultimo_backup', $1, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()", []byte(state.UltimoBackup))
		if err != nil {
			return nil, fmt.Errorf("failed to import ultimo_backup setting: %w", err)
		}
	}
	if len(state.LLMConfig) > 0 {
		_, err = tx.ExecContext(ctx, "INSERT INTO settings (key, value, updated_at) VALUES ('llm_config', $1, NOW()) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()", []byte(state.LLMConfig))
		if err != nil {
			return nil, fmt.Errorf("failed to import llm_config setting: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit migration transaction: %w", err)
	}

	return result, nil
}

func decodeBase64Image(dataURI string, uploadsPath string) (string, error) {
	if !strings.HasPrefix(dataURI, "data:image/") {
		return dataURI, nil
	}

	parts := strings.SplitN(dataURI, ",", 2)
	if len(parts) != 2 {
		return dataURI, nil
	}

	header := parts[0]
	base64Data := parts[1]

	ext := "jpg"
	if strings.Contains(header, "png") {
		ext = "png"
	} else if strings.Contains(header, "webp") {
		ext = "webp"
	} else if strings.Contains(header, "gif") {
		ext = "gif"
	}

	dec, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %w", err)
	}

	filename := fmt.Sprintf("%s.%s", uuid.New().String(), ext)
	dir := filepath.Join(uploadsPath, "metas")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	filePath := filepath.Join(dir, filename)
	if err := os.WriteFile(filePath, dec, 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return fmt.Sprintf("/uploads/metas/%s", filename), nil
}
