package errors

import "errors"

var (
	ErrNotFound       = errors.New("resource not found")
	ErrAlreadyExists  = errors.New("resource already exists")
	ErrValidation     = errors.New("validation failed")
	ErrInvalidInput   = errors.New("invalid input")
	ErrLLMUnavailable = errors.New("llm service unavailable")
	ErrLLMTimeout     = errors.New("llm request timeout")
	ErrInternal       = errors.New("internal server error")
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationErrors []ValidationError

func (e ValidationErrors) Error() string {
	if len(e) == 0 {
		return "validation failed"
	}
	return fmtError(e[0])
}

func fmtError(err ValidationError) string {
	if err.Field != "" {
		return err.Field + ": " + err.Message
	}
	return err.Message
}
