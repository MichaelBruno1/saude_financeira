package dto

type CreatePerfilRequest struct {
	Nome    string  `json:"nome"`
	Salario float64 `json:"salario"`
}

type UpdateSalarioRequest struct {
	Salario float64 `json:"salario"`
}

type UpdateFGTSRequest struct {
	FGTS float64 `json:"fgts"`
}

type PerfilResponse struct {
	ID           string   `json:"id"`
	Nome         string   `json:"nome"`
	Salario      float64  `json:"salario"`
	FGTS         float64  `json:"fgts"`
	MetaBaseline *float64 `json:"meta_baseline"`
	CreatedAt    string   `json:"created_at"`
	UpdatedAt    string   `json:"updated_at"`
}
