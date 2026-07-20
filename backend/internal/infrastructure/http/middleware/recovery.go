package middleware

import (
	"encoding/json"
	"net/http"
	"runtime/debug"

	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/pkg/logger"
)

// Recovery catches panics, logs stack trace and returns a 500 error response.
func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				reqID := GetRequestID(r.Context())
				stack := string(debug.Stack())

				logger.Log.Error("Panic recovered",
					"request_id", reqID,
					"error", err,
					"stack", stack,
				)

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				_ = json.NewEncoder(w).Encode(dto.APIResponse{
					Success: false,
					Error: &dto.APIResponseErr{
						Code:    "INTERNAL_ERROR",
						Message: "An unexpected error occurred on the server",
					},
				})
			}
		}()

		next.ServeHTTP(w, r)
	})
}
