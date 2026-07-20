package entity

import "fmt"

type LLMConfig struct {
	APIUrl     string `json:"apiUrl"`
	APIKey     string `json:"apiKey"`
	Model      string `json:"model"`
	MaxContext int    `json:"maxContext"`
}

func (l *LLMConfig) Validate() error {
	if l.MaxContext < 0 {
		return fmt.Errorf("maxContext cannot be negative")
	}
	return nil
}
