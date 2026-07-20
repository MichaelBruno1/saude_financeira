package dto

type CreateCategoriaRequest struct {
	Nome string `json:"nome"`
	Cor  string `json:"cor"`
}

type UpdateCategoriaCorRequest struct {
	Cor string `json:"cor"`
}

type CategoriaResponse struct {
	ID        string `json:"id"`
	Nome      string `json:"nome"`
	Cor       string `json:"cor"`
	IsSystem  bool   `json:"is_system"`
	CreatedAt string `json:"created_at"`
}

type CreateCategoriaInvestimentoRequest struct {
	Nome string `json:"nome"`
}

type CategoriaInvestimentoResponse struct {
	ID        string `json:"id"`
	Nome      string `json:"nome"`
	IsSystem  bool   `json:"is_system"`
	CreatedAt string `json:"created_at"`
}
