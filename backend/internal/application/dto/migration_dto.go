package dto

import "encoding/json"

type LocalStoragePerfil struct {
	Nome         string   `json:"nome"`
	Salario      float64  `json:"salario"`
	FGTS         float64  `json:"fgts"`
	MetaBaseline *float64 `json:"metaBaseline"`
}

type LocalStorageDespesa struct {
	ID              string  `json:"id"`
	Perfil          string  `json:"perfil"`
	Descricao       string  `json:"descricao"`
	Valor           float64 `json:"valor"`
	Categoria       string  `json:"categoria"`
	Subcategoria    *string `json:"subcategoria"`
	FinanciamentoID *string `json:"financiamentoId"`
	MesInicio       int     `json:"mes_inicio"`
	AnoInicio       int     `json:"ano_inicio"`
	Parcelas        int     `json:"parcelas"`
	Recorrente      bool    `json:"recorrente"`
}

type LocalStorageFinanciamento struct {
	ID             string  `json:"id"`
	Perfil         string  `json:"perfil"`
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

type LocalStorageMeta struct {
	ID          string  `json:"id"`
	Perfil      string  `json:"perfil"`
	Nome        string  `json:"nome"`
	Valor       float64 `json:"valor"`
	Foto        *string `json:"foto"`
	Comprado    bool    `json:"comprado"`
	Prioridade  int     `json:"prioridade"`
	ValorTarget float64 `json:"valorTarget"`
}

type LocalStorageState struct {
	Perfis         []LocalStoragePerfil        `json:"perfis"`
	Despesas       []LocalStorageDespesa       `json:"despesas"`
	Financiamentos []LocalStorageFinanciamento `json:"financiamentos"`
	Metas          []LocalStorageMeta          `json:"metas"`
	Categorias     map[string]string           `json:"categorias"`
	LLMConfig      json.RawMessage             `json:"llmConfig"`
	Theme          json.RawMessage             `json:"theme"`
	UltimoBackup   json.RawMessage             `json:"ultimoBackup"`
}

type MigrationResult struct {
	PerfisMigrados        int  `json:"perfis_migrados"`
	DespesasMigradas      int  `json:"despesas_migradas"`
	FinanciamentosMigrados int  `json:"financiamentos_migrados"`
	MetasMigradas         int  `json:"metas_migradas"`
	FotosExtraidas        int  `json:"fotos_extraidas"`
	CategoriasMigradas    int  `json:"categorias_migradas"`
	OrphansDetectados     int  `json:"orphans_detectados"`
	ValidationPassed      bool `json:"validation_passed"`
}

type FullStateResponse struct {
	Perfis         []*PerfilResponse        `json:"perfis"`
	Despesas       []*DespesaResponse       `json:"despesas"`
	Financiamentos []*FinanciamentoResponse `json:"financiamentos"`
	Metas          []*MetaResponse          `json:"metas"`
	Categorias     map[string]string        `json:"categorias"`
	LLMConfig      json.RawMessage          `json:"llmConfig"`
	Theme          json.RawMessage          `json:"theme"`
	UltimoBackup   json.RawMessage          `json:"ultimoBackup"`
}

