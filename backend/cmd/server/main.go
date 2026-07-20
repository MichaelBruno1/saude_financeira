package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"saude-financeira-api/internal/application/usecase"
	"saude-financeira-api/internal/infrastructure/config"
	httpRouter "saude-financeira-api/internal/infrastructure/http"
	httpHandler "saude-financeira-api/internal/infrastructure/http/handler"
	"saude-financeira-api/internal/infrastructure/llm"
	"saude-financeira-api/internal/infrastructure/persistence/postgres"
	"saude-financeira-api/pkg/logger"
)

func main() {
	cfg := config.LoadConfig()
	logger.Init(cfg.LogLevel)

	logger.Log.Info("Starting Saúde Financeira API...",
		"port", cfg.ServerPort,
		"env", os.Getenv("GO_ENV"),
	)

	// Connect to database
	db, err := postgres.NewConnection(cfg)
	if err != nil {
		logger.Log.Error("Failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// Run migrations if enabled
	if cfg.AutoMigrate {
		if err := postgres.RunMigrations(db, cfg.MigrationsPath); err != nil {
			logger.Log.Error("Failed to run migrations", "error", err)
			os.Exit(1)
		}
	}

	// 1. Repositories
	perfilRepo := postgres.NewPerfilPostgres(db)
	despRepo := postgres.NewDespesaPostgres(db)
	finRepo := postgres.NewFinanciamentoPostgres(db)
	metaRepo := postgres.NewMetaPostgres(db)
	catRepo := postgres.NewCategoriaPostgres(db)
	planRepo := postgres.NewPlanejamentoPostgres(db)
	settingsRepo := postgres.NewSettingsPostgres(db)
	migRepo := postgres.NewMigrationPostgres(db)

	// 2. Use Cases
	perfilUC := usecase.NewPerfilUseCase(perfilRepo)
	despUC := usecase.NewDespesaUseCase(despRepo, perfilRepo, catRepo, finRepo)
	finUC := usecase.NewFinanciamentoUseCase(finRepo, perfilRepo)
	metaUC := usecase.NewMetaUseCase(metaRepo, perfilRepo, despRepo, catRepo)
	catUC := usecase.NewCategoriaUseCase(catRepo)
	planUC := usecase.NewPlanejamentoUseCase(planRepo, catRepo)
	settingsUC := usecase.NewSettingsUseCase(settingsRepo)
	csvUC := usecase.NewCSVUseCase(perfilRepo, despRepo, finRepo, catRepo)

	llmClient := llm.NewClient(cfg.LLMTimeout)
	llmUC := usecase.NewLLMUseCase(llmClient, settingsRepo, cfg)

	migUC := usecase.NewMigrationUseCase(migRepo, perfilRepo, despRepo, finRepo, metaRepo, catRepo, settingsRepo, cfg)

	// 3. HTTP Handlers
	healthH := httpHandler.NewHealthHandler(db)
	perfilH := httpHandler.NewPerfilHandler(perfilUC)
	despH := httpHandler.NewDespesaHandler(despUC)
	finH := httpHandler.NewFinanciamentoHandler(finUC)
	metaH := httpHandler.NewMetaHandler(metaUC)
	catH := httpHandler.NewCategoriaHandler(catUC)
	planH := httpHandler.NewPlanejamentoHandler(planUC)
	settingsH := httpHandler.NewSettingsHandler(settingsUC)
	csvH := httpHandler.NewCSVHandler(csvUC)
	llmH := httpHandler.NewLLMHandler(llmUC)
	uploadH := httpHandler.NewUploadHandler(cfg)
	migH := httpHandler.NewMigrationHandler(migUC)

	// 4. Router Config
	routerConfig := httpRouter.RouterConfig{
		Config:        cfg,
		Health:        healthH,
		Perfil:        perfilH,
		Despesa:       despH,
		Financiamento: finH,
		Meta:          metaH,
		Categoria:     catH,
		Planejamento:  planH,
		Settings:      settingsH,
		CSV:           csvH,
		LLM:           llmH,
		Upload:        uploadH,
		Migration:     migH,
	}

	router := httpRouter.NewRouter(routerConfig)

	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	logger.Log.Info("Server is running", "addr", addr)
	
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  120 * time.Second,
		WriteTimeout: 120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil {
		logger.Log.Error("Server failed to start", "error", err)
		os.Exit(1)
	}
}
