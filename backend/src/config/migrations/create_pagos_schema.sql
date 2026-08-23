-- ============================================================
-- MÓDULO DE PAGOS - BodyHealth
-- Tablas: factura, detalle_factura, membresia
-- ============================================================

-- 1. FACTURA
CREATE TABLE IF NOT EXISTS factura (
    f_id          SERIAL PRIMARY KEY,
    f_u_id        UUID NOT NULL REFERENCES usuario(u_id) ON DELETE RESTRICT,
    f_valor_total NUMERIC(12, 2) NOT NULL,
    f_fecha_hora  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. DETALLE_FACTURA
CREATE TABLE IF NOT EXISTS detalle_factura (
    df_id             SERIAL PRIMARY KEY,
    f_id              INTEGER NOT NULL REFERENCES factura(f_id) ON DELETE CASCADE,
    pe_id             INTEGER NOT NULL REFERENCES plan_entrenamiento(pe_id) ON DELETE RESTRICT,
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
    m_fecha_vencimiento DATE NOT NULL
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_factura_u_id     ON factura(f_u_id);
CREATE INDEX IF NOT EXISTS idx_detalle_f_id     ON detalle_factura(f_id);
CREATE INDEX IF NOT EXISTS idx_membresia_u_id   ON membresia(m_u_id);
CREATE INDEX IF NOT EXISTS idx_membresia_f_id   ON membresia(f_id);
