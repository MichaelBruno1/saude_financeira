package entity

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Financiamento struct {
	ID             uuid.UUID
	PerfilID       uuid.UUID
	Nome           string
	ValorTotal     float64
	ValorParcela   float64
	ParcelasTotais int
	TaxaTR         float64
	MesInicio      int
	AnoInicio      int
	Sistema        string
	TaxaJurosAnual float64
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func (f *Financiamento) Validate() error {
	if f.PerfilID == uuid.Nil {
		return fmt.Errorf("perfil_id is required")
	}
	if f.Nome == "" {
		return fmt.Errorf("nome cannot be empty")
	}
	if len(f.Nome) > 255 {
		return fmt.Errorf("nome cannot be longer than 255 characters")
	}
	if f.ValorTotal <= 0 {
		return fmt.Errorf("valor_total must be greater than zero")
	}
	if f.ValorParcela <= 0 {
		return fmt.Errorf("valor_parcela must be greater than zero")
	}
	if f.ParcelasTotais <= 0 {
		return fmt.Errorf("parcelas_totais must be greater than zero")
	}
	if f.TaxaTR < 0 {
		return fmt.Errorf("taxa_tr cannot be negative")
	}
	if f.MesInicio < 1 || f.MesInicio > 12 {
		return fmt.Errorf("mes_inicio must be between 1 and 12")
	}
	if f.AnoInicio <= 0 {
		return fmt.Errorf("ano_inicio must be positive")
	}
	if f.Sistema != "sac" && f.Sistema != "price" {
		return fmt.Errorf("sistema must be either 'sac' or 'price'")
	}
	if f.TaxaJurosAnual < 0 {
		return fmt.Errorf("taxa_juros_anual cannot be negative")
	}
	return nil
}
