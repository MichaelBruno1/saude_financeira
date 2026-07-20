package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"saude-financeira-api/internal/application/dto"
	"saude-financeira-api/internal/domain/entity"
	domainErr "saude-financeira-api/internal/domain/errors"
	"saude-financeira-api/internal/domain/repository"
	"saude-financeira-api/internal/infrastructure/config"
	"saude-financeira-api/internal/infrastructure/llm"
)

type LLMUseCase struct {
	client       *llm.Client
	settingsRepo repository.SettingsRepository
	cfg          *config.Config
}

func NewLLMUseCase(
	client *llm.Client,
	settingsRepo repository.SettingsRepository,
	cfg *config.Config,
) *LLMUseCase {
	return &LLMUseCase{
		client:       client,
		settingsRepo: settingsRepo,
		cfg:          cfg,
	}
}

func (uc *LLMUseCase) ProxyLLM(ctx context.Context, req dto.LLMProxyRequest) (*dto.LLMProxyResponse, error) {
	// 1. Resolve LLM Configuration (Env > Database)
	apiURL, apiKey, model, err := uc.resolveLLMConfig(ctx)
	if err != nil {
		return nil, err
	}

	if apiURL == "" {
		return nil, fmt.Errorf("%w: LLM API URL is not configured", domainErr.ErrInvalidInput)
	}

	// 2. Read prompt template from disk
	template, err := uc.readPromptTemplate(req.PromptName)
	if err != nil {
		return nil, fmt.Errorf("failed to read prompt template: %w", err)
	}

	// 3. Interpolate context into template
	var contextMap map[string]interface{}
	if err := json.Unmarshal(req.Context, &contextMap); err != nil {
		return nil, fmt.Errorf("%w: invalid context JSON: %s", domainErr.ErrInvalidInput, err.Error())
	}

	promptText := uc.interpolatePrompt(template, contextMap)

	// 4. Call external LLM client
	// Set context timeout
	timeoutCtx, cancel := context.WithTimeout(ctx, uc.cfg.LLMTimeout)
	defer cancel()

	return uc.client.CallLLM(timeoutCtx, apiURL, apiKey, model, promptText)
}

func (uc *LLMUseCase) resolveLLMConfig(ctx context.Context) (string, string, string, error) {
	apiURL := uc.cfg.LLMAPIURL
	apiKey := uc.cfg.LLMAPIKey
	model := uc.cfg.LLMModel

	// If any is missing, check settings database
	if apiURL == "" || apiKey == "" || model == "" {
		dbVal, err := uc.settingsRepo.Get(ctx, "llm_config")
		if err == nil {
			var dbConfig entity.LLMConfig
			if err := json.Unmarshal(dbVal, &dbConfig); err == nil {
				if apiURL == "" {
					apiURL = dbConfig.APIUrl
				}
				if apiKey == "" {
					apiKey = dbConfig.APIKey
				}
				if model == "" {
					model = dbConfig.Model
				}
			}
		}
	}

	return apiURL, apiKey, model, nil
}

func (uc *LLMUseCase) readPromptTemplate(name string) (string, error) {
	// Sanitize name to prevent path traversal
	name = filepath.Clean(name)
	name = strings.ReplaceAll(name, "/", "")
	name = strings.ReplaceAll(name, "\\", "")

	// Check if prompt file name ends with .md
	if !strings.HasSuffix(name, ".md") {
		name = name + ".md"
	}

	// Try reading from default path
	pathsToTry := []string{
		filepath.Join(".", "prompts", name),
		filepath.Join(".", "backend", "prompts", name),
		filepath.Join("..", "prompts", name),
	}

	var bytes []byte
	var err error
	for _, path := range pathsToTry {
		bytes, err = os.ReadFile(path)
		if err == nil {
			return string(bytes), nil
		}
	}

	return "", fmt.Errorf("prompt template %s not found: %w", name, err)
}

func (uc *LLMUseCase) interpolatePrompt(template string, ctx map[string]interface{}) string {
	result := template
	for k, v := range ctx {
		placeholder := fmt.Sprintf("{{%s}}", strings.ToUpper(k))
		var valStr string
		switch val := v.(type) {
		case string:
			valStr = val
		case float64:
			// If it's an integer, format as integer
			if val == float64(int64(val)) {
				valStr = strconv.FormatInt(int64(val), 10)
			} else {
				valStr = strconv.FormatFloat(val, 'f', 2, 64)
			}
		case bool:
			if val {
				valStr = "sim"
			} else {
				valStr = "não"
			}
		default:
			// Marshall objects or arrays to JSON string
			bytes, err := json.Marshal(val)
			if err == nil {
				valStr = string(bytes)
			}
		}
		result = strings.ReplaceAll(result, placeholder, valStr)
	}
	return result
}
