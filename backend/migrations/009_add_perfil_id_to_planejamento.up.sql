ALTER TABLE planejamento ADD COLUMN perfil_id UUID REFERENCES perfis(id) ON DELETE CASCADE;

ALTER TABLE planejamento DROP CONSTRAINT IF EXISTS uq_planejamento_metodo_cat;

ALTER TABLE planejamento ADD CONSTRAINT uq_planejamento_metodo_cat_perfil UNIQUE NULLS NOT DISTINCT (metodo, categoria_id, perfil_id);
