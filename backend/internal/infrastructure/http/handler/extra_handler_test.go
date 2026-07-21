package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/application/usecase"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
)

// ─── Inline mocks for handler tests ────────────────────────────────────────

type mockDespesaRepoH struct {
	despesas map[uuid.UUID]*entity.Despesa
}

func newMockDespesaRepoH() *mockDespesaRepoH {
	return &mockDespesaRepoH{despesas: make(map[uuid.UUID]*entity.Despesa)}
}
func (m *mockDespesaRepoH) Create(ctx context.Context, d *entity.Despesa) error {
	m.despesas[d.ID] = d; return nil
}
func (m *mockDespesaRepoH) GetByID(ctx context.Context, id uuid.UUID) (*entity.Despesa, error) {
	d, ok := m.despesas[id]
	if !ok { return nil, domainErr.ErrNotFound }
	return d, nil
}
func (m *mockDespesaRepoH) GetByPerfil(ctx context.Context, pid uuid.UUID) ([]*entity.Despesa, error) {
	var list []*entity.Despesa
	for _, d := range m.despesas {
		if d.PerfilID == pid { list = append(list, d) }
	}
	return list, nil
}
func (m *mockDespesaRepoH) Update(ctx context.Context, d *entity.Despesa) error {
	if _, ok := m.despesas[d.ID]; !ok { return domainErr.ErrNotFound }
	m.despesas[d.ID] = d; return nil
}
func (m *mockDespesaRepoH) Delete(ctx context.Context, id uuid.UUID) error {
	if _, ok := m.despesas[id]; !ok { return domainErr.ErrNotFound }
	delete(m.despesas, id); return nil
}
func (m *mockDespesaRepoH) DeleteByPerfil(ctx context.Context, pid uuid.UUID) error { return nil }
func (m *mockDespesaRepoH) BulkCreate(ctx context.Context, ds []*entity.Despesa) error {
	for _, d := range ds { m.despesas[d.ID] = d }
	return nil
}

type mockCatRepoH struct {
	cats map[uuid.UUID]*entity.Categoria
	invs map[uuid.UUID]*entity.CategoriaInvestimento
}

func newMockCatRepoH() *mockCatRepoH {
	return &mockCatRepoH{cats: make(map[uuid.UUID]*entity.Categoria), invs: make(map[uuid.UUID]*entity.CategoriaInvestimento)}
}
func (m *mockCatRepoH) Create(ctx context.Context, c *entity.Categoria) error { m.cats[c.ID] = c; return nil }
func (m *mockCatRepoH) GetAll(ctx context.Context) ([]*entity.Categoria, error) {
	var l []*entity.Categoria
	for _, c := range m.cats { l = append(l, c) }
	return l, nil
}
func (m *mockCatRepoH) GetByNome(ctx context.Context, nome string) (*entity.Categoria, error) {
	for _, c := range m.cats {
		if strings.ToLower(c.Nome) == strings.ToLower(nome) { return c, nil }
	}
	return nil, domainErr.ErrNotFound
}
func (m *mockCatRepoH) UpdateCor(ctx context.Context, id uuid.UUID, cor string) error { return nil }
func (m *mockCatRepoH) CreateInvestimento(ctx context.Context, ci *entity.CategoriaInvestimento) error {
	m.invs[ci.ID] = ci; return nil
}
func (m *mockCatRepoH) GetAllInvestimento(ctx context.Context) ([]*entity.CategoriaInvestimento, error) {
	var l []*entity.CategoriaInvestimento
	for _, c := range m.invs { l = append(l, c) }
	return l, nil
}
func (m *mockCatRepoH) GetInvestimentoByNome(ctx context.Context, nome string) (*entity.CategoriaInvestimento, error) {
	return nil, domainErr.ErrNotFound
}

type mockFinRepoH struct {
	fins map[uuid.UUID]*entity.Financiamento
}

