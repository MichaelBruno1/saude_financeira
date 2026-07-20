package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"saude-financeira-api/internal/infrastructure/config"
	"saude-financeira-api/pkg/logger"
)

type APIResponse struct {
	Success bool            `json:"success"`
	Data    interface{}     `json:"data,omitempty"`
	Error   *APIResponseErr `json:"error,omitempty"`
}

type APIResponseErr struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func main() {
	cfg := config.LoadConfig()
	logger.Init(cfg.LogLevel)

	logger.Log.Info("Starting Saúde Financeira API...",
		"port", cfg.ServerPort,
		"env", os.Getenv("GO_ENV"),
	)

	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(APIResponse{
			Success: true,
			Data:    map[string]string{"status": "healthy"},
		})
	})

	// Readiness check endpoint
	mux.HandleFunc("GET /api/v1/health/ready", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		// In Step 1 we don't check Postgres connection yet, but we will in future steps
		json.NewEncoder(w).Encode(APIResponse{
			Success: true,
			Data:    map[string]string{"status": "ready"},
		})
	})

	addr := fmt.Sprintf(":%s", cfg.ServerPort)
	logger.Log.Info("Server is running", "addr", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		logger.Log.Error("Server failed to start", "error", err)
		os.Exit(1)
	}
}
