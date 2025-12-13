-- SQL para agregar nuevos campos a la tabla private_tours en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Agregar columna para días disponibles (array de texto)
ALTER TABLE private_tours 
ADD COLUMN available_days TEXT[] DEFAULT ARRAY['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

-- 2. Agregar columnas para "¿Qué se hará?" (4 actividades)
ALTER TABLE private_tours 
ADD COLUMN activity_1 TEXT,
ADD COLUMN activity_2 TEXT,
ADD COLUMN activity_3 TEXT,
ADD COLUMN activity_4 TEXT;

-- 3. Agregar columna para resumen (máximo 100 caracteres)
ALTER TABLE private_tours 
ADD COLUMN summary VARCHAR(100);

-- Comentarios sobre los campos:
COMMENT ON COLUMN private_tours.available_days IS 'Días de la semana en que el tour está disponible';
COMMENT ON COLUMN private_tours.activity_1 IS 'Primera actividad del tour';
COMMENT ON COLUMN private_tours.activity_2 IS 'Segunda actividad del tour';
COMMENT ON COLUMN private_tours.activity_3 IS 'Tercera actividad del tour';
COMMENT ON COLUMN private_tours.activity_4 IS 'Cuarta actividad del tour';
COMMENT ON COLUMN private_tours.summary IS 'Resumen breve del tour (máximo 100 caracteres)';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'private_tours' 
AND column_name IN ('available_days', 'activity_1', 'activity_2', 'activity_3', 'activity_4', 'summary');
