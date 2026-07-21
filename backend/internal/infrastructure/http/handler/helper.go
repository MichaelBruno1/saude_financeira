package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"saude-financeira-api/internal/application/dto"
	domainErr "saude-financeira-api/internal/domain/errors"
)

func writeJSON(w http.ResponseWriter, status int, response interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(response)
}

func writeSuccess(w http.ResponseWriter, status int, data interface{}) {
	writeJSON(w, status, dto.APIResponse{
		Success: true,
		Data:    data,
	})
}

func writeError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	code := "INTERNAL_ERROR"
	msg := err.Error()

	if errors.Is(err, domainErr.ErrNotFound) {
		status = http.StatusNotFound
		code = "NOT_FOUND"
	} else if errors.Is(err, domainErr.ErrAlreadyExists) {
		status = http.StatusConflict
		code = "CONFLICT"
	} else if errors.Is(err, domainErr.ErrValidation) {
		status = http.StatusUnprocessableEntity
		code = "VALIDATION_FAILED"
	} else if errors.Is(err, domainErr.ErrInvalidInput) {
		status = http.StatusBadRequest
		code = "BAD_REQUEST"
	} else if errors.Is(err, domainErr.ErrLLMUnavailable) {
		status = http.StatusBadGateway
		code = "LLM_UNAVAILABLE"
	} else if errors.Is(err, domainErr.ErrLLMTimeout) {
		status = http.StatusGatewayTimeout
		code = "LLM_TIMEOUT"
	}

	writeJSON(w, status, dto.APIResponse{
		Success: false,
		Error: &dto.APIResponseErr{
			Code:    code,
			Message: msg,
		},
	})
}
