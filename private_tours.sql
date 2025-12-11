-- Tabla para tours privados
CREATE TABLE IF NOT EXISTS private_tours (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image1 VARCHAR(500),
  image2 VARCHAR(500),
  image3 VARCHAR(500),
  
  -- Tarifas base
  price_1_person DECIMAL(10,2),
  price_2_persons DECIMAL(10,2),
  price_3_persons DECIMAL(10,2),
  price_4_persons DECIMAL(10,2),
  price_children_under_5 DECIMAL(10,2),
  
  -- Información del tour
  whats_included TEXT,
  duration VARCHAR(255),
  tour_notes TEXT,
  
  -- Control de adicionales
  show_additional_options BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para adicionales del tour
CREATE TABLE IF NOT EXISTS tour_additional_options (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  features TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar adicionales predeterminados (en inglés)
INSERT INTO tour_additional_options (title, subtitle, features, sort_order) VALUES
(
  'Victor''s Monkey & Sloth Sanctuary: A Unique Animal Attraction',
  'Self-Paced:  Add $10 per Guest  [Free with Zipline and/or ATV]',
  'See sloths, monkeys, parrots, scarlet macaws, native wildlife, etc.',
  1
),
(
  'Mayan Jungle Zipline',
  '45 Minutes to 1 Hour:  Add $45 per Participant  [Includes Free Monkeys/Sloths]',
  'Zip across Roatan''s variety of terrain - from jungle trees and hilltops to grassland and sugarcane plantations. Two suspension bridges and 11 zip lines (up to 1,035 ft long / 300 ft high). Includes FREE access to Victor''s Monkey & Sloth Sanctuary. WEIGHT LIMIT: 286 lbs.',
  2
),
(
  'Mayan Jungle ATV Adventure',
  '1 Hour:  Add $65 per Participant/$35 per Ride-Along Participant Ages 5-11  [Includes Free Monkeys/Sloths]',
  'Guided 4x4 adventure through the jungle trails. Free access to Victor''s Monkey & Sloth Sanctuary.',
  3
),
(
  'Dolphin Encounter Roatan',
  'Allow 1 Hour:  Add $85 per Participant',
  'Safety Talk, then 30 Minute Interaction with a Dolphin and its trainer: touch, kiss, learn about dolphins & watch their various natural behaviors: jumping, tail-walking, etc. Professional photographer available (extra cost) or personal photos allowed during the final 10 minutes of the Dolphin Encounter. No observer area for non-participants.',
  4
),
(
  'Dolphin Swim & Snorkel',
  'Allow 2 Hours:  Add $120 per Participant  (+$9 per Snorkel Equipment Rental, if Needed)',
  'Safety Talk, then 30 Minute Dolphin Encounter (see above), plus 30 Minutes of Unstructured Snorkeling with up to 10 or 12 Dolphins. Watch them play, communicate... and become part of their pod! Professional photographer available (extra cost) or personal photos allowed during the final 10 minutes of the Dolphin Encounter. NO personal photos or video permitted during the snorkel with the dolphins activity. Use your own snorkel gear or rent on site. No observer area for non-participants.',
  5
),
(
  'Sherman Arch Iguana Reserve',
  'Self-Paced:  Add $15 per Guest',
  'Free-roaming iguanas, natural aquarium, and native wildlife.',
  6
),
(
  'Offshore Boat Snorkel',
  '1 Hour:  Add $25 per Boat Passenger  [Includes Snorkel Equipment onboard Boat, if Needed]',
  'Snorkel excursion to the Blue Channel via boat. While some guests snorkel offshore, others can explore West End Village, shop for souvenirs, enjoy a snack or cool drink, or enjoy nearby tour attractions.',
  7
),
(
  'Halfmoon Bay Glass Bottom Boat',
  '45 Minutes:  Add $45 per Guest',
  'Tour the Coral Reef without getting wet in the semi-submarine. While some guests enjoy the glass bottom boat, others can explore West End Village, shop for souvenirs, enjoy a snack or cool drink, or enjoy nearby tour attractions.',
  8
),
(
  'Horseback Riding',
  '1 to 1.5 Hours:  Book your Ride in advance at www.barriodorcasranch.com  |  Add $55 per Person.',
  'While some guests ride horses, others can do another activity or continue sightseeing around the island.',
  9
),
(
  'Ixora Spa at Anthonys Key',
  'Time & Pricing Vary:  Book all treatments in advance at www.ixoraspa.com',
  '',
  10
),
(
  'Baan Suerte Spa',
  'Time & Pricing Vary:  Book all treatments in advance at www.baansuertespa.com',
  '',
  11
),
(
  'Roatan Fishing Experience',
  '2 Hour Minimum:  Add $90 to 120 per Hour (depending on Fishing Boat availability).',
  'Includes all tackle, bait & equipment. Fishing Boat (6 People Max). While some guests fish, others can enjoy another activity or continue sightseeing around the island.',
  12
),
(
  'Half Moon Bay/West End Village',
  'Self-Paced:  No Extra Cost',
  'Free beach access, snorkeling, restaurants/bars, gift shops, dive shops, etc. If you''re looking for a resort beach with white sand and turquoise Caribbean waters... this isn''t the place. Select West Bay Beach below.',
  13
),
(
  'West Bay Beach',
  'Self-Paced:  Fees Vary',
  'Free beach access, restaurants/bars, snorkeling, water sports, etc. Optional Fees: Beach Resort Day Passes (includes beach loungers, restroom access & fresh water shower), beach chair rental, water sports equipment rental, etc.',
  14
),
(
  'Roatan Parasail Adventure',
  '30 Minutes:  Add $85 per Participant/$15 per Observer',
  '1.5 to 2 miles offshore, 800 feet high for 12 minutes. While some participants parasail, others can relax or explore West Bay Beach. Note: this activity is dependent upon surf, wind, and weather.',
  15
),
(
  'Stone Castle Cameo Factory',
  'Self-Paced:  No Extra Cost',
  'Jewelry and show room featuring carved shell cameos. On-site local carvers.',
  16
),
(
  'Shopping',
  'Self-Paced:  No Extra Cost',
  'Honduras is known for its coffee, mahogany, vanilla, and cigars. The Roatan Chocolate Factory and Roatan Rum Company are popular for tasting & shopping. Please tell your guide what you''re looking for! If you''re interested in handmade crafts, let us know... or, if you''re simply seeking nice souvenirs, we can point you in the right direction!',
  17
),
(
  'Lunch/Snacks/Beverages',
  'Self-Paced. Pricing Varies.',
  'From lobster to local fare, let your guide know! Food and beverages are not provided, but we''re happy to take you to a restaurant or bar to enjoy local food, home cooking... or a beachy tropical drink or two! Just indicate to your guide your price range and type of food you desire. [For passengers with special dietary restrictions, it is advisable to bring snacks or lunch from the ship to ensure proper food preparation].',
  18
);

-- Tabla para reservas de tours privados
CREATE TABLE IF NOT EXISTS private_tour_bookings (
  id SERIAL PRIMARY KEY,
  tour_id INTEGER REFERENCES private_tours(id) ON DELETE CASCADE,
  
  -- Información del cliente
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  hometown_city VARCHAR(255),
  hometown_state VARCHAR(255),
  hometown_country VARCHAR(255) DEFAULT 'United States',
  
  -- Detalles de la reserva
  number_of_guests_age_5_up INTEGER NOT NULL,
  number_of_guests_under_5 INTEGER DEFAULT 0,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cruise_ship_or_resort_name VARCHAR(255) NOT NULL,
  requested_tour_date DATE,
  
  -- Adicionales seleccionados (JSON array de IDs)
  selected_additional_options JSONB DEFAULT '[]',
  
  -- Comentarios
  comments TEXT,
  
  -- Status de la reserva
  status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_private_tours_created_at ON private_tours(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_tour_id ON private_tour_bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_status ON private_tour_bookings(status);
CREATE INDEX IF NOT EXISTS idx_tour_bookings_date ON private_tour_bookings(requested_tour_date);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_private_tours_updated_at BEFORE UPDATE ON private_tours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_bookings_updated_at BEFORE UPDATE ON private_tour_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
