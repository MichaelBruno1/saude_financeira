package repository

import (
	"context"
	"encoding/json"
)

type SettingsRepository interface {
	Get(ctx context.Context, key string) (json.RawMessage, error)
	Set(ctx context.Context, key string, value json.RawMessage) error
	GetAll(ctx context.Context) (map[string]json.RawMessage, error)
}
