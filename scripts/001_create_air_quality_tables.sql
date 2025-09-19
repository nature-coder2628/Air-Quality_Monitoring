-- Create air quality monitoring tables for Bengaluru areas

-- Areas table for different locations in Bengaluru
CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  district TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Air quality readings table
CREATE TABLE IF NOT EXISTS public.air_quality_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Air Quality Index and components
  aqi INTEGER,
  pm25 DECIMAL(8, 2), -- PM2.5 in µg/m³
  pm10 DECIMAL(8, 2), -- PM10 in µg/m³
  no2 DECIMAL(8, 2),  -- NO2 in µg/m³
  so2 DECIMAL(8, 2),  -- SO2 in µg/m³
  co DECIMAL(8, 2),   -- CO in mg/m³
  o3 DECIMAL(8, 2),   -- O3 in µg/m³
  
  -- Weather data
  temperature DECIMAL(5, 2), -- in Celsius
  humidity INTEGER,          -- percentage
  pressure DECIMAL(7, 2),    -- in hPa
  wind_speed DECIMAL(5, 2),  -- in m/s
  wind_direction INTEGER,    -- in degrees
  visibility DECIMAL(5, 2),  -- in km
  
  -- Data source
  source TEXT DEFAULT 'openweather',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML predictions table
CREATE TABLE IF NOT EXISTS public.air_quality_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  prediction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_for TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Predicted values
  predicted_aqi INTEGER,
  predicted_pm25 DECIMAL(8, 2),
  predicted_pm10 DECIMAL(8, 2),
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  
  -- Model info
  model_version TEXT,
  features_used JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS public.air_quality_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'high_aqi', 'very_high_pm25', etc.
  severity TEXT NOT NULL,   -- 'moderate', 'unhealthy', 'hazardous'
  message TEXT NOT NULL,
  threshold_value DECIMAL(8, 2),
  actual_value DECIMAL(8, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_air_quality_readings_area_timestamp 
ON public.air_quality_readings(area_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_air_quality_readings_timestamp 
ON public.air_quality_readings(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_predictions_area_predicted_for 
ON public.air_quality_predictions(area_id, predicted_for DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_area_active 
ON public.air_quality_alerts(area_id, is_active, created_at DESC);

-- Enable Row Level Security (RLS) - for future user-specific features
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.air_quality_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.air_quality_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.air_quality_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is environmental data)
CREATE POLICY "Allow public read access to areas" 
ON public.areas FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to air quality readings" 
ON public.air_quality_readings FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to predictions" 
ON public.air_quality_predictions FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to alerts" 
ON public.air_quality_alerts FOR SELECT 
USING (true);
