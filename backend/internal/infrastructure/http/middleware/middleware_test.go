package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"saude-financeira-api/internal/application/dto"
)

func TestRequestIDMiddleware(t *testing.T) {
	handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := GetRequestID(r.Context())
		if reqID == "" {
			t.Errorf("expected request ID in context, got empty")
		}
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	resHeader := rec.Header().Get("X-Request-ID")
	if resHeader == "" {
		t.Errorf("expected X-Request-ID in response header")
	}
}

func TestCORS(t *testing.T) {
	corsMiddleware := CORS("http://localhost:3000")
	handler := corsMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// 1. Valid origin GET request
	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Errorf("expected Access-Control-Allow-Origin header")
	}

	// 2. Preflight options request
	reqOptions := httptest.NewRequest("OPTIONS", "/", nil)
	reqOptions.Header.Set("Origin", "http://localhost:3000")
	recOptions := httptest.NewRecorder()

	handler.ServeHTTP(recOptions, reqOptions)

	if recOptions.Code != http.StatusNoContent {
		t.Errorf("expected status 204 NoContent on preflight OPTIONS request, got %d", recOptions.Code)
	}
}

func TestRecoveryMiddleware(t *testing.T) {
	handler := Recovery(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("intentional testing panic")
	}))

	req := httptest.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("expected status 500 on panic recovery, got %d", rec.Code)
	}

	var apiResp dto.APIResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &apiResp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if apiResp.Success {
		t.Errorf("expected success false, got true")
	}
	if apiResp.Error.Code != "INTERNAL_ERROR" {
		t.Errorf("expected error code INTERNAL_ERROR, got %s", apiResp.Error.Code)
	}
}

func TestLoggingMiddleware(t *testing.T) {
	handler := Logging(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusAccepted)
	}))

	req := httptest.NewRequest("POST", "/test-path", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusAccepted {
		t.Errorf("expected status 202, got %d", rec.Code)
	}
}

func TestAuthPlaceholderMiddleware(t *testing.T) {
	handler := AuthPlaceholder(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest("GET", "/", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
}
