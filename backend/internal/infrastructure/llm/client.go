package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"saude-financeira-api/internal/application/dto"
	domainErr "saude-financeira-api/internal/domain/errors"
)

type Client struct {
	httpClient *http.Client
}

func NewClient(timeout time.Duration) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: timeout,
		},
	}
}

type openAIChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIChatRequest struct {
	Model       string              `json:"model"`
	Messages    []openAIChatMessage `json:"messages"`
	Temperature float64             `json:"temperature"`
}

type openAIChatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
	} `json:"usage"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (c *Client) CallLLM(ctx context.Context, apiURL, apiKey, model string, prompt string) (*dto.LLMProxyResponse, error) {
	if apiURL == "" {
		return nil, fmt.Errorf("%w: llm api url not configured", domainErr.ErrInvalidInput)
	}

	reqBody := openAIChatRequest{
		Model:       model,
		Messages:    []openAIChatMessage{{Role: "user", Content: prompt}},
		Temperature: 0.1,
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	// OpenAI-compatible chat completion URL
	url := fmt.Sprintf("%s/chat/completions", apiURL)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		// Differentiate timeout
		if ctx.Err() == context.DeadlineExceeded {
			return nil, domainErr.ErrLLMTimeout
		}
		return nil, fmt.Errorf("%w: %s", domainErr.ErrLLMUnavailable, err.Error())
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errResp openAIChatResponse
		_ = json.Unmarshal(bodyBytes, &errResp)
		errMsg := resp.Status
		if errResp.Error != nil && errResp.Error.Message != "" {
			errMsg = errResp.Error.Message
		}
		return nil, fmt.Errorf("%w: API status %d - %s", domainErr.ErrLLMUnavailable, resp.StatusCode, errMsg)
	}

	var chatResp openAIChatResponse
	if err := json.Unmarshal(bodyBytes, &chatResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return nil, fmt.Errorf("%w: empty choice response from LLM", domainErr.ErrLLMUnavailable)
	}

	return &dto.LLMProxyResponse{
		Content: chatResp.Choices[0].Message.Content,
		Usage: dto.LLMUsageResponse{
			PromptTokens:     chatResp.Usage.PromptTokens,
			CompletionTokens: chatResp.Usage.CompletionTokens,
		},
	}, nil
}
