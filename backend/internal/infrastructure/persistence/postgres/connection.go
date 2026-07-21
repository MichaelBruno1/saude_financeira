package postgres

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"saude-financeira-api/internal/infrastructure/config"
	"saude-financeira-api/pkg/logger"
)

// NewConnection opens a database connection pool and configures it.
func NewConnection(cfg *config.Config) (*sql.DB, error) {
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("database URL is empty")
	}

	logger.Log.Info("Connecting to PostgreSQL...", "url", cfg.DatabaseURL)

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(cfg.DBMaxOpenConns)
	db.SetMaxIdleConns(cfg.DBMaxIdleConns)
	db.SetConnMaxLifetime(cfg.DBConnMaxLifetime)

	// Verify the connection
	var lastErr error
	for i := 0; i < 10; i++ {
		err = db.Ping()
		if err == nil {
			logger.Log.Info("Successfully connected to PostgreSQL")
			return db, nil
		}
		lastErr = err
		logger.Log.Warn("Failed to ping PostgreSQL, retrying in 2 seconds...", "attempt", i+1, "error", err)
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("failed to ping database after retries: %w", lastErr)
}
