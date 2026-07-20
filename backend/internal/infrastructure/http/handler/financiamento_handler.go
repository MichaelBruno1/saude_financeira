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

type FinanciamentoHandler struct {
	uc *usecase.FinanciamentoUseCase
}

func NewFinanciamentoHandler(uc *usecase.FinanciamentoUseCase) *FinanciamentoHandler {
	return &FinanciamentoHandler{uc: uc}
}

func (h *FinanciamentoHandler) ListarPorPerfil(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	finances, err := h.uc.GetByPerfil(r.Context(), pid)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, finances)
}

func (h *FinanciamentoHandler) Criar(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.CreateFinanciamentoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.CreateFinanciamento(r.Context(), pid, req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusCreated, res)
}

func (h *FinanciamentoHandler) Atualizar(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid financing UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.UpdateFinanciamentoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateFinanciamento(r.Context(), id, req)
	if err != nil {
		writeError(w, err)
		return
	}

	// Fetch updated financing to return
	res, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, res)
}

func (h *FinanciamentoHandler) Remover(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid financing UUID format", domainErr.ErrInvalidInput))
		return
	}

	err = h.uc.DeleteFinanciamento(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
