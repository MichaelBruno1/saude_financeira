-- Ensure prioridade column exists on metas table and is properly indexed
ALTER TABLE metas ADD COLUMN IF NOT EXISTS prioridade INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_metas_perfil_prioridade ON metas (perfil_id, prioridade) WHERE NOT comprado;
