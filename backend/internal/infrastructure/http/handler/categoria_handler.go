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

type CategoriaHandler struct {
	uc *usecase.CategoriaUseCase
}

func NewCategoriaHandler(uc *usecase.CategoriaUseCase) *CategoriaHandler {
	return &CategoriaHandler{uc: uc}
}

func (h *CategoriaHandler) ListarTodas(w http.ResponseWriter, r *http.Request) {
	cats, err := h.uc.GetAll(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, cats)
}

func (h *CategoriaHandler) Criar(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateCategoriaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.CreateCategoria(r.Context(), req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusCreated, res)
}

func (h *CategoriaHandler) AtualizarCor(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid category UUID format", domainErr.ErrInvalidInput))
		return
	}

	var req dto.UpdateCategoriaCorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	err = h.uc.UpdateCor(r.Context(), id, req.Cor)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, map[string]string{"message": "category color updated successfully"})
}

func (h *CategoriaHandler) ListarTodasInvestimento(w http.ResponseWriter, r *http.Request) {
	cats, err := h.uc.GetAllInvestimento(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusOK, cats)
}

func (h *CategoriaHandler) CriarInvestimento(w http.ResponseWriter, r *http.Request) {
	var req dto.CreateCategoriaInvestimentoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, fmt.Errorf("%w: failed to parse request body: %s", domainErr.ErrInvalidInput, err.Error()))
		return
	}

	res, err := h.uc.CreateCategoriaInvestimento(r.Context(), req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeSuccess(w, http.StatusCreated, res)
}
