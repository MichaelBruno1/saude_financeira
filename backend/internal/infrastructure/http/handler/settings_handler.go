package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"saude-financeira-api/internal/application/usecase"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type SettingsHandler struct {
	uc *usecase.SettingsUseCase
}

func NewSettingsHandler(uc *usecase.SettingsUseCase) *SettingsHandler {
	return &SettingsHandler{uc: uc}
}

func (h *SettingsHandler) ObterTodas(w http.ResponseWriter, r *http.Request) {
	settings, err := h.uc.GetSettings(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, settings)
}

func (h *SettingsHandler) Atualizar(w http.ResponseWriter, r *http.Request) {
	key := r.PathValue("key")
	if key == "" {
		writeError(w, fmt.Errorf("%w: settings key cannot be empty", domainErr.ErrInvalidInput))
		return
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		writeError(w, fmt.Errorf("%w: failed to read request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	// Validate it is valid JSON
	var dummy interface{}
	if err := json.Unmarshal(bodyBytes, &dummy); err != nil {
		writeError(w, fmt.Errorf("%w: invalid JSON format: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateSetting(r.Context(), key, json.RawMessage(bodyBytes))
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, map[string]string{"message": fmt.Sprintf("setting '%s' updated successfully", key)})
}
