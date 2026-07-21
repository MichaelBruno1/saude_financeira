package dto

type CreateDespesaRequest struct {
	Descricao                  string  `json:"descricao"`
	Valor                      float64 `json:"valor"`
	Categoria                  string  `json:"categoria"`                   // Categoria nome
	SubcategoriaInvestimento   *string `json:"subcategoria_investimento"`   // Subcategoria nome (optional)
	FinanciamentoID            *string `json:"financiamento_id"`            // Financiamento ID (optional)
	MesInicio                  int     `json:"mes_inicio"`
	AnoInicio                  int     `json:"ano_inicio"`
	Parcelas                   int     `json:"parcelas"`
	Recorrente                 bool    `json:"recorrente"`
}

type UpdateDespesaRequest struct {
	Descricao                  string  `json:"descricao"`
	Valor                      float64 `json:"valor"`
	Categoria                  string  `json:"categoria"`
	SubcategoriaInvestimento   *string `json:"subcategoria_investimento"`
	FinanciamentoID            *string `json:"financiamento_id"`
	MesInicio                  int     `json:"mes_inicio"`
	AnoInicio                  int     `json:"ano_inicio"`
	Parcelas                   int     `json:"parcelas"`
	Recorrente                 bool    `json:"recorrente"`
}

type BulkCreateDespesasRequest struct {
	Despesas []CreateDespesaRequest `json:"despesas"`
}

type DespesaResponse struct {
	ID                         string  `json:"id"`
	PerfilID                   string  `json:"perfil_id"`
	Descricao                  string  `json:"descricao"`
	Valor                      float64 `json:"valor"`
	CategoriaID                string  `json:"categoria_id"`
	Categoria                  string  `json:"categoria"` // Categoria nome
	SubcategoriaInvestimentoID *string `json:"subcategoria_investimento_id"`
	SubcategoriaInvestimento   *string `json:"subcategoria_investimento"` // Subcategoria nome
	FinanciamentoID            *string `json:"financiamento_id"`
	MesInicio                  int     `json:"mes_inicio"`
	AnoInicio                  int     `json:"ano_inicio"`
	Parcelas                   int     `json:"parcelas"`
	Recorrente                 bool    `json:"recorrente"`
	CreatedAt                  string  `json:"created_at"`
	UpdatedAt                  string  `json:"updated_at"`
}
