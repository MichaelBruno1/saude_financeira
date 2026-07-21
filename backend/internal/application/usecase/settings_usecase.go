package usecase

import (
	"context"
	"encoding/json"

	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/repository"
)

type SettingsUseCase struct {
	repo repository.SettingsRepository
}

func NewSettingsUseCase(repo repository.SettingsRepository) *SettingsUseCase {
	return &SettingsUseCase{repo: repo}
}

func (uc *SettingsUseCase) GetSettings(ctx context.Context) (dto.SettingsResponse, error) {
	settings, err := uc.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	return dto.SettingsResponse(settings), nil
}

func (uc *SettingsUseCase) UpdateSetting(ctx context.Context, key string, value json.RawMessage) error {
	return uc.repo.Set(ctx, key, value)
}
