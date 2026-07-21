package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/application/usecase"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type PlanejamentoHandler struct {
	uc *usecase.PlanejamentoUseCase
}

func NewPlanejamentoHandler(uc *usecase.PlanejamentoUseCase) *PlanejamentoHandler {
	return &PlanejamentoHandler{uc: uc}
}

func (h *PlanejamentoHandler) Obter(w http.ResponseWriter, r *http.Request) {
	pidStr := r.PathValue("pid")
	pid, err := uuid.Parse(pidStr)
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile id format: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	plan, err := h.uc.GetPlanejamento(r.Context(), pid)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, plan)
}

func (h *PlanejamentoHandler) Atualizar(w http.ResponseWriter, r *http.Request) {
	pidStr := r.PathValue("pid")
	pid, err := uuid.Parse(pidStr)
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile id format: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	metodo := r.PathValue("metodo")

	var req dto.UpdatePlanejamentoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdatePlanejamento(r.Context(), pid, metodo, req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, map[string]string{"message": fmt.Sprintf("planning limits for method '%s' updated successfully", metodo)})
}
