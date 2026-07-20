package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"testing"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

func TestPostgresRepositoriesIntegration(t *testing.T) {
	dbURL := "postgres://saude:saude123@localhost:5432/saude_financeira?sslmode=disable"
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		t.Skip("Skipping integration test: PostgreSQL is not running on localhost:5432")
		return
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		t.Skip("Skipping integration test: cannot ping PostgreSQL on localhost:5432")
		return
	}

	ctx := context.Background()

	// Clear test tables in order of dependencies
	_, _ = db.ExecContext(ctx, "DELETE FROM despesas")
	_, _ = db.ExecContext(ctx, "DELETE FROM metas")
	_, _ = db.ExecContext(ctx, "DELETE FROM financiamentos")
	_, _ = db.ExecContext(ctx, "DELETE FROM perfis")
	_, _ = db.ExecContext(ctx, "DELETE FROM planejamento")
	_, _ = db.ExecContext(ctx, "DELETE FROM categorias WHERE is_system = false")
	_, _ = db.ExecContext(ctx, "DELETE FROM categorias_investimento WHERE is_system = false")

	// 1. Test Perfil Repository
	perfilRepo := NewPerfilPostgres(db)
	p := &entity.Perfil{
		Nome:    "Bruno Integration Test",
		Salario: 4500.0,
		FGTS:    2000.0,
	}

	// Create
	err = perfilRepo.Create(ctx, p)
	if err != nil {
		t.Fatalf("failed to create perfil: %v", err)
	}

	// GetByID
	pFetched, err := perfilRepo.GetByID(ctx, p.ID)
	if err != nil {
		t.Fatalf("failed to get perfil: %v", err)
	}
	if pFetched.Nome != p.Nome {
		t.Errorf("expected name %s, got %s", p.Nome, pFetched.Nome)
	}

	// GetByNome
	pFetchedByName, err := perfilRepo.GetByNome(ctx, p.Nome)
	if err != nil {
		t.Fatalf("failed to get perfil by name: %v", err)
	}
	if pFetchedByName.ID != p.ID {
		t.Errorf("expected id %v, got %v", p.ID, pFetchedByName.ID)
	}

	// GetAll
	perfis, err := perfilRepo.GetAll(ctx)
	if err != nil {
		t.Fatalf("failed to get all: %v", err)
	}
	if len(perfis) == 0 {
		t.Error("expected at least 1 profile")
	}

	// Update
	p.Salario = 5500.0
	err = perfilRepo.Update(ctx, p)
	if err != nil {
		t.Fatalf("failed to update perfil: %v", err)
	}
	pFetched, _ = perfilRepo.GetByID(ctx, p.ID)
	if pFetched.Salario != 5500.0 {
		t.Errorf("expected salary 5500, got %f", pFetched.Salario)
	}

	// 2. Test Categoria Repository
	catRepo := NewCategoriaPostgres(db)
	c := &entity.Categoria{
		Nome: "Custom Cat Test",
		Cor:  "#aabbcc",
	}
	err = catRepo.Create(ctx, c)
	if err != nil {
		t.Fatalf("failed to create categoria: %v", err)
	}

	catFetched, err := catRepo.GetByNome(ctx, c.Nome)
	if err != nil {
		t.Fatalf("failed to get categoria: %v", err)
	}
	if catFetched.Cor != c.Cor {
		t.Errorf("expected color %s, got %s", c.Cor, catFetched.Cor)
	}

	err = catRepo.UpdateCor(ctx, c.ID, "#112233")
	if err != nil {
		t.Fatalf("failed to update color: %v", err)
	}

	// Investimento
	ci := &entity.CategoriaInvestimento{
		Nome: "Acoes Test",
	}
	err = catRepo.CreateInvestimento(ctx, ci)
	if err != nil {
		t.Fatalf("failed to create inv: %v", err)
	}

	ciFetched, err := catRepo.GetInvestimentoByNome(ctx, ci.Nome)
	if err != nil {
		t.Fatalf("failed to get inv: %v", err)
	}
	if ciFetched.Nome != ci.Nome {
		t.Errorf("expected inv name %s, got %s", ci.Nome, ciFetched.Nome)
	}

	// 3. Test Financiamento Repository
	finRepo := NewFinanciamentoPostgres(db)
	f := &entity.Financiamento{
		PerfilID:       p.ID,
		Nome:           "Apartment Test",
		ValorTotal:     250000,
		ValorParcela:   1200,
		ParcelasTotais: 300,
		MesInicio:      3,
		AnoInicio:      2026,
		Sistema:        "price",
	}
	err = finRepo.Create(ctx, f)
	if err != nil {
		t.Fatalf("failed to create fin: %v", err)
	}

	fFetched, err := finRepo.GetByID(ctx, f.ID)
	if err != nil {
		t.Fatalf("failed to get fin: %v", err)
	}
	if fFetched.Nome != f.Nome {
		t.Errorf("expected fin name %s, got %s", f.Nome, fFetched.Nome)
	}

	// 4. Test Despesa Repository
	despRepo := NewDespesaPostgres(db)
	d := &entity.Despesa{
		PerfilID:        p.ID,
		Descricao:       "Despesa Test",
		Valor:           100.0,
		CategoriaID:     c.ID,
		FinanciamentoID: &f.ID,
		MesInicio:       3,
		AnoInicio:       2026,
		Parcelas:        1,
	}
	err = despRepo.Create(ctx, d)
	if err != nil {
		t.Fatalf("failed to create despesa: %v", err)
	}

	dFetched, err := despRepo.GetByID(ctx, d.ID)
	if err != nil {
		t.Fatalf("failed to get despesa: %v", err)
	}
	if dFetched.Descricao != d.Descricao {
		t.Errorf("expected despesa desc %s, got %s", d.Descricao, dFetched.Descricao)
	}

	// Bulk Create
	d2 := &entity.Despesa{
		PerfilID:    p.ID,
		Descricao:   "Despesa Bulk 2",
		Valor:       20.0,
		CategoriaID: c.ID,
		MesInicio:   3,
		AnoInicio:   2026,
		Parcelas:    1,
	}
	d3 := &entity.Despesa{
		PerfilID:    p.ID,
		Descricao:   "Despesa Bulk 3",
		Valor:       30.0,
		CategoriaID: c.ID,
		MesInicio:   3,
		AnoInicio:   2026,
		Parcelas:    1,
	}
	err = despRepo.BulkCreate(ctx, []*entity.Despesa{d2, d3})
	if err != nil {
		t.Fatalf("failed to bulk create despesas: %v", err)
	}

	despesas, err := despRepo.GetByPerfil(ctx, p.ID)
	if err != nil {
		t.Fatalf("failed to get by profile: %v", err)
	}
	// Should have at least d, d2, d3
	if len(despesas) < 3 {
		t.Errorf("expected at least 3 despesas, got %d", len(despesas))
	}

	// 5. Test Meta Repository
	metaRepo := NewMetaPostgres(db)
	m := &entity.Meta{
		PerfilID:    p.ID,
		Nome:        "Viagem Test",
		Valor:       5000,
		Prioridade:  1,
		ValorTarget: 2500,
	}
	err = metaRepo.Create(ctx, m)
	if err != nil {
		t.Fatalf("failed to create meta: %v", err)
	}

	mFetched, err := metaRepo.GetByID(ctx, m.ID)
	if err != nil {
		t.Fatalf("failed to get meta: %v", err)
	}
	if mFetched.Nome != m.Nome {
		t.Errorf("expected name %s, got %s", m.Nome, mFetched.Nome)
	}

	// BulkUpdatePrioridades
	err = metaRepo.BulkUpdatePrioridades(ctx, []repository.MetaPrioridadeUpdate{
		{ID: m.ID, Prioridade: 2},
	})
	if err != nil {
		t.Fatalf("failed to bulk update prioridades: %v", err)
	}
	mFetched, _ = metaRepo.GetByID(ctx, m.ID)
	if mFetched.Prioridade != 2 {
		t.Errorf("expected prioridade 2, got %d", mFetched.Prioridade)
	}

	// BulkUpdateTargets
	err = metaRepo.BulkUpdateTargets(ctx, []repository.MetaTargetUpdate{
		{ID: m.ID, ValorTarget: 3000},
	})
	if err != nil {
		t.Fatalf("failed to bulk update targets: %v", err)
	}
	mFetched, _ = metaRepo.GetByID(ctx, m.ID)
	if mFetched.ValorTarget != 3000 {
		t.Errorf("expected target 3000, got %f", mFetched.ValorTarget)
	}

	// 6. Test Planejamento Repository
	planRepo := NewPlanejamentoPostgres(db)
	pl := &entity.Planejamento{
		Metodo:      "Conservador",
		CategoriaID: c.ID,
		Percentual:  15.0,
	}
	err = planRepo.Create(ctx, pl)
	if err != nil {
		t.Fatalf("failed to create plan: %v", err)
	}

	limits, err := planRepo.GetByMetodo(ctx, "Conservador")
	if err != nil {
		t.Fatalf("failed to get limits: %v", err)
	}
	found := false
	for _, l := range limits {
		if l.CategoriaID == c.ID {
			found = true
			if l.Percentual != 15.0 {
				t.Errorf("expected limit percent 15, got %f", l.Percentual)
			}
		}
	}
	if !found {
		t.Error("expected to find custom category in Conservador limits")
	}

	// 7. Test Settings Repository
	settingsRepo := NewSettingsPostgres(db)
	themeJSON := json.RawMessage(`"light"`)
	err = settingsRepo.Set(ctx, "theme", themeJSON)
	if err != nil {
		t.Fatalf("failed to set setting: %v", err)
	}

	themeFetched, err := settingsRepo.Get(ctx, "theme")
	if err != nil {
		t.Fatalf("failed to get setting: %v", err)
	}
	if string(themeFetched) != `"light"` {
		t.Errorf("expected 'light', got %s", string(themeFetched))
	}

	// Check NotFound error
	_, err = perfilRepo.GetByID(ctx, uuid.New())
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("expected ErrNotFound, got %v", err)
	}

	// Clean up at the end (cascade deletes)
	err = perfilRepo.Delete(ctx, p.ID)
	if err != nil {
		t.Fatalf("failed to delete perfil: %v", err)
	}

	// Despesas, Financiamentos and Metas should be deleted due to ON DELETE CASCADE
	_, err = despRepo.GetByID(ctx, d.ID)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Error("despesa should have been deleted cascade")
	}

	_, err = finRepo.GetByID(ctx, f.ID)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Error("financiamento should have been deleted cascade")
	}

	_, err = metaRepo.GetByID(ctx, m.ID)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Error("meta should have been deleted cascade")
	}

	// 8. Test Migration Repository
	migRepo := NewMigrationPostgres(db)
	state := &dto.LocalStorageState{
		Perfis: []dto.LocalStoragePerfil{
			{Nome: "MigrationUser", Salario: 8000, FGTS: 15000},
		},
		Despesas: []dto.LocalStorageDespesa{
			{ID: "d1", Perfil: "MigrationUser", Descricao: "Cinema", Valor: 50, Categoria: "Lazer", MesInicio: 1, AnoInicio: 2026, Parcelas: 1},
		},
		Financiamentos: []dto.LocalStorageFinanciamento{
			{ID: "f1", Perfil: "MigrationUser", Nome: "Apartment", ValorTotal: 200000, ValorParcela: 1000, ParcelasTotais: 200, MesInicio: 1, AnoInicio: 2026, Sistema: "price"},
		},
		Metas: []dto.LocalStorageMeta{
			{ID: "m1", Perfil: "MigrationUser", Nome: "Trip", Valor: 4000, Comprado: false, Prioridade: 0, ValorTarget: 4000},
		},
		Categorias: map[string]string{
			"Lazer": "#ff00ff",
		},
		Theme: []byte(`"dark"`),
	}

	migRes, err := migRepo.ImportState(ctx, state, ".")
	if err != nil {
		t.Fatalf("migration import failed: %v", err)
	}

	if migRes.PerfisMigrados != 1 || migRes.DespesasMigradas != 1 || migRes.FinanciamentosMigrados != 1 || migRes.MetasMigradas != 1 {
		t.Errorf("migration results mismatch: %+v", migRes)
	}
}
