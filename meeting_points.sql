-- Create meeting_points table for storing pickup/meeting locations
CREATE TABLE IF NOT EXISTS meeting_points (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  instructions TEXT,
  map_url TEXT,
  zone VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on zone for faster queries
CREATE INDEX IF NOT EXISTS idx_meeting_points_zone ON meeting_points(zone);

-- Create an index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_meeting_points_active ON meeting_points(is_active);

-- Add some example data (optional)
INSERT INTO meeting_points (title, instructions, map_url, zone) VALUES
  ('West Bay Beach', 'Meet at the main beach entrance, near the Blue Flag. Look for our SET Tours sign.', 'https://maps.google.com/?q=16.3268,-86.6108', 'West Bay'),
  ('Coxen Hole Port', 'Meet at the cruise ship terminal main gate. Our representatives will be holding SET Tours signs.', 'https://maps.google.com/?q=16.3229,-86.5447', 'Coxen Hole'),
  ('West End Village', 'Meet at the central park, next to the Catholic church.', 'https://maps.google.com/?q=16.2967,-86.5978', 'West End')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_meeting_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_meeting_points_updated_at
  BEFORE UPDATE ON meeting_points
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_points_updated_at();

-- Add RLS policies (adjust according to your auth setup)
ALTER TABLE meeting_points ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON meeting_points
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to insert/update/delete (adjust as needed)
CREATE POLICY "Enable all access for authenticated users" ON meeting_points
  FOR ALL USING (true);
