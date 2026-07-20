package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	domainErr "saude-financeira-api/internal/domain/errors"
)

type SettingsPostgres struct {
	db *sql.DB
}

func NewSettingsPostgres(db *sql.DB) *SettingsPostgres {
	return &SettingsPostgres{db: db}
}

func (r *SettingsPostgres) Get(ctx context.Context, key string) (json.RawMessage, error) {
	query := `
		SELECT value
		FROM settings
		WHERE key = $1
	`
	var val json.RawMessage
	err := r.db.QueryRowContext(ctx, query, key).Scan(&val)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, domainErr.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get setting by key %s: %w", key, err)
	}
	return val, nil
}

func (r *SettingsPostgres) Set(ctx context.Context, key string, value json.RawMessage) error {
	query := `
		INSERT INTO settings (key, value, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (key) DO UPDATE
		SET value = EXCLUDED.value, updated_at = NOW()
	`
	_, err := r.db.ExecContext(ctx, query, key, []byte(value))
	if err != nil {
		return fmt.Errorf("failed to upsert setting key %s: %w", key, err)
	}
	return nil
}

func (r *SettingsPostgres) GetAll(ctx context.Context) (map[string]json.RawMessage, error) {
	query := `
		SELECT key, value
		FROM settings
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query all settings: %w", err)
	}
	defer rows.Close()

	settings := make(map[string]json.RawMessage)
	for rows.Next() {
		var key string
		var value json.RawMessage
		err := rows.Scan(&key, &value)
		if err != nil {
			return nil, fmt.Errorf("failed to scan setting row: %w", err)
		}
		settings[key] = value
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}
	return settings, nil
}
