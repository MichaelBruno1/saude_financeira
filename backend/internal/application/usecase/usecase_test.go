package usecase

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

func TestPerfilUseCase(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	perfilUC := NewPerfilUseCase(perfilRepo)

	// 1. Create Perfil
	req := dto.CreatePerfilRequest{
		Nome:    "Bruno",
		Salario: 5000.0,
	}

	pResp, err := perfilUC.CreatePerfil(ctx, req)
	if err != nil {
		t.Fatalf("failed to create perfil: %v", err)
	}
	if pResp.Nome != "Bruno" || pResp.Salario != 5000.0 {
		t.Errorf("expected Bruno, salary 5000, got %s, salary %f", pResp.Nome, pResp.Salario)
	}

	// 2. Create Duplicate Perfil (case-insensitive)
	reqDup := dto.CreatePerfilRequest{
		Nome:    "bruno",
		Salario: 6000.0,
	}
	_, err = perfilUC.CreatePerfil(ctx, reqDup)
	if !errors.Is(err, domainErr.ErrAlreadyExists) {
		t.Errorf("expected ErrAlreadyExists, got %v", err)
	}

	// 3. Get Perfil
	id, _ := uuid.Parse(pResp.ID)
	fetched, err := perfilUC.GetByID(ctx, id)
	if err != nil {
		t.Fatalf("failed to get perfil: %v", err)
	}
	if fetched.Nome != "Bruno" {
		t.Errorf("expected Bruno, got %s", fetched.Nome)
	}

	// 4. Update Salario
	err = perfilUC.UpdateSalario(ctx, id, 6500.00)
	if err != nil {
		t.Fatalf("failed to update salary: %v", err)
	}
	fetched, _ = perfilUC.GetByID(ctx, id)
	if fetched.Salario != 6500.00 {
		t.Errorf("expected salary 6500, got %f", fetched.Salario)
	}

	// 5. Update FGTS
	err = perfilUC.UpdateFGTS(ctx, id, 1200.50)
	if err != nil {
		t.Fatalf("failed to update FGTS: %v", err)
	}
	fetched, _ = perfilUC.GetByID(ctx, id)
	if fetched.FGTS != 1200.50 {
		t.Errorf("expected FGTS 1200.50, got %f", fetched.FGTS)
	}

	// 6. Delete
	err = perfilUC.DeletePerfil(ctx, id)
	if err != nil {
		t.Fatalf("failed to delete perfil: %v", err)
	}

	_, err = perfilUC.GetByID(ctx, id)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("expected ErrNotFound after deletion, got %v", err)
	}
}

func TestDespesaUseCase(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	despRepo := NewMockDespesaRepository()
	catRepo := NewMockCategoriaRepository()
	finRepo := NewMockFinanciamentoRepository()

	despUC := NewDespesaUseCase(despRepo, perfilRepo, catRepo, finRepo)

	// Create profile
	p := dto.CreatePerfilRequest{Nome: "Bruno", Salario: 5000}
	pResp, _ := NewPerfilUseCase(perfilRepo).CreatePerfil(ctx, p)
	perfilID, _ := uuid.Parse(pResp.ID)

	// 1. Create Despesa (resolves category dynamically)
	req := dto.CreateDespesaRequest{
		Descricao: "Cinema",
		Valor:     50.0,
		Categoria: "Lazer",
		MesInicio: 6,
		AnoInicio: 2026,
		Parcelas:  1,
	}

	dResp, err := despUC.CreateDespesa(ctx, perfilID, req)
	if err != nil {
		t.Fatalf("failed to create despesa: %v", err)
	}
	if dResp.Descricao != "Cinema" || dResp.Categoria != "Lazer" {
		t.Errorf("expected Cinema, category Lazer; got %s, category %s", dResp.Descricao, dResp.Categoria)
	}

	// Verify category was created
	cat, err := catRepo.GetByNome(ctx, "Lazer")
	if err != nil || cat == nil {
		t.Fatalf("category Lazer should have been created dynamically")
	}

	// 2. BulkCreate Despesas
	bulkReq := dto.BulkCreateDespesasRequest{
		Despesas: []dto.CreateDespesaRequest{
			{Descricao: "Mercado", Valor: 200, Categoria: "Alimentação", MesInicio: 6, AnoInicio: 2026, Parcelas: 1},
			{Descricao: "Aluguel", Valor: 1500, Categoria: "Moradia", MesInicio: 6, AnoInicio: 2026, Parcelas: 1},
		},
	}
	_, err = despUC.BulkCreateDespesas(ctx, perfilID, bulkReq)
	if err != nil {
		t.Fatalf("failed to bulk create despesas: %v", err)
	}

	list, _ := despUC.GetByPerfil(ctx, perfilID)
	if len(list) != 3 {
		t.Errorf("expected 3 despesas, got %d", len(list))
	}
}

