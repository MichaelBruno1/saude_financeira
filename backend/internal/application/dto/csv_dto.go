package dto

type CSVImportRow struct {
	Perfil       string  `csv:"perfil"`
	SalarioBase  float64 `csv:"salario_base"`
	TipoRegistro string  `csv:"tipo_registro"`
	Descricao    string  `csv:"descricao"`
	Valor        float64 `csv:"valor"`
	Categoria    string  `csv:"categoria"`
	MesInicio    int     `csv:"mes_inicio"`
	AnoInicio    int     `csv:"ano_inicio"`
	Parcelas     int     `csv:"parcelas"`
	Recorrente   bool    `csv:"recorrente"`
	ValorParcela float64 `csv:"valor_parcela"`
	TaxaTR       float64 `csv:"taxa_tr"`
}

type CSVImportResult struct {
	PerfilID             string `json:"perfil_id"`
	PerfilNome           string `json:"perfil_nome"`
	DespesasImportadas   int    `json:"despesas_importadas"`
	FinancImportados     int    `json:"financiamentos_importados"`
	CategoriasImportadas int    `json:"categorias_importadas"`
}
