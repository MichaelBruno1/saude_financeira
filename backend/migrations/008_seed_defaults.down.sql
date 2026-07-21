DELETE FROM settings WHERE key IN ('theme', 'ultimo_backup', 'llm_config');
DELETE FROM planejamento WHERE metodo IN ('Conservador', 'Equilibrado', 'Agressivo');
DELETE FROM categorias_investimento WHERE nome IN ('CDB', 'Previdência', 'Fundos', 'Ações', 'Poupança', 'FGTS', 'Outros') AND is_system = true;
DELETE FROM categorias WHERE nome IN ('Saúde', 'Alimentação', 'Moradia', 'Cartão de Crédito', 'Lazer', 'Serviços por Assinatura', 'Serviços', 'Financiamento', 'Amortização', 'Outros', 'Investimento') AND is_system = true;
