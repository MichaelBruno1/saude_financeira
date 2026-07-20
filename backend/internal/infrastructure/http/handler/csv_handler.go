package handler

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"saude-financeira-api/internal/application/usecase"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type CSVHandler struct {
	uc *usecase.CSVUseCase
}

func NewCSVHandler(uc *usecase.CSVUseCase) *CSVHandler {
	return &CSVHandler{uc: uc}
}

func (h *CSVHandler) Exportar(w http.ResponseWriter, r *http.Request) {
	pid, err := uuid.Parse(r.PathValue("pid"))
	if err != nil {
		writeError(w, fmt.Errorf("%w: invalid profile UUID format", domainErr.ErrInvalidInput))
		return
	}

	csvStr, err := h.uc.ExportCSV(r.Context(), pid)
	if err != nil {
		writeError(w, err)
		return
	}

	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=perfil-%s.csv", pid.String()))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(csvStr))
}

func (h *CSVHandler) Importar(w http.ResponseWriter, r *http.Request) {
	var csvContent string

	contentType := r.Header.Get("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		// Read from uploaded file
		err := r.ParseMultipartForm(10 << 20) // 10MB limit
		if err != nil {
			writeError(w, fmt.Errorf("%w: failed to parse multipart form: %s", domainErr.ErrInvalidInput, err.Error()))
			return
		}

		file, _, err := r.FormFile("file")
		if err != nil {
			writeError(w, fmt.Errorf("%w: missing 'file' field in form-data: %s", domainErr.ErrInvalidInput, err.Error()))
			return
		}
		defer file.Close()

		bytes, err := io.ReadAll(file)
		if err != nil {
			writeError(w, fmt.Errorf("failed to read uploaded file: %w", err))
			return
		}
		csvContent = string(bytes)
	} else {
		// Read raw request body
		bytes, err := io.ReadAll(r.Body)
		if err != nil {
			writeError(w, fmt.Errorf("failed to read body: %w", err))
			return
		}
		csvContent = string(bytes)
	}

	res, err := h.uc.ImportCSV(r.Context(), csvContent)
	if err != nil {
		writeError(w, err)
		return
	}

	writeSuccess(w, http.StatusOK, res)
}
