package dto

type CreateFinanciamentoRequest struct {
	Nome           string  `json:"nome"`
	ValorTotal     float64 `json:"valorTotal"`
	ValorParcela   float64 `json:"valorParcela"`
	ParcelasTotais int     `json:"parcelasTotais"`
	TaxaTR         float64 `json:"taxaTR"`
	MesInicio      int     `json:"mes_inicio"`
	AnoInicio      int     `json:"ano_inicio"`
	Sistema        string  `json:"sistema"`
	TaxaJurosAnual float64 `json:"taxaJurosAnual"`
}

type UpdateFinanciamentoRequest struct {
	Nome           string  `json:"nome"`
	ValorTotal     float64 `json:"valorTotal"`
	ValorParcela   float64 `json:"valorParcela"`
	ParcelasTotais int     `json:"parcelasTotais"`
	TaxaTR         float64 `json:"taxaTR"`
	MesInicio      int     `json:"mes_inicio"`
	AnoInicio      int     `json:"ano_inicio"`
	Sistema        string  `json:"sistema"`
	TaxaJurosAnual float64 `json:"taxaJurosAnual"`
}

type FinanciamentoResponse struct {
	ID             string  `json:"id"`
	PerfilID       string  `json:"perfil_id"`
	Nome           string  `json:"nome"`
	ValorTotal     float64 `json:"valorTotal"`
	ValorParcela   float64 `json:"valorParcela"`
	ParcelasTotais int     `json:"parcelasTotais"`
	TaxaTR         float64 `json:"taxaTR"`
	MesInicio      int     `json:"mes_inicio"`
	AnoInicio      int     `json:"ano_inicio"`
	Sistema        string  `json:"sistema"`
	TaxaJurosAnual float64 `json:"taxaJurosAnual"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}