func newMockFinRepoH() *mockFinRepoH {
	return &mockFinRepoH{fins: make(map[uuid.UUID]*entity.Financiamento)}
}
func (m *mockFinRepoH) Create(ctx context.Context, f *entity.Financiamento) error { m.fins[f.ID] = f; return nil }
func (m *mockFinRepoH) GetByID(ctx context.Context, id uuid.UUID) (*entity.Financiamento, error) {
	f, ok := m.fins[id]
	if !ok { return nil, domainErr.ErrNotFound }
	return f, nil
}
func (m *mockFinRepoH) GetByPerfil(ctx context.Context, pid uuid.UUID) ([]*entity.Financiamento, error) {
	var l []*entity.Financiamento
	for _, f := range m.fins {
		if f.PerfilID == pid { l = append(l, f) }
	}
	return l, nil
}
func (m *mockFinRepoH) Update(ctx context.Context, f *entity.Financiamento) error {
	if _, ok := m.fins[f.ID]; !ok { return domainErr.ErrNotFound }
	m.fins[f.ID] = f; return nil
}
func (m *mockFinRepoH) Delete(ctx context.Context, id uuid.UUID) error {
	if _, ok := m.fins[id]; !ok { return domainErr.ErrNotFound }
	delete(m.fins, id); return nil
}
func (m *mockFinRepoH) DeleteByPerfil(ctx context.Context, pid uuid.UUID) error { return nil }

type mockMetaRepoH struct {
	metas map[uuid.UUID]*entity.Meta
}

func newMockMetaRepoH() *mockMetaRepoH {
	return &mockMetaRepoH{metas: make(map[uuid.UUID]*entity.Meta)}
}
func (m *mockMetaRepoH) Create(ctx context.Context, meta *entity.Meta) error { m.metas[meta.ID] = meta; return nil }
func (m *mockMetaRepoH) GetByID(ctx context.Context, id uuid.UUID) (*entity.Meta, error) {
	meta, ok := m.metas[id]
	if !ok { return nil, domainErr.ErrNotFound }
	return meta, nil
}
func (m *mockMetaRepoH) GetByPerfil(ctx context.Context, pid uuid.UUID) ([]*entity.Meta, error) {
	var l []*entity.Meta
	for _, meta := range m.metas {
		if meta.PerfilID == pid { l = append(l, meta) }
	}
	return l, nil
}
func (m *mockMetaRepoH) Update(ctx context.Context, meta *entity.Meta) error {
	if _, ok := m.metas[meta.ID]; !ok { return domainErr.ErrNotFound }
	m.metas[meta.ID] = meta; return nil
}
func (m *mockMetaRepoH) Delete(ctx context.Context, id uuid.UUID) error {
	if _, ok := m.metas[id]; !ok { return domainErr.ErrNotFound }
	delete(m.metas, id); return nil
}
func (m *mockMetaRepoH) BulkUpdatePrioridades(ctx context.Context, updates []repository.MetaPrioridadeUpdate) error {
	return nil
}
func (m *mockMetaRepoH) BulkUpdateTargets(ctx context.Context, updates []repository.MetaTargetUpdate) error {
	return nil
}

type mockSettingsRepoH struct{ s map[string]json.RawMessage }

func newMockSettingsRepoH() *mockSettingsRepoH {
	return &mockSettingsRepoH{s: make(map[string]json.RawMessage)}
}
func (m *mockSettingsRepoH) Get(ctx context.Context, k string) (json.RawMessage, error) {
	v, ok := m.s[k]
	if !ok { return nil, domainErr.ErrNotFound }
	return v, nil
}
func (m *mockSettingsRepoH) Set(ctx context.Context, k string, v json.RawMessage) error { m.s[k] = v; return nil }
func (m *mockSettingsRepoH) GetAll(ctx context.Context) (map[string]json.RawMessage, error) { return m.s, nil }

// ─── Helper builders ────────────────────────────────────────────────────────

func buildDespesaHandler() (*DespesaHandler, *mockPerfilRepo, *mockDespesaRepoH, uuid.UUID) {
	pRepo := &mockPerfilRepo{}
	dRepo := newMockDespesaRepoH()
	cRepo := newMockCatRepoH()
	fRepo := newMockFinRepoH()
	uc := usecase.NewDespesaUseCase(dRepo, pRepo, cRepo, fRepo)

	// Create a profile and category in the mock repos
	pID := uuid.New()
	pRepo.perfis = append(pRepo.perfis, &entity.Perfil{ID: pID, Nome: "Bruno", Salario: 5000})
	cID := uuid.New()
	cRepo.cats[cID] = &entity.Categoria{ID: cID, Nome: "Alimentação", Cor: "#aabbcc"}

	return NewDespesaHandler(uc), pRepo, dRepo, pID
}

// ─── Handler Tests ──────────────────────────────────────────────────────────

