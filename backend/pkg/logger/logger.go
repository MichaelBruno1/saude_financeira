package logger

import (
	"log/slog"
	"os"
	"strings"
)

var Log *slog.Logger

func init() {
	Log = slog.Default()
}

// Init initializes the global slog logger with the specified level.
func Init(levelStr string) {
	var level slog.Level
	switch strings.ToLower(levelStr) {
	case "debug":
		level = slog.LevelDebug
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level: level,
	}

	// Use JSON handler for structured logging
	handler := slog.NewJSONHandler(os.Stdout, opts)
	Log = slog.New(handler)
	slog.SetDefault(Log)
}
