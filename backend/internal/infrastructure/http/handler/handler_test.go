package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/application/usecase"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
	"saude-financeira-api/internal/infrastructure/config"
)

// Helper in-memory mock repositories from usecase layer reproduced/reused here.
// Since mocks_test.go is inside package 'usecase', we can redefine or import them.
// Redefining a simple inline mock or using the exact mock interfaces is easy.
type mockPerfilRepo struct {
	perfis []*entity.Perfil
}

func (m *mockPerfilRepo) Create(ctx context.Context, p *entity.Perfil) error {
	m.perfis = append(m.perfis, p)
	return nil
}
func (m *mockPerfilRepo) GetByID(ctx context.Context, id uuid.UUID) (*entity.Perfil, error) {
	for _, p := range m.perfis {
		if p.ID == id {
			return p, nil
		}
	}
	return nil, domainErr.ErrNotFound
}
func (m *mockPerfilRepo) GetByNome(ctx context.Context, nome string) (*entity.Perfil, error) {
	for _, p := range m.perfis {
		if strings.ToLower(p.Nome) == strings.ToLower(nome) {
			return p, nil
		}
	}
	return nil, domainErr.ErrNotFound
}
func (m *mockPerfilRepo) GetAll(ctx context.Context) ([]*entity.Perfil, error) {
	return m.perfis, nil
}
func (m *mockPerfilRepo) Update(ctx context.Context, p *entity.Perfil) error {
	return nil
}
func (m *mockPerfilRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return nil
}

func TestPerfilHandler(t *testing.T) {
	repo := &mockPerfilRepo{}
	uc := usecase.NewPerfilUseCase(repo)
	handler := NewPerfilHandler(uc)

	// 1. Test Criar Perfil
	reqBody := `{"nome": "Bruno", "salario": 5000}`
	req := httptest.NewRequest("POST", "/api/v1/perfis", bytes.NewBufferString(reqBody))
	rec := httptest.NewRecorder()

	handler.Criar(rec, req)

	if rec.Code != http.StatusCreated {
		t.Errorf("expected status 201 Created, got %d", rec.Code)
	}

	var apiResp dto.APIResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &apiResp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if !apiResp.Success {
		t.Errorf("expected success true, got false")
	}

	// 2. Test Listar Todos
	reqList := httptest.NewRequest("GET", "/api/v1/perfis", nil)
	recList := httptest.NewRecorder()

	handler.ListarTodos(recList, reqList)

	if recList.Code != http.StatusOK {
		t.Errorf("expected status 200 OK, got %d", recList.Code)
	}
}

func TestUploadHandler(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "uploads_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	cfg := &config.Config{
		UploadsPath: tempDir,
	}

	handler := NewUploadHandler(cfg)

	// 1. Create dummy multipart body with a valid PNG mime signature
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", "test.png")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}

	// Write standard PNG magic bytes header to trick mimetype sniffer
	pngHeader := []byte("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")
	_, _ = part.Write(pngHeader)
	_ = writer.Close()

	req := httptest.NewRequest("POST", "/api/v1/uploads/meta-foto", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	handler.UploadMetaFoto(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200 OK, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	var apiResp dto.APIResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &apiResp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if !apiResp.Success {
		t.Errorf("expected success true, got false")
	}
}

// Inline dummy implementation of remaining repositories to test migration handler
type mockMigrationRepo struct{}

func (m *mockMigrationRepo) ImportState(ctx context.Context, state *dto.LocalStorageState, uploadsPath string) (*dto.MigrationResult, error) {
	return &dto.MigrationResult{
		PerfisMigrados:        1,
		DespesasMigradas:      2,
		FinanciamentosMigrados: 0,
		MetasMigradas:         0,
		FotosExtraidas:        0,
		CategoriasMigradas:    1,
		OrphansDetectados:     0,
		ValidationPassed:      true,
	}, nil
}

type mockDespesaRepo struct{}
func (m *mockDespesaRepo) Create(ctx context.Context, d *entity.Despesa) error { return nil }
func (m *mockDespesaRepo) GetByID(ctx context.Context, id uuid.UUID) (*entity.Despesa, error) { return nil, nil }
func (m *mockDespesaRepo) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Despesa, error) { return nil, nil }
func (m *mockDespesaRepo) Update(ctx context.Context, d *entity.Despesa) error { return nil }
func (m *mockDespesaRepo) Delete(ctx context.Context, id uuid.UUID) error { return nil }
func (m *mockDespesaRepo) DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error { return nil }
func (m *mockDespesaRepo) BulkCreate(ctx context.Context, despesas []*entity.Despesa) error { return nil }

