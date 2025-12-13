-- SQL to update private_tours table to use English day names
-- Execute this script in Supabase SQL Editor

-- 1. Update the default value for available_days to English
ALTER TABLE private_tours 
ALTER COLUMN available_days SET DEFAULT ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

-- 2. Update existing rows that have Spanish day names to English
UPDATE private_tours
SET available_days = ARRAY(
  SELECT CASE 
    WHEN unnest = 'LUNES' THEN 'MONDAY'
    WHEN unnest = 'MARTES' THEN 'TUESDAY'
    WHEN unnest = 'MIERCOLES' THEN 'WEDNESDAY'
    WHEN unnest = 'JUEVES' THEN 'THURSDAY'
    WHEN unnest = 'VIERNES' THEN 'FRIDAY'
    WHEN unnest = 'SABADO' THEN 'SATURDAY'
    WHEN unnest = 'DOMINGO' THEN 'SUNDAY'
    ELSE unnest
  END
  FROM unnest(available_days)
)
WHERE available_days && ARRAY['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

-- 3. Verify the update
SELECT id, title, available_days 
FROM private_tours 
WHERE available_days IS NOT NULL;
