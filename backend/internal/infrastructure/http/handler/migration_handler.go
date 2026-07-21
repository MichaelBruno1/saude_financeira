package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/application/usecase"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type MigrationHandler struct {
	uc *usecase.MigrationUseCase
}

func NewMigrationHandler(uc *usecase.MigrationUseCase) *MigrationHandler {
	return &MigrationHandler{uc: uc}
}

func (h *MigrationHandler) ImportarEstado(w http.ResponseWriter, r *http.Request) {
	var req dto.LocalStorageState
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse state JSON: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.ImportState(r.Context(), &req)
	if err != nil {
		writeError(w, err)
		return
	}

	writeSuccess(w, http.StatusOK, res)
}

func (h *MigrationHandler) ObterEstadoCompleto(w http.ResponseWriter, r *http.Request) {
	res, err := h.uc.GetFullState(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}

	writeSuccess(w, http.StatusOK, res)
}
