package entity

import (
	"fmt"
	"regexp"
	"time"

	"github.com/google/uuid"
)

var hexColorRegex = regexp.MustCompile(`^#[0-9A-Fa-f]{6}$`)

type Categoria struct {
	ID        uuid.UUID
	Nome      string
	Cor       string
	IsSystem  bool
	CreatedAt time.Time
}

func (c *Categoria) Validate() error {
	if c.Nome == "" {
		return fmt.Errorf("nome cannot be empty")
	}
	if len(c.Nome) > 100 {
		return fmt.Errorf("nome cannot be longer than 100 characters")
	}
	if c.Cor != "" && !hexColorRegex.MatchString(c.Cor) {
		return fmt.Errorf("cor must be a valid hex color starting with #")
	}
	return nil
}

type CategoriaInvestimento struct {
	ID        uuid.UUID
	Nome      string
	IsSystem  bool
	CreatedAt time.Time
}

func (ci *CategoriaInvestimento) Validate() error {
	if ci.Nome == "" {
		return fmt.Errorf("nome cannot be empty")
	}
	if len(ci.Nome) > 100 {
		return fmt.Errorf("nome cannot be longer than 100 characters")
	}
	return nil
}
