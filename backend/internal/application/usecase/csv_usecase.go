package usecase

import (
	"bytes"
	"context"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

type CSVUseCase struct {
	perfilRepo repository.PerfilRepository
	despRepo   repository.DespesaRepository
	finRepo    repository.FinanciamentoRepository
	catRepo    repository.CategoriaRepository
}

func NewCSVUseCase(
	perfilRepo repository.PerfilRepository,
	despRepo repository.DespesaRepository,
	finRepo repository.FinanciamentoRepository,
	catRepo repository.CategoriaRepository,
) *CSVUseCase {
	return &CSVUseCase{
		perfilRepo: perfilRepo,
		despRepo:   despRepo,
		finRepo:    finRepo,
		catRepo:    catRepo,
	}
}

func (uc *CSVUseCase) ExportCSV(ctx context.Context, perfilID uuid.UUID) (string, error) {
	p, err := uc.perfilRepo.GetByID(ctx, perfilID)
	if err != nil {
		return "", err
	}

	despesas, err := uc.despRepo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return "", err
	}

	financings, err := uc.finRepo.GetByPerfil(ctx, perfilID)
	if err != nil {
		return "", err
	}

	cats, err := uc.catRepo.GetAll(ctx)
	if err != nil {
		return "", err
	}
	catMap := make(map[uuid.UUID]string)
	for _, c := range cats {
		catMap[c.ID] = c.Nome
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	header := []string{
		"perfil", "salario_base", "tipo_registro", "descricao", "valor",
		"categoria", "mes_inicio", "ano_inicio", "parcelas", "recorrente",
		"valor_parcela", "taxa_tr",
	}
	if err := writer.Write(header); err != nil {
		return "", err
	}

	for _, d := range despesas {
		catName := catMap[d.CategoriaID]
		if catName == "" {
			catName = "Outros"
		}
		recorrenteStr := "não"
		if d.Recorrente {
			recorrenteStr = "sim"
		}
		row := []string{
			p.Nome,
			strconv.FormatFloat(p.Salario, 'f', 2, 64),
			"despesa",
			d.Descricao,
			strconv.FormatFloat(d.Valor, 'f', 2, 64),
			catName,
			strconv.Itoa(d.MesInicio),
			strconv.Itoa(d.AnoInicio),
			strconv.Itoa(d.Parcelas),
			recorrenteStr,
			"0.00",
			"0.00",
		}
		if err := writer.Write(row); err != nil {
			return "", err
		}
	}

	for _, f := range financings {
		row := []string{
			p.Nome,
			strconv.FormatFloat(p.Salario, 'f', 2, 64),
			"financiamento",
			f.Nome,
			strconv.FormatFloat(f.ValorTotal, 'f', 2, 64),
			"Financiamento",
			strconv.Itoa(f.MesInicio),
			strconv.Itoa(f.AnoInicio),
			strconv.Itoa(f.ParcelasTotais),
			"não",
			strconv.FormatFloat(f.ValorParcela, 'f', 2, 64),
			strconv.FormatFloat(f.TaxaTR, 'f', 6, 64),
		}
		if err := writer.Write(row); err != nil {
			return "", err
		}
	}

	writer.Flush()
	return buf.String(), nil
}

func (uc *CSVUseCase) ImportCSV(ctx context.Context, csvContent string) ([]*dto.CSVImportResult, error) {
	if strings.TrimSpace(csvContent) == "" {
		return nil, fmt.Errorf("%w: empty csv content", domainErr.ErrInvalidInput)
	}

	lines := strings.Split(csvContent, "\n")
	if len(lines) == 0 {
		return nil, fmt.Errorf("%w: empty csv content", domainErr.ErrInvalidInput)
	}

	firstLine := lines[0]
	delimiter := ','
	if strings.Contains(firstLine, ";") {
		delimiter = ';'
	}

	reader := csv.NewReader(strings.NewReader(csvContent))
	reader.Comma = delimiter
	reader.LazyQuotes = true

	headers, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read csv headers: %w", err)
	}

	colMap := make(map[string]int)
	for i, h := range headers {
		colMap[strings.TrimSpace(strings.ToLower(h))] = i
	}

	required := []string{"perfil", "salario_base"}
	for _, req := range required {
		if _, exists := colMap[req]; !exists {
			return nil, fmt.Errorf("%w: missing required column '%s'", domainErr.ErrValidation, req)
		}
	}

	type profileData struct {
		salario float64
		id      uuid.UUID
	}
	profiles := make(map[string]*profileData)

	type parsedRow struct {
		perfilNome   string
		tipoRegistro string
		descricao    string
		valor        float64
		categoria    string
		mesInicio    int
		anoInicio    int
		parcelas     int
		recorrente   bool
		valParcela   float64
		taxaTR       float64
	}

	var rows []*parsedRow

	for {
		record, err := reader.Read()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			continue
		}

		pName := strings.TrimSpace(getCol(record, colMap, "perfil"))
		if pName == "" {
			continue
		}
		salBase, _ := strconv.ParseFloat(getCol(record, colMap, "salario_base"), 64)
		if _, exists := profiles[pName]; !exists {
			profiles[pName] = &profileData{salario: salBase}
		} else if salBase > 0 {
			profiles[pName].salario = salBase
		}

		desc := strings.TrimSpace(getCol(record, colMap, "descricao"))
		val, _ := strconv.ParseFloat(getCol(record, colMap, "valor"), 64)
		if desc == "" || val <= 0 {
			continue
		}

		tipoReg := strings.ToLower(strings.TrimSpace(getCol(record, colMap, "tipo_registro")))
		if tipoReg == "" {
			tipoReg = "despesa"
		}
		cat := strings.TrimSpace(getCol(record, colMap, "categoria"))
		if cat == "" {
			cat = "Outros"
		}
		mes, _ := strconv.Atoi(getCol(record, colMap, "mes_inicio"))
		if mes < 1 || mes > 12 {
			mes = 1
		}
		ano, _ := strconv.Atoi(getCol(record, colMap, "ano_inicio"))
		if ano <= 0 {
			ano = time.Now().Year()
		}
		parc, _ := strconv.Atoi(getCol(record, colMap, "parcelas"))
		if parc < 1 {
			parc = 1
		}
		recStr := strings.ToLower(strings.TrimSpace(getCol(record, colMap, "recorrente")))
		rec := recStr == "sim" || recStr == "true"
		vp, _ := strconv.ParseFloat(getCol(record, colMap, "valor_parcela"), 64)
		tr, _ := strconv.ParseFloat(getCol(record, colMap, "taxa_tr"), 64)

		rows = append(rows, &parsedRow{
			perfilNome:   pName,
			tipoRegistro: tipoReg,
			descricao:    desc,
			valor:        val,
			categoria:    cat,
			mesInicio:    mes,
			anoInicio:    ano,
			parcelas:     parc,
			recorrente:   rec,
			valParcela:   vp,
			taxaTR:       tr,
		})
	}

	if len(profiles) == 0 {
		return nil, fmt.Errorf("%w: no valid profile data found in CSV", domainErr.ErrValidation)
	}

	results := make([]*dto.CSVImportResult, 0, len(profiles))

	for pName, pData := range profiles {
		p, err := uc.perfilRepo.GetByNome(ctx, pName)
		if err != nil {
			if errors.Is(err, domainErr.ErrNotFound) {
				p = &entity.Perfil{
					ID:      uuid.New(),
					Nome:    pName,
					Salario: pData.salario,
				}
				if err := uc.perfilRepo.Create(ctx, p); err != nil {
					return nil, err
				}
			} else {
				return nil, err
			}
		} else {
			if pData.salario > 0 {
				p.Salario = pData.salario
				_ = uc.perfilRepo.Update(ctx, p)
			}
		}
		pData.id = p.ID

		if err := uc.despRepo.DeleteByPerfil(ctx, p.ID); err != nil {
			return nil, err
		}
		if err := uc.finRepo.DeleteByPerfil(ctx, p.ID); err != nil {
			return nil, err
		}
	}

	for pName, pData := range profiles {
		despesasImported := 0
		financImported := 0
		catImported := 0

		finMap := make(map[string]uuid.UUID)

		for _, row := range rows {
			if row.perfilNome != pName || row.tipoRegistro != "financiamento" {
				continue
			}

			valParc := row.valParcela
			if valParc <= 0 {
				valParc = row.valor / float64(row.parcelas)
			}

			f := &entity.Financiamento{
				ID:             uuid.New(),
				PerfilID:       pData.id,
				Nome:           row.descricao,
				ValorTotal:     row.valor,
				ValorParcela:   valParc,
				ParcelasTotais: row.parcelas,
				TaxaTR:         row.taxaTR,
				MesInicio:      row.mesInicio,
				AnoInicio:      row.anoInicio,
				Sistema:        "price",
			}
			if err := f.Validate(); err != nil {
				return nil, fmt.Errorf("invalid financing row: %w", err)
			}
			if err := uc.finRepo.Create(ctx, f); err != nil {
				return nil, err
			}
			finMap[strings.ToLower(f.Nome)] = f.ID
			financImported++
		}

		var profileDespesas []*entity.Despesa
		for _, row := range rows {
			if row.perfilNome != pName || row.tipoRegistro == "financiamento" {
				continue
			}

			cat, err := uc.resolveOrCreateCategory(ctx, row.categoria)
			if err != nil {
				return nil, err
			}

			if !cat.IsSystem {
				catImported++
			}

			var finID *uuid.UUID
			descLower := strings.ToLower(row.descricao)
			for fName, fID := range finMap {
				if strings.Contains(descLower, fName) {
					idCopy := fID
					finID = &idCopy
					break
				}
			}

			d := &entity.Despesa{
				ID:              uuid.New(),
				PerfilID:        pData.id,
				Descricao:       row.descricao,
				Valor:           row.valor,
				CategoriaID:     cat.ID,
				FinanciamentoID: finID,
				MesInicio:       row.mesInicio,
				AnoInicio:       row.anoInicio,
				Parcelas:        row.parcelas,
				Recorrente:      row.recorrente,
			}
			if err := d.Validate(); err != nil {
				return nil, fmt.Errorf("invalid expense row: %w", err)
			}
			profileDespesas = append(profileDespesas, d)
			despesasImported++
		}

		if len(profileDespesas) > 0 {
			if err := uc.despRepo.BulkCreate(ctx, profileDespesas); err != nil {
				return nil, err
			}
		}

		results = append(results, &dto.CSVImportResult{
			PerfilID:             pData.id.String(),
			PerfilNome:           pName,
			DespesasImportadas:   despesasImported,
			FinancImportados:     financImported,
			CategoriasImportadas: catImported,
		})
	}

	return results, nil
}

func getCol(record []string, colMap map[string]int, colName string) string {
	idx, exists := colMap[colName]
	if !exists || idx < 0 || idx >= len(record) {
		return ""
	}
	return record[idx]
}

func (uc *CSVUseCase) resolveOrCreateCategory(ctx context.Context, name string) (*entity.Categoria, error) {
	cat, err := uc.catRepo.GetByNome(ctx, name)
	if err != nil {
		if errors.Is(err, domainErr.ErrNotFound) {
			c := &entity.Categoria{
				ID:       uuid.New(),
				Nome:     name,
				Cor:      "#64748b",
				IsSystem: false,
			}
			if err := uc.catRepo.Create(ctx, c); err != nil {
				return nil, err
			}
			return c, nil
		}
		return nil, err
	}
	return cat, nil
}
