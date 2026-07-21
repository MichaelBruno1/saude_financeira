package entity

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Despesa struct {
	ID                         uuid.UUID
	PerfilID                   uuid.UUID
	Descricao                  string
	Valor                      float64
	CategoriaID                uuid.UUID
	SubcategoriaInvestimentoID *uuid.UUID
	FinanciamentoID            *uuid.UUID
	MesInicio                  int
	AnoInicio                  int
	Parcelas                   int
	Recorrente                 bool
	CreatedAt                  time.Time
	UpdatedAt                  time.Time
}

func (d *Despesa) Validate() error {
	if d.PerfilID == uuid.Nil {
		return fmt.Errorf("perfil_id is required")
	}
	if d.Descricao == "" {
		return fmt.Errorf("descricao cannot be empty")
	}
	if len(d.Descricao) > 255 {
		return fmt.Errorf("descricao cannot be longer than 255 characters")
	}
	if d.Valor <= 0 {
		return fmt.Errorf("valor must be greater than zero")
	}
	if d.CategoriaID == uuid.Nil {
		return fmt.Errorf("categoria_id is required")
	}
	if d.MesInicio < 1 || d.MesInicio > 12 {
		return fmt.Errorf("mes_inicio must be between 1 and 12")
	}
	if d.AnoInicio <= 0 {
		return fmt.Errorf("ano_inicio must be positive")
	}
	if d.Parcelas < 1 {
		return fmt.Errorf("parcelas must be at least 1")
	}
	return nil
}