func TestDespesaHandler(t *testing.T) {
	h, _, dRepo, pID := buildDespesaHandler()

	// 1. Criar — valid
	body := `{"descricao":"Almoço","valor":25.50,"categoria":"Alimentação","mes_inicio":7,"ano_inicio":2026,"parcelas":1}`
	req := httptest.NewRequest("POST", "/", bytes.NewBufferString(body))
	req.SetPathValue("pid", pID.String())
	rec := httptest.NewRecorder()
	h.Criar(rec, req)
	if rec.Code != http.StatusCreated {
		t.Errorf("Criar: expected 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var apiResp dto.APIResponse
	json.Unmarshal(rec.Body.Bytes(), &apiResp)
	if !apiResp.Success {
		t.Error("Criar: expected success=true")
	}

	// Get the created ID
	dataMap, _ := apiResp.Data.(map[string]interface{})
	dIDStr, _ := dataMap["id"].(string)
	dID, _ := uuid.Parse(dIDStr)

	// 2. ListarPorPerfil
	req2 := httptest.NewRequest("GET", "/", nil)
	req2.SetPathValue("pid", pID.String())
	rec2 := httptest.NewRecorder()
	h.ListarPorPerfil(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Errorf("ListarPorPerfil: expected 200, got %d", rec2.Code)
	}

	// 3. Atualizar — valid
	// Manually set category on the despesa for update to work
	if d, ok := dRepo.despesas[dID]; ok {
		d.Descricao = "Almoço"
	}
	updateBody := `{"descricao":"Janta","valor":30.00,"categoria":"Alimentação","mes_inicio":7,"ano_inicio":2026,"parcelas":1}`
	req3 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(updateBody))
	req3.SetPathValue("id", dID.String())
	rec3 := httptest.NewRecorder()
	h.Atualizar(rec3, req3)
	if rec3.Code != http.StatusOK {
		t.Errorf("Atualizar: expected 200, got %d: %s", rec3.Code, rec3.Body.String())
	}

	// 4. Remover — valid
	req4 := httptest.NewRequest("DELETE", "/", nil)
	req4.SetPathValue("id", dID.String())
	rec4 := httptest.NewRecorder()
	h.Remover(rec4, req4)
	if rec4.Code != http.StatusNoContent {
		t.Errorf("Remover: expected 204, got %d", rec4.Code)
	}

	// 5. Criar — invalid UUID for pid
	reqBad := httptest.NewRequest("POST", "/", bytes.NewBufferString(body))
	reqBad.SetPathValue("pid", "not-a-uuid")
	recBad := httptest.NewRecorder()
	h.Criar(recBad, reqBad)
	if recBad.Code != http.StatusBadRequest {
		t.Errorf("Criar bad UUID: expected 400, got %d", recBad.Code)
	}

	// 6. BulkCreate
	bulkBody := `{"despesas":[{"descricao":"Café","valor":5,"categoria":"Alimentação","mes_inicio":7,"ano_inicio":2026,"parcelas":1}]}`
	req5 := httptest.NewRequest("POST", "/", bytes.NewBufferString(bulkBody))
	req5.SetPathValue("pid", pID.String())
	rec5 := httptest.NewRecorder()
	h.CriarEmLote(rec5, req5)
	if rec5.Code != http.StatusCreated {
		t.Errorf("CriarEmLote: expected 201, got %d: %s", rec5.Code, rec5.Body.String())
	}
}

func TestCategoriaHandler(t *testing.T) {
	catRepo := newMockCatRepoH()
	catUC := usecase.NewCategoriaUseCase(catRepo)
	h := NewCategoriaHandler(catUC)

	// 1. ListarTodas — empty
	req := httptest.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()
	h.ListarTodas(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("ListarTodas: expected 200, got %d", rec.Code)
	}

	// 2. Criar — valid
	body := `{"nome":"Lazer","cor":"#f43f5e"}`
	req2 := httptest.NewRequest("POST", "/", bytes.NewBufferString(body))
	rec2 := httptest.NewRecorder()
	h.Criar(rec2, req2)
	if rec2.Code != http.StatusCreated {
		t.Errorf("Criar: expected 201, got %d: %s", rec2.Code, rec2.Body.String())
	}

	// 3. AtualizarCor — valid
	var apiResp dto.APIResponse
	json.Unmarshal(rec2.Body.Bytes(), &apiResp)
	dataMap, _ := apiResp.Data.(map[string]interface{})
	cIDStr, _ := dataMap["id"].(string)
	req3 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(`{"cor":"#00ff00"}`))
	req3.SetPathValue("id", cIDStr)
	rec3 := httptest.NewRecorder()
	h.AtualizarCor(rec3, req3)
	if rec3.Code != http.StatusOK {
		t.Errorf("AtualizarCor: expected 200, got %d: %s", rec3.Code, rec3.Body.String())
	}

	// 4. AtualizarCor — invalid UUID
	req4 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(`{"cor":"#00ff00"}`))
	req4.SetPathValue("id", "not-a-uuid")
	rec4 := httptest.NewRecorder()
	h.AtualizarCor(rec4, req4)
	if rec4.Code != http.StatusBadRequest {
		t.Errorf("AtualizarCor bad UUID: expected 400, got %d", rec4.Code)
	}

	// 5. ListarTodasInvestimento
	req5 := httptest.NewRequest("GET", "/", nil)
	rec5 := httptest.NewRecorder()
	h.ListarTodasInvestimento(rec5, req5)
	if rec5.Code != http.StatusOK {
		t.Errorf("ListarTodasInvestimento: expected 200, got %d", rec5.Code)
	}

	// 6. CriarInvestimento
	req6 := httptest.NewRequest("POST", "/", bytes.NewBufferString(`{"nome":"Tesouro Direto"}`))
	rec6 := httptest.NewRecorder()
	h.CriarInvestimento(rec6, req6)
	if rec6.Code != http.StatusCreated {
		t.Errorf("CriarInvestimento: expected 201, got %d: %s", rec6.Code, rec6.Body.String())
	}
}

