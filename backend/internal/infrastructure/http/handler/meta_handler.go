package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/application/usecase"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type MetaHandler struct {
	uc *usecase.MetaUseCase
}

func NewMetaHandler(uc *usecase.MetaUseCase) *MetaHandler {
	return &MetaHandler{uc: uc}
}

func (h *MetaHandler) ListarPorPerfil(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	metas, err := h.uc.GetByPerfil(r.Context(), pid)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, metas)
}

func (h *MetaHandler) Criar(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.CreateMetaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.CreateMeta(r.Context(), pid, req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusCreated, res)
}

func (h *MetaHandler) Atualizar(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid meta UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.UpdateMetaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateMeta(r.Context(), id, req)
	if err != nil {
		writeError(w, err)
		return
	}

	res, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, res)
}

func (h *MetaHandler) Remover(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid meta UUID format", domainErr.ErrInvalidInput))
		return
	}

	err = h.uc.DeleteMeta(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *MetaHandler) Reordenar(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		writeError(w, fmt.Errorf("%w: failed to read request body", domainErr.ErrInvalidInput))
		return
	}

	var idsStr []string
	var req dto.ReorderMetasRequest
	if err := json.Unmarshal(bodyBytes, &req); err == nil && len(req.IDs) > 0 {
		idsStr = req.IDs
	} else if err := json.Unmarshal(bodyBytes, &idsStr); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	ids := make([]uuid.UUID, len(idsStr))
	for i, idStr := range idsStr {
		id, err := uuid.Parse(idStr)
		if err != nil {
			writeError(w, fmt.Errorf("%w: invalid UUID in list at index %d", domainErr.ErrInvalidInput, i))
			return
		}
		ids[i] = id
	}

	err = h.uc.ReorderMetas(r.Context(), pid, ids)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, map[string]string{"message": "metas priority reordered successfully"})
}

func (h *MetaHandler) Comprar(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid meta UUID format", domainErr.ErrInvalidInput))
		return
	}

	err = h.uc.ComprarMeta(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}

	res, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, res)
}

func (h *MetaHandler) AtualizarTargets(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req []dto.MetaReajusteTarget
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateMetaTargets(r.Context(), pid, req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, map[string]string{"message": "meta targets updated successfully"})
}
