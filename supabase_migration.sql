-- ============================================================
-- Script de migración para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna fecha_vencimiento a clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;

-- 2. Crear tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id_gasto SERIAL PRIMARY KEY,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_gasto TIMESTAMPTZ DEFAULT NOW(),
    activo BOOLEAN DEFAULT true
);

-- 3. (Opcional) Inicializar fecha_vencimiento para clientes que ya tienen fecha_ultimo_pago
-- Esto pone la fecha de vencimiento como fecha_ultimo_pago + 31 días para los que ya pagaron
UPDATE clientes
SET fecha_vencimiento = fecha_ultimo_pago + INTERVAL '31 days'
WHERE fecha_ultimo_pago IS NOT NULL
  AND fecha_vencimiento IS NULL
  AND activo = true;
