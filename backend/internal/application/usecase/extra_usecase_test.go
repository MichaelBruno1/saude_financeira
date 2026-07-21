package usecase

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	domainErr "saude-financeira-api/internal/domain/errors"
)

func TestFinanciamentoUseCase(t *testing.T) {
	ctx := context.Background()
	perfilRepo := NewMockPerfilRepository()
	finRepo := NewMockFinanciamentoRepository()
	finUC := NewFinanciamentoUseCase(finRepo, perfilRepo)

	// Create a profile first
	pResp, _ := NewPerfilUseCase(perfilRepo).CreatePerfil(ctx, dto.CreatePerfilRequest{Nome: "Bruno", Salario: 5000})
	perfilID, _ := uuid.Parse(pResp.ID)

	// 1. Create Financiamento — valid
	req := dto.CreateFinanciamentoRequest{
		Nome:           "Apartamento",
		ValorTotal:     300000,
		ValorParcela:   1500,
		ParcelasTotais: 360,
		MesInicio:      1,
		AnoInicio:      2026,
		Sistema:        "sac",
	}
	fResp, err := finUC.CreateFinanciamento(ctx, perfilID, req)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if fResp.Nome != "Apartamento" {
		t.Errorf("expected Apartamento, got %s", fResp.Nome)
	}

	fID, _ := uuid.Parse(fResp.ID)

	// 2. GetByID
	fetched, err := finUC.GetByID(ctx, fID)
	if err != nil {
		t.Fatalf("expected no error getting financing, got: %v", err)
	}
	if fetched.ValorTotal != 300000 {
		t.Errorf("expected valor 300000, got %f", fetched.ValorTotal)
	}

	// 3. GetByPerfil
	list, err := finUC.GetByPerfil(ctx, perfilID)
	if err != nil {
		t.Fatalf("expected no error listing financing, got: %v", err)
	}
	if len(list) != 1 {
		t.Errorf("expected 1 financing, got %d", len(list))
	}

	// 4. UpdateFinanciamento
	updateReq := dto.UpdateFinanciamentoRequest{
		Nome:           "Apartamento Novo",
		ValorTotal:     350000,
		ValorParcela:   1600,
		ParcelasTotais: 360,
		MesInicio:      1,
		AnoInicio:      2026,
		Sistema:        "price",
	}
	err = finUC.UpdateFinanciamento(ctx, fID, updateReq)
	if err != nil {
		t.Fatalf("expected no error updating, got: %v", err)
	}
	updated, _ := finUC.GetByID(ctx, fID)
	if updated.Nome != "Apartamento Novo" {
		t.Errorf("expected updated name, got %s", updated.Nome)
	}

	// 5. Delete
	err = finUC.DeleteFinanciamento(ctx, fID)
	if err != nil {
		t.Fatalf("expected no error deleting, got: %v", err)
	}
	_, err = finUC.GetByID(ctx, fID)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("expected ErrNotFound after deletion, got %v", err)
	}

	// 6. Create with invalid sistema
	reqInvalid := dto.CreateFinanciamentoRequest{
		Nome:           "Carro",
		ValorTotal:     50000,
		ValorParcela:   1200,
		ParcelasTotais: 48,
		MesInicio:      6,
		AnoInicio:      2026,
		Sistema:        "invalid",
	}
	_, err = finUC.CreateFinanciamento(ctx, perfilID, reqInvalid)
	if !errors.Is(err, domainErr.ErrValidation) {
		t.Errorf("expected ErrValidation for invalid sistema, got %v", err)
	}

	// 7. Create with non-existent perfilID
	_, err = finUC.CreateFinanciamento(ctx, uuid.New(), req)
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("expected ErrNotFound for missing perfil, got %v", err)
	}

	// 8. Update with invalid sistema
	err = finUC.UpdateFinanciamento(ctx, uuid.New(), dto.UpdateFinanciamentoRequest{
		Nome: "X", ValorTotal: 100, ValorParcela: 100, ParcelasTotais: 1,
		MesInicio: 1, AnoInicio: 2026, Sistema: "sac",
	})
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("expected ErrNotFound for missing financiamento, got %v", err)
	}

	// 9. Delete non-existent
	err = finUC.DeleteFinanciamento(ctx, uuid.New())
	if !errors.Is(err, domainErr.ErrNotFound) {
		t.Errorf("expected ErrNotFound for missing delete, got %v", err)
	}
}

