package dto

type CreateMetaRequest struct {
	Nome     string  `json:"nome"`
	Valor    float64 `json:"valor"`
	Foto     *string `json:"foto"`
	Comprado bool    `json:"comprado"`
}

type UpdateMetaRequest struct {
	Nome     string  `json:"nome"`
	Valor    float64 `json:"valor"`
	Foto     *string `json:"foto"`
	Comprado bool    `json:"comprado"`
}

type ReorderMetasRequest struct {
	IDs []string `json:"ids"`
}

type MetaReajusteTarget struct {
	ID          string  `json:"id"`
	ValorTarget float64 `json:"valorTarget"`
}

type UpdateMetaTargetsRequest struct {
	Reajustes []MetaReajusteTarget `json:"reajustes"`
}

type MetaResponse struct {
	ID          string  `json:"id"`
	PerfilID    string  `json:"perfil_id"`
	Nome        string  `json:"nome"`
	Valor       float64 `json:"valor"`
	Foto        *string `json:"foto"`
	Comprado    bool    `json:"comprado"`
	Prioridade  int     `json:"prioridade"`
	ValorTarget float64 `json:"valor_target"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}
