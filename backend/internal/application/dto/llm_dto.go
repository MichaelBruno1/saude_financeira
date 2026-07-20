package dto

import "encoding/json"

type LLMProxyRequest struct {
	PromptName string            `json:"prompt_name"` // e.g. "agente", "analise", etc.
	Context    json.RawMessage   `json:"context"`
	Messages   []json.RawMessage `json:"messages,omitempty"`
}

type LLMUsageResponse struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
}

type LLMProxyResponse struct {
	Content string           `json:"content"`
	Usage   LLMUsageResponse `json:"usage"`
}