func TestCategoriaUseCase(t *testing.T) {
	ctx := context.Background()
	catRepo := NewMockCategoriaRepository()
	catUC := NewCategoriaUseCase(catRepo)

	// 1. Create Categoria
	req := dto.CreateCategoriaRequest{Nome: "Transporte", Cor: "#3b82f6"}
	cResp, err := catUC.CreateCategoria(ctx, req)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if cResp.Nome != "Transporte" {
		t.Errorf("expected Transporte, got %s", cResp.Nome)
	}

	cID, _ := uuid.Parse(cResp.ID)

	// 2. Duplicate creation should fail
	_, err = catUC.CreateCategoria(ctx, req)
	if !errors.Is(err, domainErr.ErrAlreadyExists) {
		t.Errorf("expected ErrAlreadyExists, got %v", err)
	}

	// 3. Invalid cor format
	_, err = catUC.CreateCategoria(ctx, dto.CreateCategoriaRequest{Nome: "Outro", Cor: "notahex"})
	if !errors.Is(err, domainErr.ErrValidation) {
		t.Errorf("expected ErrValidation for invalid color, got %v", err)
	}

	// 4. GetAll
	cats, err := catUC.GetAll(ctx)
	if err != nil {
		t.Fatalf("expected no error listing, got: %v", err)
	}
	if len(cats) != 1 {
		t.Errorf("expected 1 category, got %d", len(cats))
	}

	// 5. UpdateCor — valid
	err = catUC.UpdateCor(ctx, cID, "#ff0000")
	if err != nil {
		t.Fatalf("expected no error updating color, got: %v", err)
	}

	// 6. UpdateCor — invalid color
	err = catUC.UpdateCor(ctx, cID, "notvalid")
	if !errors.Is(err, domainErr.ErrValidation) {
		t.Errorf("expected ErrValidation for bad color, got %v", err)
	}

	// 7. Create CategoriaInvestimento
	invReq := dto.CreateCategoriaInvestimentoRequest{Nome: "FII"}
	iResp, err := catUC.CreateCategoriaInvestimento(ctx, invReq)
	if err != nil {
		t.Fatalf("expected no error for investimento, got: %v", err)
	}
	if iResp.Nome != "FII" {
		t.Errorf("expected FII, got %s", iResp.Nome)
	}

	// 8. Duplicate investimento
	_, err = catUC.CreateCategoriaInvestimento(ctx, invReq)
	if !errors.Is(err, domainErr.ErrAlreadyExists) {
		t.Errorf("expected ErrAlreadyExists for dup investimento, got %v", err)
	}

	// 9. GetAllInvestimento
	invs, err := catUC.GetAllInvestimento(ctx)
	if err != nil {
		t.Fatalf("expected no error listing investimentos, got: %v", err)
	}
	if len(invs) != 1 {
		t.Errorf("expected 1 investimento, got %d", len(invs))
	}
}

func TestSettingsUseCase(t *testing.T) {
	ctx := context.Background()
	settingsRepo := NewMockSettingsRepository()
	settingsUC := NewSettingsUseCase(settingsRepo)

	// 1. GetSettings — empty
	settings, err := settingsUC.GetSettings(ctx)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(settings) != 0 {
		t.Errorf("expected empty settings, got %d items", len(settings))
	}

	// 2. UpdateSetting
	err = settingsUC.UpdateSetting(ctx, "theme", json.RawMessage(`"dark"`))
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	// 3. GetSettings — after update
	settings, err = settingsUC.GetSettings(ctx)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(settings) != 1 {
		t.Errorf("expected 1 setting, got %d", len(settings))
	}
	if string(settings["theme"]) != `"dark"` {
		t.Errorf(`expected "dark" theme, got %s`, string(settings["theme"]))
	}

	// 4. UpdateSetting — overwrite
	err = settingsUC.UpdateSetting(ctx, "theme", json.RawMessage(`"light"`))
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	settings, _ = settingsUC.GetSettings(ctx)
	if string(settings["theme"]) != `"light"` {
		t.Errorf(`expected "light" theme after update, got %s`, string(settings["theme"]))
	}
}
