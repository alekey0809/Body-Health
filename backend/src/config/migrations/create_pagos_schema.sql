-- ============================================================
-- MÓDULO DE PAGOS - BodyHealth
-- Tablas: factura, detalle_factura, membresia
-- ============================================================

-- 1. FACTURA
CREATE TABLE IF NOT EXISTS factura (
    f_id              SERIAL PRIMARY KEY,
    f_u_id            UUID NOT NULL REFERENCES usuario(u_id) ON DELETE RESTRICT,
    f_em_id           INTEGER NOT NULL DEFAULT 1 REFERENCES empresa(em_id) ON DELETE RESTRICT,
    f_concepto_pago   VARCHAR(50) NOT NULL DEFAULT 'Inscripción Plan',
    f_valor_total     NUMERIC(12, 2) NOT NULL,
    f_impuestos       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    f_medio_pago      VARCHAR(20) NOT NULL DEFAULT 'Efectivo',
    f_fecha_hora      TIMESTAMP NOT NULL DEFAULT NOW(),
    f_ep_id           INTEGER NOT NULL DEFAULT 1 REFERENCES estado_pago(ep_id) ON DELETE RESTRICT
);

-- 2. DETALLE_FACTURA
CREATE TABLE IF NOT EXISTS detalle_factura (
    df_id             SERIAL PRIMARY KEY,
    f_id              INTEGER NOT NULL REFERENCES factura(f_id) ON DELETE CASCADE,
    pe_id             INTEGER NOT NULL REFERENCES plan_entrenamiento(pe_id) ON DELETE RESTRICT,
    df_cantidad       INTEGER NOT NULL DEFAULT 1,
    df_precio_unitario NUMERIC(12, 2) NOT NULL,
    df_subtotal       NUMERIC(12, 2) NOT NULL
);

-- 3. MEMBRESIA
CREATE TABLE IF NOT EXISTS membresia (
    m_id                SERIAL PRIMARY KEY,
    m_u_id              UUID NOT NULL REFERENCES usuario(u_id) ON DELETE RESTRICT,
    m_pe_id             INTEGER NOT NULL REFERENCES plan_entrenamiento(pe_id) ON DELETE RESTRICT,
    f_id                INTEGER NOT NULL REFERENCES factura(f_id) ON DELETE CASCADE,
    m_fecha_inicio      DATE NOT NULL DEFAULT CURRENT_DATE,
    m_fecha_vencimiento DATE NOT NULL,
    m_eg_id             INTEGER NOT NULL DEFAULT 1 REFERENCES estado_general(eg_id) ON DELETE RESTRICT
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_factura_u_id     ON factura(f_u_id);
CREATE INDEX IF NOT EXISTS idx_detalle_f_id     ON detalle_factura(f_id);
CREATE INDEX IF NOT EXISTS idx_membresia_u_id   ON membresia(m_u_id);
CREATE INDEX IF NOT EXISTS idx_membresia_f_id   ON membresia(f_id);

-- ============================================================
-- ALTER TABLES - Add missing columns if tables already existed
-- ============================================================

-- Add m_eg_id to membresia if missing (for membership status)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'membresia' AND column_name = 'm_eg_id'
    ) THEN
        ALTER TABLE membresia 
        ADD COLUMN m_eg_id INTEGER NOT NULL DEFAULT 1 REFERENCES estado_general(eg_id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Add f_em_id, f_concepto_pago, f_impuestos, f_medio_pago, f_ep_id to factura if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factura' AND column_name = 'f_em_id') THEN
        ALTER TABLE factura ADD COLUMN f_em_id INTEGER NOT NULL DEFAULT 1 REFERENCES empresa(em_id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factura' AND column_name = 'f_concepto_pago') THEN
        ALTER TABLE factura ADD COLUMN f_concepto_pago VARCHAR(50) NOT NULL DEFAULT 'Inscripción Plan';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factura' AND column_name = 'f_impuestos') THEN
        ALTER TABLE factura ADD COLUMN f_impuestos NUMERIC(12, 2) NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factura' AND column_name = 'f_medio_pago') THEN
        ALTER TABLE factura ADD COLUMN f_medio_pago VARCHAR(20) NOT NULL DEFAULT 'Efectivo';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'factura' AND column_name = 'f_ep_id') THEN
        ALTER TABLE factura ADD COLUMN f_ep_id INTEGER NOT NULL DEFAULT 1 REFERENCES estado_pago(ep_id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Add df_cantidad to detalle_factura if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'detalle_factura' AND column_name = 'df_cantidad') THEN
        ALTER TABLE detalle_factura ADD COLUMN df_cantidad INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;
