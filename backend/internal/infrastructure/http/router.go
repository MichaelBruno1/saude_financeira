package http

import (
	"net/http"

	"saude-financeira-api/internal/infrastructure/config"
	httpHandler "saude-financeira-api/internal/infrastructure/http/handler"
	"saude-financeira-api/internal/infrastructure/http/middleware"
)

// RouterConfig contains all dependencies for HTTP routing.
type RouterConfig struct {
	Config        *config.Config
	Health        *httpHandler.HealthHandler
	Perfil        *httpHandler.PerfilHandler
	Despesa       *httpHandler.DespesaHandler
	Financiamento *httpHandler.FinanciamentoHandler
	Meta          *httpHandler.MetaHandler
	Categoria     *httpHandler.CategoriaHandler
	Planejamento  *httpHandler.PlanejamentoHandler
	Settings      *httpHandler.SettingsHandler
	CSV           *httpHandler.CSVHandler
	LLM           *httpHandler.LLMHandler
	Upload        *httpHandler.UploadHandler
	Migration     *httpHandler.MigrationHandler
}

// NewRouter builds the http.ServeMux and wraps it in standard middlewares.
func NewRouter(cfg RouterConfig) http.Handler {
	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("/health", cfg.Health.Check)

	// API v1 Routing
	prefix := "/api/v1"

	// Perfis
	mux.HandleFunc("GET "+prefix+"/perfis", cfg.Perfil.ListarTodos)
	mux.HandleFunc("POST "+prefix+"/perfis", cfg.Perfil.Criar)
	mux.HandleFunc("PUT "+prefix+"/perfis/{id}/salario", cfg.Perfil.UpdateSalario)
	mux.HandleFunc("PUT "+prefix+"/perfis/{id}/fgts", cfg.Perfil.UpdateFGTS)
	mux.HandleFunc("DELETE "+prefix+"/perfis/{id}", cfg.Perfil.Remover)

	// Despesas
	mux.HandleFunc("GET "+prefix+"/perfis/{pid}/despesas", cfg.Despesa.ListarPorPerfil)
	mux.HandleFunc("POST "+prefix+"/perfis/{pid}/despesas", cfg.Despesa.Criar)
	mux.HandleFunc("POST "+prefix+"/perfis/{pid}/despesas/bulk", cfg.Despesa.CriarEmLote)
	mux.HandleFunc("PUT "+prefix+"/despesas/{id}", cfg.Despesa.Atualizar)
	mux.HandleFunc("DELETE "+prefix+"/despesas/{id}", cfg.Despesa.Remover)

	// Financiamentos
	mux.HandleFunc("GET "+prefix+"/perfis/{pid}/financiamentos", cfg.Financiamento.ListarPorPerfil)
	mux.HandleFunc("POST "+prefix+"/perfis/{pid}/financiamentos", cfg.Financiamento.Criar)
	mux.HandleFunc("PUT "+prefix+"/financiamentos/{id}", cfg.Financiamento.Atualizar)
	mux.HandleFunc("DELETE "+prefix+"/financiamentos/{id}", cfg.Financiamento.Remover)

	// Metas
	mux.HandleFunc("GET "+prefix+"/perfis/{pid}/metas", cfg.Meta.ListarPorPerfil)
	mux.HandleFunc("POST "+prefix+"/perfis/{pid}/metas", cfg.Meta.Criar)
	mux.HandleFunc("PUT "+prefix+"/metas/{id}", cfg.Meta.Atualizar)
	mux.HandleFunc("DELETE "+prefix+"/metas/{id}", cfg.Meta.Remover)
	mux.HandleFunc("POST "+prefix+"/perfis/{pid}/metas/reorder", cfg.Meta.Reordenar)
	mux.HandleFunc("POST "+prefix+"/metas/{id}/comprar", cfg.Meta.Comprar)
	mux.HandleFunc("PUT "+prefix+"/perfis/{pid}/metas/targets", cfg.Meta.AtualizarTargets)

	// Categorias
	mux.HandleFunc("GET "+prefix+"/categorias", cfg.Categoria.ListarTodas)
	mux.HandleFunc("POST "+prefix+"/categorias", cfg.Categoria.Criar)
	mux.HandleFunc("PUT "+prefix+"/categorias/{id}/cor", cfg.Categoria.AtualizarCor)
	mux.HandleFunc("GET "+prefix+"/categorias-investimento", cfg.Categoria.ListarTodasInvestimento)
	mux.HandleFunc("POST "+prefix+"/categorias-investimento", cfg.Categoria.CriarInvestimento)

	// Planejamento
	mux.HandleFunc("GET "+prefix+"/planejamento", cfg.Planejamento.Obter)
	mux.HandleFunc("PUT "+prefix+"/planejamento/{metodo}", cfg.Planejamento.Atualizar)

	// Settings
	mux.HandleFunc("GET "+prefix+"/settings", cfg.Settings.ObterTodas)
	mux.HandleFunc("PUT "+prefix+"/settings/{key}", cfg.Settings.Atualizar)

	// CSV Import/Export
	mux.HandleFunc("GET "+prefix+"/perfis/{pid}/csv/export", cfg.CSV.Exportar)
	mux.HandleFunc("POST "+prefix+"/csv/import", cfg.CSV.Importar)

	// LLM Proxy
	mux.HandleFunc("POST "+prefix+"/llm/{endpoint}", cfg.LLM.Proxy)

	// Uploads
	mux.HandleFunc("POST "+prefix+"/uploads/meta-foto", cfg.Upload.UploadMetaFoto)

	// Migration and Hydration State
	mux.HandleFunc("POST "+prefix+"/migration/import-state", cfg.Migration.ImportarEstado)
	mux.HandleFunc("GET "+prefix+"/state", cfg.Migration.ObterEstadoCompleto)

	// Serve Static Uploads (fallback or development)
	fs := http.FileServer(http.Dir(cfg.Config.UploadsPath))
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", fs))

	// Apply Middlewares in order:
	// RequestID -> Logging -> Recovery -> CORS -> AuthPlaceholder -> Router
	handler := http.Handler(mux)
	handler = middleware.AuthPlaceholder(handler)
	handler = middleware.CORS(cfg.Config.CorsOrigins)(handler)
	handler = middleware.Recovery(handler)
	handler = middleware.Logging(handler)
	handler = middleware.RequestID(handler)

	return handler
}
