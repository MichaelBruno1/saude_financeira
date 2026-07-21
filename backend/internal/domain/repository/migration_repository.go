package repository

import (
	"context"
	"saude-financeira-api/internal/application/dto"
)

type MigrationRepository interface {
	ImportState(ctx context.Context, state *dto.LocalStorageState, uploadsPath string) (*dto.MigrationResult, error)
}
