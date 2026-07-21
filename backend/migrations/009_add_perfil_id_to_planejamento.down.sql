ALTER TABLE planejamento DROP CONSTRAINT IF EXISTS uq_planejamento_metodo_cat_perfil;

ALTER TABLE planejamento ADD CONSTRAINT uq_planejamento_metodo_cat UNIQUE (metodo, categoria_id);

ALTER TABLE planejamento DROP COLUMN IF EXISTS perfil_id;
