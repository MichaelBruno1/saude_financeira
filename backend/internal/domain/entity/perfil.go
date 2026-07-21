package entity

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Perfil struct {
	ID           uuid.UUID
	Nome         string
	Salario      float64
	FGTS         float64
	MetaBaseline *float64
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (p *Perfil) Validate() error {
	if p.Nome == "" {
		return fmt.Errorf("nome cannot be empty")
	}
	if len(p.Nome) > 100 {
		return fmt.Errorf("nome cannot be longer than 100 characters")
	}
	if p.Salario < 0 {
		return fmt.Errorf("salario cannot be negative")
	}
	if p.FGTS < 0 {
		return fmt.Errorf("fgts cannot be negative")
	}
	return nil
}
