CREATE TABLE IF NOT EXISTS planejamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metodo VARCHAR(50) NOT NULL CHECK (metodo IN ('Conservador', 'Equilibrado', 'Agressivo', 'Personalizado')),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    percentual DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (percentual >= 0 AND percentual <= 100),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_planejamento_metodo_cat UNIQUE (metodo, categoria_id)
);

CREATE INDEX idx_planejamento_metodo ON planejamento (metodo);

CREATE TRIGGER trg_planejamento_updated_at
    BEFORE UPDATE ON planejamento
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
