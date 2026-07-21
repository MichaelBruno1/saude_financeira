package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	ServerPort        string
	DatabaseURL       string
	DBMaxOpenConns    int
	DBMaxIdleConns    int
	DBConnMaxLifetime time.Duration
	LogLevel          string
	CorsOrigins       string
	MigrationsPath    string
	AutoMigrate       bool
	UploadsPath       string
	MaxUploadSize     int64
	LLMAPIURL         string
	LLMAPIKey         string
	LLMModel          string
	LLMMaxContext     int
	LLMTimeout        time.Duration
}

// LoadConfig loads configuration from environment variables with defaults.
func LoadConfig() *Config {
	return &Config{
		ServerPort:        getEnv("SERVER_PORT", "8081"),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		DBMaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
		DBMaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
		DBConnMaxLifetime: getEnvAsDuration("DB_CONN_MAX_LIFETIME", 5*time.Minute),
		LogLevel:          getEnv("LOG_LEVEL", "info"),
		CorsOrigins:       getEnv("CORS_ORIGINS", "http://localhost:8080"),
		MigrationsPath:    getEnv("MIGRATIONS_PATH", "./migrations"),
		AutoMigrate:       getEnvAsBool("AUTO_MIGRATE", true),
		UploadsPath:       getEnv("UPLOADS_PATH", "./uploads"),
		MaxUploadSize:     int64(getEnvAsInt("MAX_UPLOAD_SIZE", 5242880)),
		LLMAPIURL:         getEnv("LLM_API_URL", ""),
		LLMAPIKey:         getEnv("LLM_API_KEY", ""),
		LLMModel:          getEnv("LLM_MODEL", ""),
		LLMMaxContext:     getEnvAsInt("LLM_MAX_CONTEXT", 10240),
		LLMTimeout:        getEnvAsDuration("LLM_TIMEOUT", 120*time.Second),
	}
}

func getEnv(key, defaultVal string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultVal
}

func getEnvAsInt(name string, defaultVal int) int {
	valueStr := getEnv(name, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}

func getEnvAsBool(name string, defaultVal bool) bool {
	valStr := getEnv(name, "")
	if val, err := strconv.ParseBool(valStr); err == nil {
		return val
	}
	return defaultVal
}

func getEnvAsDuration(name string, defaultVal time.Duration) time.Duration {
	valStr := getEnv(name, "")
	if d, err := time.ParseDuration(valStr); err == nil {
		return d
	}
	return defaultVal
}
