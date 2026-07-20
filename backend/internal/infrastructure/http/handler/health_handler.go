package handler

import (
	"database/sql"
	"net/http"
)

type HealthHandler struct {
	db *sql.DB
}

func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Check(w http.ResponseWriter, r *http.Request) {
	dbStatus := "connected"
	statusCode := http.StatusOK
	statusText := "healthy"
	
	if err := h.db.PingContext(r.Context()); err != nil {
		dbStatus = "disconnected"
		statusCode = http.StatusServiceUnavailable
		statusText = "unhealthy"
	}

	writeJSON(w, statusCode, map[string]interface{}{
		"status":   statusText,
		"database": dbStatus,
	})
}
