package entity

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Meta struct {
	ID          uuid.UUID
	PerfilID    uuid.UUID
	Nome        string
	Valor       float64
	Foto        *string
	Comprado    bool
	Prioridade  int
	ValorTarget float64
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (m *Meta) Validate() error {
	if m.PerfilID == uuid.Nil {
		return fmt.Errorf("perfil_id is required")
	}
	if m.Nome == "" {
		return fmt.Errorf("nome cannot be empty")
	}
	if len(m.Nome) > 255 {
		return fmt.Errorf("nome cannot be longer than 255 characters")
	}
	if m.Valor <= 0 {
		return fmt.Errorf("valor must be greater than zero")
	}
	if m.Prioridade < 0 {
		return fmt.Errorf("prioridade cannot be negative")
	}
	if m.ValorTarget < 0 {
		return fmt.Errorf("valor_target cannot be negative")
	}
	return nil
}
