package entity

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Planejamento struct {
	ID          uuid.UUID
	Metodo      string
	CategoriaID uuid.UUID
	Percentual  float64
	PerfilID    *uuid.UUID
	UpdatedAt   time.Time
}

func (pl *Planejamento) Validate() error {
	if pl.Metodo != "Conservador" && pl.Metodo != "Equilibrado" && pl.Metodo != "Agressivo" && pl.Metodo != "Personalizado" {
		return fmt.Errorf("metodo must be 'Conservador', 'Equilibrado', 'Agressivo' or 'Personalizado'")
	}
	if pl.CategoriaID == uuid.Nil {
		return fmt.Errorf("categoria_id is required")
	}
	if pl.Percentual < 0 || pl.Percentual > 100 {
		return fmt.Errorf("percentual must be between 0 and 100")
	}
	return nil
}
