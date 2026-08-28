-- ============================================================
-- MÓDULO DE EVENTOS Y NOTIFICACIONES - BodyHealth
-- Tablas: evento, notificacion
-- ============================================================

-- 1. EVENTO
CREATE TABLE IF NOT EXISTS evento (
    ev_id             SERIAL PRIMARY KEY,
    ev_nombre         VARCHAR(150) NOT NULL,
    ev_descripcion    TEXT,
    ev_fecha_hora     TIMESTAMP NOT NULL,
    ev_u_id           UUID NOT NULL REFERENCES usuario(u_id) ON DELETE RESTRICT,
    ev_fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. NOTIFICACION
CREATE TABLE IF NOT EXISTS notificacion (
    n_id              SERIAL PRIMARY KEY,
    n_u_id            UUID NOT NULL REFERENCES usuario(u_id) ON DELETE RESTRICT,
    n_tipo_evento     VARCHAR(50) NOT NULL, -- 'EVENTO_CREADO', 'MEMBRESIA_POR_VENCER', 'MEMBRESIA_VENCIDA', 'INFO'
    n_titulo          VARCHAR(200) NOT NULL,
    n_mensaje         TEXT NOT NULL,
    n_leida           BOOLEAN NOT NULL DEFAULT FALSE,
    n_fecha_envio     TIMESTAMP NOT NULL DEFAULT NOW(),
    n_evento_id       INTEGER REFERENCES evento(ev_id) ON DELETE SET NULL,
    n_membresia_id    INTEGER REFERENCES membresia(m_id) ON DELETE SET NULL
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_evento_u_id       ON evento(ev_u_id);
CREATE INDEX IF NOT EXISTS idx_evento_fecha      ON evento(ev_fecha_hora);
CREATE INDEX IF NOT EXISTS idx_notificacion_u_id ON notificacion(n_u_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_leida ON notificacion(n_leida);
CREATE INDEX IF NOT EXISTS idx_notificacion_tipo  ON notificacion(n_tipo_evento);
CREATE INDEX IF NOT EXISTS idx_notificacion_evento ON notificacion(n_evento_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_membresia ON notificacion(n_membresia_id);

-- Trigger para actualizar notificaciones de membresía (opcional, se puede manejar desde la app)
-- Al crear un evento, crear notificación automática para el admin que lo creó
-- Esto se maneja en la lógica de la aplicación (backend) al crear el evento

-- ============================================================
-- ALTER TABLES - Add missing columns if tables already existed
-- ============================================================

-- Add columns to evento if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evento' AND column_name = 'ev_fecha_creacion') THEN
        ALTER TABLE evento ADD COLUMN ev_fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- Add columns to notificacion if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notificacion' AND column_name = 'n_evento_id') THEN
        ALTER TABLE notificacion ADD COLUMN n_evento_id INTEGER REFERENCES evento(ev_id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notificacion' AND column_name = 'n_membresia_id') THEN
        ALTER TABLE notificacion ADD COLUMN n_membresia_id INTEGER REFERENCES membresia(m_id) ON DELETE SET NULL;
    END IF;
END $$;