type mockFinancingRepo struct{}
func (m *mockFinancingRepo) Create(ctx context.Context, f *entity.Financiamento) error { return nil }
func (m *mockFinancingRepo) GetByID(ctx context.Context, id uuid.UUID) (*entity.Financiamento, error) { return nil, nil }
func (m *mockFinancingRepo) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Financiamento, error) { return nil, nil }
func (m *mockFinancingRepo) Update(ctx context.Context, f *entity.Financiamento) error { return nil }
func (m *mockFinancingRepo) Delete(ctx context.Context, id uuid.UUID) error { return nil }
func (m *mockFinancingRepo) DeleteByPerfil(ctx context.Context, perfilID uuid.UUID) error { return nil }

type mockMetaRepo struct{}
func (m *mockMetaRepo) Create(ctx context.Context, meta *entity.Meta) error { return nil }
func (m *mockMetaRepo) GetByID(ctx context.Context, id uuid.UUID) (*entity.Meta, error) { return nil, nil }
func (m *mockMetaRepo) GetByPerfil(ctx context.Context, perfilID uuid.UUID) ([]*entity.Meta, error) { return nil, nil }
func (m *mockMetaRepo) Update(ctx context.Context, meta *entity.Meta) error { return nil }
func (m *mockMetaRepo) Delete(ctx context.Context, id uuid.UUID) error { return nil }
func (m *mockMetaRepo) BulkUpdatePrioridades(ctx context.Context, updates []repository.MetaPrioridadeUpdate) error { return nil }
func (m *mockMetaRepo) BulkUpdateTargets(ctx context.Context, updates []repository.MetaTargetUpdate) error { return nil }

type mockCatRepo struct{}
func (m *mockCatRepo) Create(ctx context.Context, c *entity.Categoria) error { return nil }
func (m *mockCatRepo) GetAll(ctx context.Context) ([]*entity.Categoria, error) { return nil, nil }
func (m *mockCatRepo) GetByNome(ctx context.Context, nome string) (*entity.Categoria, error) { return nil, nil }
func (m *mockCatRepo) UpdateCor(ctx context.Context, id uuid.UUID, cor string) error { return nil }
func (m *mockCatRepo) CreateInvestimento(ctx context.Context, ci *entity.CategoriaInvestimento) error { return nil }
func (m *mockCatRepo) GetAllInvestimento(ctx context.Context) ([]*entity.CategoriaInvestimento, error) { return nil, nil }
func (m *mockCatRepo) GetInvestimentoByNome(ctx context.Context, nome string) (*entity.CategoriaInvestimento, error) { return nil, nil }

type mockSettingsRepo struct{}
func (m *mockSettingsRepo) Get(ctx context.Context, key string) (json.RawMessage, error) { return nil, nil }
func (m *mockSettingsRepo) Set(ctx context.Context, key string, value json.RawMessage) error { return nil }
func (m *mockSettingsRepo) GetAll(ctx context.Context) (map[string]json.RawMessage, error) { return nil, nil }

func TestMigrationHandler(t *testing.T) {
	cfg := &config.Config{UploadsPath: "."}
	mRepo := &mockMigrationRepo{}
	pRepo := &mockPerfilRepo{}
	dRepo := &mockDespesaRepo{}
	fRepo := &mockFinancingRepo{}
	mtRepo := &mockMetaRepo{}
	cRepo := &mockCatRepo{}
	sRepo := &mockSettingsRepo{}

	uc := usecase.NewMigrationUseCase(mRepo, pRepo, dRepo, fRepo, mtRepo, cRepo, sRepo, cfg)
	handler := NewMigrationHandler(uc)

	// 1. Import
	reqBody := `{"perfis":[{"nome":"Bruno","salario":5000}],"despesas":[],"financiamentos":[],"metas":[]}`
	req := httptest.NewRequest("POST", "/api/v1/migration/import-state", bytes.NewBufferString(reqBody))
	rec := httptest.NewRecorder()

	handler.ImportarEstado(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200 OK, got %d", rec.Code)
	}

	// 2. Fetch hydration state
	reqState := httptest.NewRequest("GET", "/api/v1/state", nil)
	recState := httptest.NewRecorder()

	handler.ObterEstadoCompleto(recState, reqState)

	if recState.Code != http.StatusOK {
		t.Errorf("expected status 200 OK, got %d", recState.Code)
	}
}
