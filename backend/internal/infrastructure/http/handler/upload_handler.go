package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"saude-financeira-api/internal/infrastructure/config"
)

type UploadHandler struct {
	cfg *config.Config
}

func NewUploadHandler(cfg *config.Config) *UploadHandler {
	return &UploadHandler{cfg: cfg}
}

func (h *UploadHandler) UploadMetaFoto(w http.ResponseWriter, r *http.Request) {
	// 1. Limit body size to 2.1MB to prevent large uploads at server level
	r.Body = http.MaxBytesReader(w, r.Body, 2202010)

	err := r.ParseMultipartForm(2 << 20) // 2MB memory buffer
	if err != nil {
		writeError(w, fmt.Errorf("file size exceeds 2MB limit: %w", err))
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, fmt.Errorf("missing 'file' parameter in multipart form: %w", err))
		return
	}
	defer file.Close()

	// 2. Validate Size
	if header.Size > 2*1024*1024 {
		writeError(w, fmt.Errorf("file size (%d bytes) exceeds 2MB limit", header.Size))
		return
	}

	// 3. Read first 512 bytes to sniff Content-Type
	headerBytes := make([]byte, 512)
	n, _ := file.Read(headerBytes)
	contentType := http.DetectContentType(headerBytes[:n])

	// Reset file pointer
	_, _ = file.Seek(0, io.SeekStart)

	// Validate allowed MIME types
	allowedTypes := map[string]string{
		"image/jpeg": "jpg",
		"image/jpg":  "jpg",
		"image/png":  "png",
		"image/webp": "webp",
	}

	ext, ok := allowedTypes[strings.ToLower(contentType)]
	if !ok {
		writeError(w, fmt.Errorf("unsupported file type '%s'; only JPEG, PNG and WEBP are allowed", contentType))
		return
	}

	// 4. Generate unique name
	filename := fmt.Sprintf("%s.%s", uuid.New().String(), ext)
	targetDir := filepath.Join(h.cfg.UploadsPath, "metas")

	// Ensure target directory exists
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		writeError(w, fmt.Errorf("failed to create upload directory: %w", err))
		return
	}

	targetPath := filepath.Join(targetDir, filename)
	out, err := os.Create(targetPath)
	if err != nil {
		writeError(w, fmt.Errorf("failed to create file on disk: %w", err))
		return
	}
	defer out.Close()

	// 5. Copy content to file
	_, err = io.Copy(out, file)
	if err != nil {
		writeError(w, fmt.Errorf("failed to save file: %w", err))
		return
	}

	// 6. Return response path
	publicPath := fmt.Sprintf("/uploads/metas/%s", filename)
	writeSuccess(w, http.StatusOK, map[string]string{"path": publicPath})
}
