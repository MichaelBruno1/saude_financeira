-- Categorias padrão
INSERT INTO categorias (nome, cor, is_system) VALUES
    ('Saúde', '#10b981', true),
    ('Alimentação', '#0ea5e9', true),
    ('Moradia', '#6366f1', true),
    ('Cartão de Crédito', '#f59e0b', true),
    ('Lazer', '#f43f5e', true),
    ('Serviços por Assinatura', '#8b5cf6', true),
    ('Serviços', '#14b8a6', true),
    ('Financiamento', '#d946ef', true),
    ('Amortização', '#06b6d4', true),
    ('Outros', '#64748b', true),
    ('Investimento', '#eab308', true)
ON CONFLICT (nome) DO NOTHING;

-- Subcategorias de investimento padrão
INSERT INTO categorias_investimento (nome, is_system) VALUES
    ('CDB', true), ('Previdência', true), ('Fundos', true),
    ('Ações', true), ('Poupança', true), ('FGTS', true), ('Outros', true)
ON CONFLICT (nome) DO NOTHING;

-- Planejamento padrão (todos os métodos)
INSERT INTO planejamento (metodo, categoria_id, percentual)
SELECT 'Conservador', c.id, v.pct FROM (VALUES
    ('Saúde',8),('Alimentação',18),('Moradia',30),('Lazer',5),('Cartão de Crédito',8),
    ('Serviços por Assinatura',2),('Serviços',9),('Investimento',20),
    ('Financiamento',0),('Outros',0),('Amortização',0)
) AS v(cat, pct) JOIN categorias c ON c.nome = v.cat
ON CONFLICT (metodo, categoria_id) DO NOTHING;

INSERT INTO planejamento (metodo, categoria_id, percentual)
SELECT 'Equilibrado', c.id, v.pct FROM (VALUES
    ('Saúde',7),('Alimentação',18),('Moradia',28),('Lazer',10),('Cartão de Crédito',10),
    ('Serviços por Assinatura',2),('Serviços',10),('Investimento',15),
    ('Financiamento',0),('Outros',0),('Amortização',0)
) AS v(cat, pct) JOIN categorias c ON c.nome = v.cat
ON CONFLICT (metodo, categoria_id) DO NOTHING;

INSERT INTO planejamento (metodo, categoria_id, percentual)
SELECT 'Agressivo', c.id, v.pct FROM (VALUES
    ('Saúde',6),('Alimentação',17),('Moradia',25),('Lazer',7),('Cartão de Crédito',8),
    ('Serviços por Assinatura',2),('Serviços',10),('Investimento',25),
    ('Financiamento',0),('Outros',0),('Amortização',0)
) AS v(cat, pct) JOIN categorias c ON c.nome = v.cat
ON CONFLICT (metodo, categoria_id) DO NOTHING;

-- Settings padrão
INSERT INTO settings (key, value) VALUES
    ('theme', '"dark"'),
    ('ultimo_backup', 'null'),
    ('llm_config', '{"apiUrl":"","apiKey":"","model":"","maxContext":10240}')
ON CONFLICT (key) DO NOTHING;
