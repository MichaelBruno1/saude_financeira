CREATE TABLE IF NOT EXISTS despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL CHECK (valor > 0),
    categoria_id UUID NOT NULL REFERENCES categorias(id),
    subcategoria_investimento_id UUID REFERENCES categorias_investimento(id) ON DELETE SET NULL,
    financiamento_id UUID REFERENCES financiamentos(id) ON DELETE SET NULL,
    mes_inicio SMALLINT NOT NULL CHECK (mes_inicio BETWEEN 1 AND 12),
    ano_inicio SMALLINT NOT NULL,
    parcelas INTEGER NOT NULL DEFAULT 1 CHECK (parcelas >= 1),
    recorrente BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_despesas_perfil ON despesas (perfil_id);
CREATE INDEX idx_despesas_categoria ON despesas (categoria_id);
CREATE INDEX idx_despesas_perfil_periodo ON despesas (perfil_id, ano_inicio, mes_inicio);
CREATE INDEX idx_despesas_financiamento ON despesas (financiamento_id) WHERE financiamento_id IS NOT NULL;

CREATE TRIGGER trg_despesas_updated_at
    BEFORE UPDATE ON despesas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
