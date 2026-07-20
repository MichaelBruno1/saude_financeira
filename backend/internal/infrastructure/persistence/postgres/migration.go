package postgres

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"saude-financeira-api/pkg/logger"
)

// RunMigrations runs all up migrations from the specified migrations path.
func RunMigrations(db *sql.DB, migrationsPath string) error {
	logger.Log.Info("Running migrations...", "path", migrationsPath)

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("could not create postgres driver: %w", err)
	}

	// golang-migrate expects file:// prefix for local files
	sourceURL := fmt.Sprintf("file://%s", migrationsPath)
	m, err := migrate.NewWithDatabaseInstance(sourceURL, "postgres", driver)
	if err != nil {
		return fmt.Errorf("could not create migrate instance: %w", err)
	}

	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			logger.Log.Info("No new migrations to run")
			return nil
		}
		return fmt.Errorf("failed to run up migrations: %w", err)
	}

	logger.Log.Info("Migrations executed successfully")
	return nil
}
