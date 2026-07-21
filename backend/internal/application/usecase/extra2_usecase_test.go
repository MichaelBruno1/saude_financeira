package usecase

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
)

func TestMetaUseCaseExtra(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	despRepo := NewMockDespesaRepository()
	catRepo := NewMockCategoriaRepository()
	metaRepo := NewMockMetaRepository()

	metaUC := NewMetaUseCase(metaRepo, perfilRepo, despRepo, catRepo)

	// Create a profile
	pResp, _ := NewPerfilUseCase(perfilRepo).CreatePerfil(ctx, dto.CreatePerfilRequest{Nome: "Alice", Salario: 5000})
	perfilID, _ := uuid.Parse(pResp.ID)

	// Create metas
	m1, _ := metaUC.CreateMeta(ctx, perfilID, dto.CreateMetaRequest{Nome: "Celular", Valor: 1500})
	m2, _ := metaUC.CreateMeta(ctx, perfilID, dto.CreateMetaRequest{Nome: "TV", Valor: 2000})
	m1ID, _ := uuid.Parse(m1.ID)
	m2ID, _ := uuid.Parse(m2.ID)

	// 1. GetByPerfil
	list, err := metaUC.GetByPerfil(ctx, perfilID)
	if err != nil {
		t.Fatalf("GetByPerfil: expected no error, got: %v", err)
	}
	if len(list) != 2 {
		t.Errorf("GetByPerfil: expected 2 metas, got %d", len(list))
	}

	// 2. UpdateMeta
	err = metaUC.UpdateMeta(ctx, m1ID, dto.UpdateMetaRequest{Nome: "iPhone", Valor: 2000})
	if err != nil {
		t.Fatalf("UpdateMeta: expected no error, got: %v", err)
	}
	updated, _ := metaUC.GetByID(ctx, m1ID)
	if updated.Nome != "iPhone" {
		t.Errorf("UpdateMeta: expected iPhone, got %s", updated.Nome)
	}

	// 3. UpdateMeta — non-existent
	err = metaUC.UpdateMeta(ctx, uuid.New(), dto.UpdateMetaRequest{Nome: "X", Valor: 100})
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("UpdateMeta non-existent: expected ErrNotFound, got %v", err)
	}

	// 4. ReorderMetas
	err = metaUC.ReorderMetas(ctx, perfilID, []uuid.UUID{m2ID, m1ID})
	if err != nil {
		t.Fatalf("ReorderMetas: expected no error, got: %v", err)
	}

	// 5. DeleteMeta
	err = metaUC.DeleteMeta(ctx, m1ID)
	if err != nil {
		t.Fatalf("DeleteMeta: expected no error, got: %v", err)
	}
	_, err = metaUC.GetByID(ctx, m1ID)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("GetByID after DeleteMeta: expected ErrNotFound, got %v", err)
	}

	// 6. DeleteMeta — non-existent
	err = metaUC.DeleteMeta(ctx, uuid.New())
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("DeleteMeta non-existent: expected ErrNotFound, got %v", err)
	}

	// 7. UpdateMetaTargets
	err = metaUC.UpdateMetaTargets(ctx, perfilID, []dto.MetaReajusteTarget{
		{ID: m2ID.String(), ValorTarget: 5000},
	})
	if err != nil {
		t.Fatalf("UpdateMetaTargets: expected no error, got: %v", err)
	}
}

