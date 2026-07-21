package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/application/usecase"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type LLMHandler struct {
	uc *usecase.LLMUseCase
}

func NewLLMHandler(uc *usecase.LLMUseCase) *LLMHandler {
	return &LLMHandler{uc: uc}
}

func (h *LLMHandler) Proxy(w http.ResponseWriter, r *http.Request) {
	endpoint := r.PathValue("endpoint")

	var req dto.LLMProxyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	// Use path parameter if prompt_name was not provided in JSON
	if req.PromptName == "" {
		req.PromptName = endpoint
	}

	res, err := h.uc.ProxyLLM(r.Context(), req)
	if err != nil {
		writeError(w, err)
		return
	}

	writeSuccess(w, http.StatusOK, res)
}
