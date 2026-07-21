package dto

type UpdatePlanejamentoRequest struct {
	Limites map[string]float64 `json:"limites"` // Key: categoria nome, Value: percentual
}

type PlanejamentoResponse struct {
	Metodo  string             `json:"metodo"`
	Limites map[string]float64 `json:"limites"` // Key: categoria nome, Value: percentual
}
