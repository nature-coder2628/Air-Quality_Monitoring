-- Seed Bengaluru areas with major locations

INSERT INTO public.areas (name, latitude, longitude, district) VALUES
-- Central Bengaluru
('MG Road', 12.9716, 77.5946, 'Central'),
('Brigade Road', 12.9698, 77.6088, 'Central'),
('Commercial Street', 12.9833, 77.6167, 'Central'),
('Cubbon Park', 12.9762, 77.5993, 'Central'),

-- North Bengaluru
('Hebbal', 13.0358, 77.5970, 'North'),
('Yelahanka', 13.1007, 77.5963, 'North'),
('Devanahalli', 13.2500, 77.7167, 'North'),
('Bagalur', 13.0833, 77.6333, 'North'),

-- South Bengaluru
('Koramangala', 12.9279, 77.6271, 'South'),
('BTM Layout', 12.9165, 77.6101, 'South'),
('Jayanagar', 12.9279, 77.5937, 'South'),
('Banashankari', 12.9081, 77.5712, 'South'),
('JP Nagar', 12.9082, 77.5855, 'South'),

-- East Bengaluru
('Whitefield', 12.9698, 77.7500, 'East'),
('Marathahalli', 12.9591, 77.6974, 'East'),
('Indiranagar', 12.9719, 77.6412, 'East'),
('Domlur', 12.9611, 77.6387, 'East'),

-- West Bengaluru
('Rajajinagar', 12.9991, 77.5554, 'West'),
('Malleshwaram', 13.0033, 77.5737, 'West'),
('Vijayanagar', 12.9716, 77.5370, 'West'),
('Peenya', 13.0283, 77.5208, 'West'),

-- Outer areas
('Electronic City', 12.8456, 77.6603, 'South'),
('Sarjapur', 12.8833, 77.6833, 'East'),
('Kengeri', 12.9081, 77.4854, 'West'),
('Tumkur Road', 13.0500, 77.5167, 'North')

ON CONFLICT (name) DO NOTHING;