func TestMetaUseCase(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	despRepo := NewMockDespesaRepository()
	catRepo := NewMockCategoriaRepository()
	metaRepo := NewMockMetaRepository()

	metaUC := NewMetaUseCase(metaRepo, perfilRepo, despRepo, catRepo)

	// Create profile
	p := dto.CreatePerfilRequest{Nome: "Bruno", Salario: 5000}
	pResp, _ := NewPerfilUseCase(perfilRepo).CreatePerfil(ctx, p)
	perfilID, _ := uuid.Parse(pResp.ID)

	// Seed "Investimento" category
	_ = catRepo.Create(ctx, &entity.Categoria{ID: uuid.New(), Nome: "Investimento"})

	// Seed "Investimento" expense (adds value to baseline calculation)
	_ = despRepo.Create(ctx, &entity.Despesa{
		ID:          uuid.New(),
		PerfilID:    perfilID,
		Descricao:   "Aporte CDB",
		Valor:       1000.0,
		CategoriaID: getCatID(catRepo, "Investimento"),
		MesInicio:   1,
		AnoInicio:   2026,
		Parcelas:    1,
	})

	// 1. Create first Meta
	m1, err := metaUC.CreateMeta(ctx, perfilID, dto.CreateMetaRequest{
		Nome:  "Celular",
		Valor: 1500.0,
	})
	if err != nil {
		t.Fatalf("failed to create meta: %v", err)
	}
	// baseline = 1000 (totalInvested). target = baseline + value = 1000 + 1500 = 2500
	if m1.ValorTarget != 2500.0 {
		t.Errorf("expected target 2500, got %f", m1.ValorTarget)
	}

	// 2. Create second Meta
	m2, err := metaUC.CreateMeta(ctx, perfilID, dto.CreateMetaRequest{
		Nome:  "Viagem",
		Valor: 3000.0,
	})
	if err != nil {
		t.Fatalf("failed to create second meta: %v", err)
	}
	// target = baseline + accumulated = 1000 + (1500 + 3000) = 5500
	if m2.ValorTarget != 5500.0 {
		t.Errorf("expected target 5500, got %f", m2.ValorTarget)
	}

	// 3. Buy Celular Meta
	m1ID, _ := uuid.Parse(m1.ID)
	err = metaUC.ComprarMeta(ctx, m1ID)
	if err != nil {
		t.Fatalf("failed to buy meta: %v", err)
	}

	// Celular is bought. baseline increases by celular value = 1000 + 1500 = 2500
	// Remaining active metas (Viagem) target = new baseline + accumulated = 2500 + 3000 = 5500
	m2Fetched, _ := metaUC.GetByID(ctx, uuid.MustParse(m2.ID))
	if m2Fetched.ValorTarget != 5500.0 {
		t.Errorf("expected target 5500 after buying meta, got %f", m2Fetched.ValorTarget)
	}

	pUpdated, _ := perfilRepo.GetByID(ctx, perfilID)
	if pUpdated.MetaBaseline == nil || *pUpdated.MetaBaseline != 2500.0 {
		t.Errorf("expected profile baseline to be 2500, got %v", pUpdated.MetaBaseline)
	}
}

