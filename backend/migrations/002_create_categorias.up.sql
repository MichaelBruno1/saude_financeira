CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    cor CHAR(7) NOT NULL DEFAULT '#64748b' CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'),
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_categorias_nome UNIQUE (nome)
);

CREATE TABLE IF NOT EXISTS categorias_investimento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cat_inv_nome UNIQUE (nome)
);

CREATE INDEX idx_categorias_nome ON categorias (nome);
CREATE INDEX idx_cat_inv_nome ON categorias_investimento (nome);
