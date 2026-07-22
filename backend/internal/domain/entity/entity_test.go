package entity

import (
	"strings"
	"testing"

	"github.com/google/uuid"
)

func TestPerfilValidate(t *testing.T) {
	baseline := 1000.0
	tests := []struct {
		name    string
		perfil  Perfil
		wantErr bool
	}{
		{
			name: "valid perfil",
			perfil: Perfil{
				Nome:         "Bruno",
				Salario:      5000.0,
				FGTS:         1000.0,
				MetaBaseline: &baseline,
			},
			wantErr: false,
		},
		{
			name: "empty nome",
			perfil: Perfil{
				Nome:    "",
				Salario: 5000.0,
			},
			wantErr: true,
		},
		{
			name: "nome too long",
			perfil: Perfil{
				Nome:    strings.Repeat("a", 101),
				Salario: 5000.0,
			},
			wantErr: true,
		},
		{
			name: "negative salario",
			perfil: Perfil{
				Nome:    "Bruno",
				Salario: -10.0,
			},
			wantErr: true,
		},
		{
			name: "negative fgts",
			perfil: Perfil{
				Nome:    "Bruno",
				Salario: 5000.0,
				FGTS:    -50.0,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.perfil.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Perfil.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDespesaValidate(t *testing.T) {
	perfilID := uuid.New()
	catID := uuid.New()
	tests := []struct {
		name    string
		despesa Despesa
		wantErr bool
	}{
		{
			name: "valid despesa",
			despesa: Despesa{
				PerfilID:    perfilID,
				Descricao:   "Mercado",
				Valor:       150.50,
				CategoriaID: catID,
				MesInicio:   5,
				AnoInicio:   2026,
				Parcelas:    1,
			},
			wantErr: false,
		},
		{
			name: "nil perfil id",
			despesa: Despesa{
				PerfilID:    uuid.Nil,
				Descricao:   "Mercado",
				Valor:       150.50,
				CategoriaID: catID,
				MesInicio:   5,
				AnoInicio:   2026,
				Parcelas:    1,
			},
			wantErr: true,
		},
		{
			name: "empty description",
			despesa: Despesa{
				PerfilID:    perfilID,
				Descricao:   "",
				Valor:       150.50,
				CategoriaID: catID,
				MesInicio:   5,
				AnoInicio:   2026,
				Parcelas:    1,
			},
			wantErr: true,
		},
		{
			name: "zero valor",
			despesa: Despesa{
				PerfilID:    perfilID,
				Descricao:   "Mercado",
				Valor:       0.0,
				CategoriaID: catID,
				MesInicio:   5,
				AnoInicio:   2026,
				Parcelas:    1,
			},
			wantErr: true,
		},
		{
			name: "valid negative valor (saque)",
			despesa: Despesa{
				PerfilID:    perfilID,
				Descricao:   "Saque Resgate",
				Valor:       -50.0,
				CategoriaID: catID,
				MesInicio:   5,
				AnoInicio:   2026,
				Parcelas:    1,
			},
			wantErr: false,
		},
		{
			name: "invalid mes",
			despesa: Despesa{
				PerfilID:    perfilID,
				Descricao:   "Mercado",
				Valor:       150.50,
				CategoriaID: catID,
				MesInicio:   13,
				AnoInicio:   2026,
				Parcelas:    1,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.despesa.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Despesa.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestFinanciamentoValidate(t *testing.T) {
	perfilID := uuid.New()
	tests := []struct {
		name          string
		financiamento Financiamento
		wantErr       bool
	}{
		{
			name: "valid sac",
			financiamento: Financiamento{
				PerfilID:       perfilID,
				Nome:           "Apartamento",
				ValorTotal:     300000,
				ValorParcela:   1500,
				ParcelasTotais: 360,
				MesInicio:      1,
				AnoInicio:      2026,
				Sistema:        "sac",
			},
			wantErr: false,
		},
		{
			name: "valid price",
			financiamento: Financiamento{
				PerfilID:       perfilID,
				Nome:           "Carro",
				ValorTotal:     50000,
				ValorParcela:   1200,
				ParcelasTotais: 48,
				MesInicio:      6,
				AnoInicio:      2026,
				Sistema:        "price",
			},
			wantErr: false,
		},
		{
			name: "invalid system",
			financiamento: Financiamento{
				PerfilID:       perfilID,
				Nome:           "Carro",
				ValorTotal:     50000,
				ValorParcela:   1200,
				ParcelasTotais: 48,
				MesInicio:      6,
				AnoInicio:      2026,
				Sistema:        "other",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.financiamento.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Financiamento.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestMetaValidate(t *testing.T) {
	perfilID := uuid.New()
	tests := []struct {
		name    string
		meta    Meta
		wantErr bool
	}{
		{
			name: "valid meta",
			meta: Meta{
				PerfilID:    perfilID,
				Nome:        "Viagem",
				Valor:       10000,
				Prioridade:  1,
				ValorTarget: 5000,
			},
			wantErr: false,
		},
		{
			name: "negative valor",
			meta: Meta{
				PerfilID: perfilID,
				Nome:     "Viagem",
				Valor:    -1,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.meta.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Meta.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestCategoriaValidate(t *testing.T) {
	tests := []struct {
		name      string
		categoria Categoria
		wantErr   bool
	}{
		{
			name: "valid hex color",
			categoria: Categoria{
				Nome: "Lazer",
				Cor:  "#ff00aa",
			},
			wantErr: false,
		},
		{
			name: "invalid color format",
			categoria: Categoria{
				Nome: "Lazer",
				Cor:  "ff00aa",
			},
			wantErr: true,
		},
		{
			name: "invalid color length",
			categoria: Categoria{
				Nome: "Lazer",
				Cor:  "#ff00aaa",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.categoria.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Categoria.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestPlanejamentoValidate(t *testing.T) {
	catID := uuid.New()
	tests := []struct {
		name         string
		planejamento Planejamento
		wantErr      bool
	}{
		{
			name: "valid planejamento",
			planejamento: Planejamento{
				Metodo:      "Conservador",
				CategoriaID: catID,
				Percentual:  50,
			},
			wantErr: false,
		},
		{
			name: "invalid method",
			planejamento: Planejamento{
				Metodo:      "Invalid",
				CategoriaID: catID,
				Percentual:  50,
			},
			wantErr: true,
		},
		{
			name: "invalid percentual",
			planejamento: Planejamento{
				Metodo:      "Conservador",
				CategoriaID: catID,
				Percentual:  105,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.planejamento.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Planejamento.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
