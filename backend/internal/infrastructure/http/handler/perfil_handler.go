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

type PerfilHandler struct {
	uc *usecase.PerfilUseCase
}

func NewPerfilHandler(uc *usecase.PerfilUseCase) *PerfilHandler {
	return &PerfilHandler{uc: uc}
}

func (h *PerfilHandler) ListarTodos(w http.ResponseWriter, r *http.Request) {
	perfis, err := h.uc.GetAll(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, perfis)
}

func (h *PerfilHandler) Criar(w http.ResponseWriter, r *http.Request) {
	var req dto.CreatePerfilRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.CreatePerfil(r.Context(), req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusCreated, res)
}

func (h *PerfilHandler) UpdateSalario(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.UpdateSalarioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateSalario(r.Context(), id, req.Salario)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, map[string]string{"message": "salary updated successfully"})
}

func (h *PerfilHandler) UpdateFGTS(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.UpdateFGTSRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateFGTS(r.Context(), id, req.FGTS)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, map[string]string{"message": "fgts updated successfully"})
}

func (h *PerfilHandler) Remover(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid UUID format", domainErr.ErrInvalidInput))
		return
	}

	err = h.uc.DeletePerfil(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
