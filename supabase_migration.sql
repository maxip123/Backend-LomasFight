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

-- 4. Agregar columnas de contacto, salud y entrenamiento a clientes
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS numero_celular         VARCHAR(30),
  ADD COLUMN IF NOT EXISTS numero_celular_emergencia VARCHAR(30),
  ADD COLUMN IF NOT EXISTS alergia_medicamento    TEXT,
  ADD COLUMN IF NOT EXISTS tiempo_entrenamiento   VARCHAR(100);

-- 5. Beneficios personalizables por disciplina ("Por qué elegir ...")
--    Lista JSON de { "titulo": "...", "descripcion": "..." }. NULL = usar los beneficios genéricos.
ALTER TABLE disciplinas ADD COLUMN IF NOT EXISTS beneficios JSONB;

-- 6. Duración de cada clase en horas (1, 2, 3...). Las clases existentes quedan en 1 hora.
ALTER TABLE horarios ADD COLUMN IF NOT EXISTS duracion_horas SMALLINT NOT NULL DEFAULT 1;

-- 7. Prefijo del profesor que se muestra antes del nombre en los horarios (Sensei, Profe, Instructor...).
--    Los profesores existentes quedan con 'Sensei'. Vacío = se muestra solo el nombre.
ALTER TABLE profesores ADD COLUMN IF NOT EXISTS prefijo VARCHAR(30) NOT NULL DEFAULT 'Sensei';