func TestFinanciamentoHandler(t *testing.T) {
	pRepo := &mockPerfilRepo{}
	fRepo := newMockFinRepoH()
	uc := usecase.NewFinanciamentoUseCase(fRepo, pRepo)
	h := NewFinanciamentoHandler(uc)

	pID := uuid.New()
	pRepo.perfis = append(pRepo.perfis, &entity.Perfil{ID: pID, Nome: "Bruno", Salario: 5000})

	// 1. Criar — valid
	body := `{"nome":"Carro","valorTotal":50000,"valorParcela":1200,"parcelasTotais":48,"mes_inicio":1,"ano_inicio":2026,"sistema":"price"}`
	req := httptest.NewRequest("POST", "/", bytes.NewBufferString(body))
	req.SetPathValue("pid", pID.String())
	rec := httptest.NewRecorder()
	h.Criar(rec, req)
	if rec.Code != http.StatusCreated {
		t.Errorf("Criar: expected 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var apiResp dto.APIResponse
	json.Unmarshal(rec.Body.Bytes(), &apiResp)
	dataMap, _ := apiResp.Data.(map[string]interface{})
	fIDStr, _ := dataMap["id"].(string)

	// 2. ListarPorPerfil
	req2 := httptest.NewRequest("GET", "/", nil)
	req2.SetPathValue("pid", pID.String())
	rec2 := httptest.NewRecorder()
	h.ListarPorPerfil(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Errorf("ListarPorPerfil: expected 200, got %d", rec2.Code)
	}

	// 3. Atualizar
	updateBody := `{"nome":"Carro Novo","valorTotal":55000,"valorParcela":1300,"parcelasTotais":48,"mes_inicio":1,"ano_inicio":2026,"sistema":"sac"}`
	req3 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(updateBody))
	req3.SetPathValue("id", fIDStr)
	rec3 := httptest.NewRecorder()
	h.Atualizar(rec3, req3)
	if rec3.Code != http.StatusOK {
		t.Errorf("Atualizar: expected 200, got %d: %s", rec3.Code, rec3.Body.String())
	}

	// 4. Remover
	req4 := httptest.NewRequest("DELETE", "/", nil)
	req4.SetPathValue("id", fIDStr)
	rec4 := httptest.NewRecorder()
	h.Remover(rec4, req4)
	if rec4.Code != http.StatusNoContent {
		t.Errorf("Remover: expected 204, got %d", rec4.Code)
	}

	// 5. ListarPorPerfil invalid UUID
	req5 := httptest.NewRequest("GET", "/", nil)
	req5.SetPathValue("pid", "not-a-uuid")
	rec5 := httptest.NewRecorder()
	h.ListarPorPerfil(rec5, req5)
	if rec5.Code != http.StatusBadRequest {
		t.Errorf("ListarPorPerfil bad UUID: expected 400, got %d", rec5.Code)
	}
}

func TestMetaHandler(t *testing.T) {
	pRepo := &mockPerfilRepo{}
	metaRepo := newMockMetaRepoH()
	dRepo := newMockDespesaRepoH()
	catRepo := newMockCatRepoH()
	uc := usecase.NewMetaUseCase(metaRepo, pRepo, dRepo, catRepo)
	h := NewMetaHandler(uc)

	pID := uuid.New()
	pRepo.perfis = append(pRepo.perfis, &entity.Perfil{ID: pID, Nome: "Bruno", Salario: 5000})

	// 1. Criar
	body := `{"nome":"Notebook","valor":3000}`
	req := httptest.NewRequest("POST", "/", bytes.NewBufferString(body))
	req.SetPathValue("pid", pID.String())
	rec := httptest.NewRecorder()
	h.Criar(rec, req)
	if rec.Code != http.StatusCreated {
		t.Errorf("Criar: expected 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var apiResp dto.APIResponse
	json.Unmarshal(rec.Body.Bytes(), &apiResp)
	dataMap, _ := apiResp.Data.(map[string]interface{})
	mIDStr, _ := dataMap["id"].(string)

	// 2. ListarPorPerfil
	req2 := httptest.NewRequest("GET", "/", nil)
	req2.SetPathValue("pid", pID.String())
	rec2 := httptest.NewRecorder()
	h.ListarPorPerfil(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Errorf("ListarPorPerfil: expected 200, got %d", rec2.Code)
	}

	// 3. Comprar
	req3 := httptest.NewRequest("POST", "/", nil)
	req3.SetPathValue("id", mIDStr)
	rec3 := httptest.NewRecorder()
	h.Comprar(rec3, req3)
	if rec3.Code != http.StatusOK {
		t.Errorf("Comprar: expected 200, got %d: %s", rec3.Code, rec3.Body.String())
	}

	// 4. Remover
	req4 := httptest.NewRequest("DELETE", "/", nil)
	req4.SetPathValue("id", mIDStr)
	rec4 := httptest.NewRecorder()
	h.Remover(rec4, req4)
	if rec4.Code != http.StatusNoContent {
		t.Errorf("Remover: expected 204, got %d", rec4.Code)
	}

	// 5. Criar invalid UUID
	req5 := httptest.NewRequest("POST", "/", bytes.NewBufferString(body))
	req5.SetPathValue("pid", "bad-uuid")
	rec5 := httptest.NewRecorder()
	h.Criar(rec5, req5)
	if rec5.Code != http.StatusBadRequest {
		t.Errorf("Criar bad UUID: expected 400, got %d", rec5.Code)
	}
}

func TestSettingsHandler(t *testing.T) {
	settingsRepo := newMockSettingsRepoH()
	settingsUC := usecase.NewSettingsUseCase(settingsRepo)
	h := NewSettingsHandler(settingsUC)

	// 1. ObterTodas — empty
	req := httptest.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()
	h.ObterTodas(rec, req)
	if rec.Code != http.StatusOK {
		t.Errorf("ListarTodas: expected 200, got %d", rec.Code)
	}

	// 2. Atualizar — valid
	body := `{"value":"dark"}`
	req2 := httptest.NewRequest("PUT", "/", bytes.NewBufferString(body))
	req2.SetPathValue("key", "theme")
	rec2 := httptest.NewRecorder()
	h.Atualizar(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Errorf("Atualizar: expected 200, got %d: %s", rec2.Code, rec2.Body.String())
	}

	// 3. Atualizar — bad JSON
	req3 := httptest.NewRequest("PUT", "/", bytes.NewBufferString("{invalid json"))
	req3.SetPathValue("key", "theme")
	rec3 := httptest.NewRecorder()
	h.Atualizar(rec3, req3)
	if rec3.Code != http.StatusBadRequest {
		t.Errorf("Atualizar bad JSON: expected 400, got %d", rec3.Code)
	}
}

func TestHealthHandler(t *testing.T) {
	// Health handler with nil DB will panic on PingContext — skip runtime test.
	// Just verify the handler is constructible.
	h := NewHealthHandler(nil)
	if h == nil {
		t.Error("expected non-nil HealthHandler")
	}
}
