CREATE TABLE IF NOT EXISTS financiamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL CHECK (valor_total > 0),
    valor_parcela DECIMAL(15, 2) NOT NULL CHECK (valor_parcela > 0),
    parcelas_totais INTEGER NOT NULL CHECK (parcelas_totais > 0),
    taxa_tr DECIMAL(8, 6) NOT NULL DEFAULT 0 CHECK (taxa_tr >= 0),
    mes_inicio SMALLINT NOT NULL CHECK (mes_inicio BETWEEN 1 AND 12),
    ano_inicio SMALLINT NOT NULL,
    sistema VARCHAR(10) NOT NULL DEFAULT 'price' CHECK (sistema IN ('sac', 'price')),
    taxa_juros_anual DECIMAL(8, 4) NOT NULL DEFAULT 0 CHECK (taxa_juros_anual >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_financiamentos_perfil ON financiamentos (perfil_id);

CREATE TRIGGER trg_financiamentos_updated_at
    BEFORE UPDATE ON financiamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
