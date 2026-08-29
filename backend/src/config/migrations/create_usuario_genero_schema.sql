-- ============================================================
-- AGREGAR GÉNERO A USUARIO - BodyHealth
-- ============================================================

-- Add u_genero to usuario if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuario' AND column_name = 'u_genero') THEN
        ALTER TABLE usuario ADD COLUMN u_genero VARCHAR(1) CHECK (u_genero IN ('M', 'F'));
    END IF;
END $$;

-- Create index for gender queries
CREATE INDEX IF NOT EXISTS idx_usuario_genero ON usuario(u_genero);