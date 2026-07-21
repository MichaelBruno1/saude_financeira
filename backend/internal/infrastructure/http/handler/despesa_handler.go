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

type DespesaHandler struct {
	uc *usecase.DespesaUseCase
}

func NewDespesaHandler(uc *usecase.DespesaUseCase) *DespesaHandler {
	return &DespesaHandler{uc: uc}
}

func (h *DespesaHandler) ListarPorPerfil(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	despesas, err := h.uc.GetByPerfil(r.Context(), pid)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, despesas)
}

func (h *DespesaHandler) Criar(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.CreateDespesaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.CreateDespesa(r.Context(), pid, req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusCreated, res)
}

func (h *DespesaHandler) CriarEmLote(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.BulkCreateDespesasRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.BulkCreateDespesas(r.Context(), pid, req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusCreated, res)
}

func (h *DespesaHandler) Atualizar(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid despesa UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.UpdateDespesaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateDespesa(r.Context(), id, req)
	if err != nil {
		writeError(w, err)
		return
	}

	// Fetch updated despesa to return
	res, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, res)
}

func (h *DespesaHandler) Remover(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid despesa UUID format", domainErr.ErrInvalidInput))
		return
	}

	err = h.uc.DeleteDespesa(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
