CREATE TABLE IF NOT EXISTS metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
    foto TEXT,
    comprado BOOLEAN NOT NULL DEFAULT false,
    prioridade INTEGER NOT NULL DEFAULT 0,
    valor_target DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_metas_perfil ON metas (perfil_id);
CREATE INDEX idx_metas_perfil_prioridade ON metas (perfil_id, prioridade) WHERE NOT comprado;

CREATE TRIGGER trg_metas_updated_at
    BEFORE UPDATE ON metas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
