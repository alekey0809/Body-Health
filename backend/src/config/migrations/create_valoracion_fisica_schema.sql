-- ============================================================
-- MÓDULO DE VALORACIÓN FÍSICA - BodyHealth
-- Tabla: valoracion_fisica
-- ============================================================

-- 1. VALORACIÓN FÍSICA
CREATE TABLE IF NOT EXISTS valoracion_fisica (
    vf_id                     SERIAL PRIMARY KEY,
    vf_u_id                   UUID NOT NULL REFERENCES usuario(u_id) ON DELETE RESTRICT,
    vf_fecha_registro         DATE NOT NULL DEFAULT CURRENT_DATE,
    vf_peso_kg                NUMERIC(5,2) NOT NULL,
    vf_estatura_cm            INTEGER NOT NULL,
    vf_medida_pecho           NUMERIC(5,2),
    vf_medida_cintura         NUMERIC(5,2) NOT NULL,
    vf_medida_cadera          NUMERIC(5,2),
    vf_medida_cuello          NUMERIC(5,2) NOT NULL,
    vf_genero                 VARCHAR(1) NOT NULL CHECK (vf_genero IN ('M', 'F')),
    vf_porcentaje_grasa       NUMERIC(5,2),
    vf_observaciones          TEXT,
    vf_fecha_creacion         TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_valoracion_fisica_u_id       ON valoracion_fisica(vf_u_id);
CREATE INDEX IF NOT EXISTS idx_valoracion_fisica_fecha      ON valoracion_fisica(vf_fecha_registro);

-- ============================================================
-- ALTER TABLES - Add missing columns if table already existed
-- ============================================================

DO $$
BEGIN
    -- Add vf_medida_pecho if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'valoracion_fisica' AND column_name = 'vf_medida_pecho') THEN
        ALTER TABLE valoracion_fisica ADD COLUMN vf_medida_pecho NUMERIC(5,2);
    END IF;
    
    -- Add vf_medida_cadera if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'valoracion_fisica' AND column_name = 'vf_medida_cadera') THEN
        ALTER TABLE valoracion_fisica ADD COLUMN vf_medida_cadera NUMERIC(5,2);
    END IF;
    
    -- Add vf_observaciones if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'valoracion_fisica' AND column_name = 'vf_observaciones') THEN
        ALTER TABLE valoracion_fisica ADD COLUMN vf_observaciones TEXT;
    END IF;
    
    -- Add vf_fecha_creacion if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'valoracion_fisica' AND column_name = 'vf_fecha_creacion') THEN
        ALTER TABLE valoracion_fisica ADD COLUMN vf_fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;
END $$;