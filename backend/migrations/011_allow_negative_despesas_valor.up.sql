-- Allow negative values (withdrawals/saques) for despesas while forbidding zero
ALTER TABLE despesas DROP CONSTRAINT IF EXISTS despesas_valor_check;
ALTER TABLE despesas ADD CONSTRAINT despesas_valor_check CHECK (valor <> 0);