func TestPlanejamentoUseCase(t *testing.T) {
	ctx := context.Background()
	catRepo := NewMockCategoriaRepository()
	planRepo := NewMockPlanejamentoRepository()
	planUC := NewPlanejamentoUseCase(planRepo, catRepo)

	// Seed categories
	_ = catRepo.Create(ctx, &entity.Categoria{ID: uuid.New(), Nome: "Moradia"})
	_ = catRepo.Create(ctx, &entity.Categoria{ID: uuid.New(), Nome: "Alimentação"})

	// 1. Valid Planning limits
	req := dto.UpdatePlanejamentoRequest{
		Limites: map[string]float64{
			"Moradia":     30.0,
			"Alimentação": 20.0,
		},
	}
	err := planUC.UpdatePlanejamento(ctx, "Conservador", req)
	if err != nil {
		t.Fatalf("failed to update planning: %v", err)
	}

	// 2. Planning limits > 100% (should fail)
	reqExceeded := dto.UpdatePlanejamentoRequest{
		Limites: map[string]float64{
			"Moradia":     60.0,
			"Alimentação": 50.0,
		},
	}
	err = planUC.UpdatePlanejamento(ctx, "Conservador", reqExceeded)
	if err == nil || !errors.Is(err, domainErr.ErrValidation) {
		t.Errorf("expected ErrValidation due to percentage sum exceeding 100%%, got %v", err)
	}
}

func TestCSVUseCase(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	despRepo := NewMockDespesaRepository()
	catRepo := NewMockCategoriaRepository()
	finRepo := NewMockFinanciamentoRepository()
	csvUC := NewCSVUseCase(perfilRepo, despRepo, finRepo, catRepo)

	// Create profile
	p := dto.CreatePerfilRequest{Nome: "Bruno", Salario: 4500}
	pResp, _ := NewPerfilUseCase(perfilRepo).CreatePerfil(ctx, p)
	perfilID, _ := uuid.Parse(pResp.ID)

	// Seed category
	_ = catRepo.Create(ctx, &entity.Categoria{ID: uuid.New(), Nome: "Alimentação"})

	// Create expense
	_ = despRepo.Create(ctx, &entity.Despesa{
		ID:          uuid.New(),
		PerfilID:    perfilID,
		Descricao:   "Almoço",
		Valor:       45.0,
		CategoriaID: getCatID(catRepo, "Alimentação"),
		MesInicio:   7,
		AnoInicio:   2026,
		Parcelas:    1,
	})

	// 1. Export CSV
	csvStr, err := csvUC.ExportCSV(ctx, perfilID)
	if err != nil {
		t.Fatalf("failed to export: %v", err)
	}
	if !strings.Contains(csvStr, "Almoço") || !strings.Contains(csvStr, "Alimentação") {
		t.Errorf("exported CSV does not contain records: %s", csvStr)
	}

	// 2. Import CSV (increments/upserts)
	csvImportText := `perfil,salario_base,tipo_registro,descricao,valor,categoria,mes_inicio,ano_inicio,parcelas,recorrente,valor_parcela,taxa_tr
Bruno,5000.00,despesa,Jantar,60.00,Alimentação,7,2026,1,não,0.00,0.00`
	results, err := csvUC.ImportCSV(ctx, csvImportText)
	if err != nil {
		t.Fatalf("failed to import: %v", err)
	}

	if len(results) == 0 || results[0].PerfilNome != "Bruno" {
		t.Fatalf("import failed to return correct results: %v", results)
	}

	// Confirm that old Bruno expenses were cleared, and only Jantar is present
	despList, _ := despRepo.GetByPerfil(ctx, perfilID)
	if len(despList) != 1 || despList[0].Descricao != "Jantar" {
		t.Errorf("expected exactly 1 expense 'Jantar' after upsert merge import, got %d items", len(despList))
	}
}

// helper to get category ID by name
func getCatID(repo repository.CategoriaRepository, name string) uuid.UUID {
	cat, _ := repo.GetByNome(context.Background(), name)
	if cat != nil {
		return cat.ID
	}
	return uuid.Nil
}