func TestDespesaUseCaseExtra(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	despRepo := NewMockDespesaRepository()
	catRepo := NewMockCategoriaRepository()
	finRepo := NewMockFinanciamentoRepository()

	despUC := NewDespesaUseCase(despRepo, perfilRepo, catRepo, finRepo)
	perfilUC := NewPerfilUseCase(perfilRepo)

	// Create profile
	pResp, _ := perfilUC.CreatePerfil(ctx, dto.CreatePerfilRequest{Nome: "Bruno", Salario: 5000})
	perfilID, _ := uuid.Parse(pResp.ID)

	// Create despesa
	dResp, _ := despUC.CreateDespesa(ctx, perfilID, dto.CreateDespesaRequest{
		Descricao: "Cinema", Valor: 50, Categoria: "Lazer",
		MesInicio: 7, AnoInicio: 2026, Parcelas: 1,
	})
	dID, _ := uuid.Parse(dResp.ID)

	// 1. GetByID
	fetched, err := despUC.GetByID(ctx, dID)
	if err != nil {
		t.Fatalf("GetByID: expected no error, got: %v", err)
	}
	if fetched.Descricao != "Cinema" {
		t.Errorf("GetByID: expected Cinema, got %s", fetched.Descricao)
	}

	// 2. UpdateDespesa
	err = despUC.UpdateDespesa(ctx, dID, dto.UpdateDespesaRequest{
		Descricao: "Teatro", Valor: 80, Categoria: "Lazer",
		MesInicio: 7, AnoInicio: 2026, Parcelas: 1,
	})
	if err != nil {
		t.Fatalf("UpdateDespesa: expected no error, got: %v", err)
	}
	updated, _ := despUC.GetByID(ctx, dID)
	if updated.Descricao != "Teatro" {
		t.Errorf("UpdateDespesa: expected Teatro, got %s", updated.Descricao)
	}

	// 3. UpdateDespesa — non-existent
	err = despUC.UpdateDespesa(ctx, uuid.New(), dto.UpdateDespesaRequest{
		Descricao: "X", Valor: 100, Categoria: "Lazer",
		MesInicio: 7, AnoInicio: 2026, Parcelas: 1,
	})
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("UpdateDespesa non-existent: expected ErrNotFound, got %v", err)
	}

	// 4. DeleteDespesa
	err = despUC.DeleteDespesa(ctx, dID)
	if err != nil {
		t.Fatalf("DeleteDespesa: expected no error, got: %v", err)
	}
	_, err = despUC.GetByID(ctx, dID)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("GetByID after delete: expected ErrNotFound, got %v", err)
	}

	// 5. DeleteDespesa — non-existent
	err = despUC.DeleteDespesa(ctx, uuid.New())
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("DeleteDespesa non-existent: expected ErrNotFound, got %v", err)
	}
}

func TestPerfilUseCaseExtra(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	perfilUC := NewPerfilUseCase(perfilRepo)

	// Create
	pResp, _ := perfilUC.CreatePerfil(ctx, dto.CreatePerfilRequest{Nome: "Carlos", Salario: 3000})
	perfilID, _ := uuid.Parse(pResp.ID)

	// 1. GetAll
	list, err := perfilUC.GetAll(ctx)
	if err != nil {
		t.Fatalf("GetAll: expected no error, got: %v", err)
	}
	if len(list) != 1 {
		t.Errorf("GetAll: expected 1, got %d", len(list))
	}

	// 2. GetAll after multiple
	perfilUC.CreatePerfil(ctx, dto.CreatePerfilRequest{Nome: "Diana", Salario: 4000})
	list, _ = perfilUC.GetAll(ctx)
	if len(list) != 2 {
		t.Errorf("GetAll after 2 creates: expected 2, got %d", len(list))
	}
	_ = perfilID
}

func TestPlanejamentoUseCaseExtra(t *testing.T) {
	ctx := context.Background()
	catRepo := NewMockCategoriaRepository()
	planRepo := NewMockPlanejamentoRepository()
	planUC := NewPlanejamentoUseCase(planRepo, catRepo)

	// Seed categories
	_ = catRepo.Create(ctx, &entity.Categoria{ID: uuid.New(), Nome: "Moradia"})

	// 1. GetPlanejamento — initially empty
	plan, err := planUC.GetPlanejamento(ctx, uuid.Nil)
	if err != nil {
		t.Fatalf("GetPlanejamento: expected no error, got: %v", err)
	}
	if plan == nil {
		t.Fatal("GetPlanejamento: expected non-nil response")
	}

	// 2. UpdatePlanejamento — valid
	err = planUC.UpdatePlanejamento(ctx, uuid.Nil, "Conservador", dto.UpdatePlanejamentoRequest{
		Limites: map[string]float64{"Moradia": 25.0},
	})
	if err != nil {
		t.Fatalf("UpdatePlanejamento: expected no error, got: %v", err)
	}

	// 3. GetPlanejamento after update
	plan, err = planUC.GetPlanejamento(ctx, uuid.Nil)
	if err != nil {
		t.Fatalf("GetPlanejamento after update: expected no error, got: %v", err)
	}
	if plan == nil {
		t.Fatal("GetPlanejamento after update: expected non-nil response")
	}
}
