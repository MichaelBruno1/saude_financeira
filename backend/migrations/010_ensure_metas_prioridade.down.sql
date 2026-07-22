DROP INDEX IF EXISTS idx_metas_perfil_prioridade;
ALTER TABLE metas DROP COLUMN IF EXISTS prioridade;
