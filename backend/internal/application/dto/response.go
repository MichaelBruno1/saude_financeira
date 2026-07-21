package dto

type APIResponse struct {
	Success bool            `json:"success"`
	Data    interface{}     `json:"data,omitempty"`
	Error   *APIResponseErr `json:"error,omitempty"`
	Meta    *APIMeta        `json:"meta,omitempty"`
}

type APIResponseErr struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type APIMeta struct {
	Total int `json:"total"`
	Page  int `json:"page,omitempty"`
}
