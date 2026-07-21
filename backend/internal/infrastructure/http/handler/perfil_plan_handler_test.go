package handler

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/usecase"
	"saude-financeira-api/internal/domain/entity"
)

// ─── Extra Perfil Handler Tests ─────────────────────────────────────────────

func TestPerfilHandlerExtra(t *testing.T) {
	repo := &mockPerfilRepo{}
	uc := usecase.NewPerfilUseCase(repo)
	h := NewPerfilHandler(uc)

	// Create a profile first
	pID := uuid.New()
	repo.perfis = append(repo.perfis, &entity.Perfil{ID: pID, Nome: "Alice", Salario: 4000})

	// 1. UpdateSalario — valid
	body := `{"salario": 5000.00}`
	req := httptest.NewRequest("PUT", "/", bytes.NewBufferString(body))
	req.SetPathValue("id", pID.String())
	rec := httptest.NewRecorder()
	h.UpdateSalario(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("UpdateSalario: expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	// 2. UpdateSalario — invalid UUID
	req2 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(body))
	req2.SetPathValue("id", "not-a-uuid")
	rec2 := httptest.NewRecorder()
	h.UpdateSalario(rec2, req2)
	if rec2.Code != http.StatusBadRequest {
		t.Errorf("UpdateSalario bad UUID: expected 400, got %d", rec2.Code)
	}

	// 3. UpdateFGTS — valid
	body3 := `{"fgts": 2000.00}`
	req3 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(body3))
	req3.SetPathValue("id", pID.String())
	rec3 := httptest.NewRecorder()
	h.UpdateFGTS(rec3, req3)
	if rec3.Code != http.StatusOK {
		t.Errorf("UpdateFGTS: expected 200, got %d: %s", rec3.Code, rec3.Body.String())
	}

	// 4. UpdateFGTS — invalid UUID
	req4 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(body3))
	req4.SetPathValue("id", "not-a-uuid")
	rec4 := httptest.NewRecorder()
	h.UpdateFGTS(rec4, req4)
	if rec4.Code != http.StatusBadRequest {
		t.Errorf("UpdateFGTS bad UUID: expected 400, got %d", rec4.Code)
	}

	// 5. Remover — valid
	req5 := httptest.NewRequest("DELETE", "/", nil)
	req5.SetPathValue("id", pID.String())
	rec5 := httptest.NewRecorder()
	h.Remover(rec5, req5)
	if rec5.Code != http.StatusNoContent {
		t.Errorf("Remover: expected 204, got %d: %s", rec5.Code, rec5.Body.String())
	}

	// 6. Remover — invalid UUID
	req6 := httptest.NewRequest("DELETE", "/", nil)
	req6.SetPathValue("id", "bad-uuid")
	rec6 := httptest.NewRecorder()
	h.Remover(rec6, req6)
	if rec6.Code != http.StatusBadRequest {
		t.Errorf("Remover bad UUID: expected 400, got %d", rec6.Code)
	}
}

// ─── Planejamento Handler Tests ─────────────────────────────────────────────

func TestPlanejamentoHandler(t *testing.T) {
	catRepo := newMockCatRepoH()
	planRepo := newMockPlanRepoH()
	uc := usecase.NewPlanejamentoUseCase(planRepo, catRepo)
	h := NewPlanejamentoHandler(uc)

	// Seed a category
	cID := uuid.New()
	catRepo.cats[cID] = &entity.Categoria{ID: cID, Nome: "Moradia", Cor: "#aabbcc"}

	pid := uuid.New().String()

	// 1. Obter — empty state
	req := httptest.NewRequest("GET", "/", nil)
	req.SetPathValue("pid", pid)
	rec := httptest.NewRecorder()
	h.Obter(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("Obter: expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	// 2. Atualizar — valid
	body := `{"limites":{"Moradia":25.0}}`
	req2 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(body))
	req2.SetPathValue("pid", pid)
	req2.SetPathValue("metodo", "Conservador")
	rec2 := httptest.NewRecorder()
	h.Atualizar(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Errorf("Atualizar: expected 200, got %d: %s", rec2.Code, rec2.Body.String())
	}

	// 3. Atualizar — bad JSON
	req3 := httptest.NewRequest("PUT", "/", bytes.NewBufferString("{invalid"))
	req3.SetPathValue("pid", pid)
	req3.SetPathValue("metodo", "Conservador")
	rec3 := httptest.NewRecorder()
	h.Atualizar(rec3, req3)
	if rec3.Code != http.StatusBadRequest {
		t.Errorf("Atualizar bad JSON: expected 400, got %d", rec3.Code)
	}
}

// ─── Additional mock for Planejamento ────────────────────────────────────────

type mockPlanRepoH struct{}

func newMockPlanRepoH() *mockPlanRepoH {
	return &mockPlanRepoH{}
}

func (m *mockPlanRepoH) Create(ctx context.Context, pl *entity.Planejamento) error { return nil }
func (m *mockPlanRepoH) GetByMetodo(ctx context.Context, metodo string) ([]*entity.Planejamento, error) {
	return nil, nil
}
func (m *mockPlanRepoH) GetAll(ctx context.Context, perfilID uuid.UUID) ([]*entity.Planejamento, error) { return nil, nil }
func (m *mockPlanRepoH) UpdatePercentual(ctx context.Context, metodo string, catID uuid.UUID, pct float64) error {
	return nil
}
func (m *mockPlanRepoH) DeleteByMetodo(ctx context.Context, perfilID uuid.UUID, metodo string) error { return nil }

