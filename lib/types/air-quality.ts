// Type definitions for air quality monitoring system

export interface Area {
  id: string
  name: string
  latitude: number
  longitude: number
  district: string
  created_at: string
}

export interface AirQualityReading {
  id: string
  area_id: string
  timestamp: string
  aqi: number | null
  pm25: number | null
  pm10: number | null
  no2: number | null
  so2: number | null
  co: number | null
  o3: number | null
  temperature: number | null
  humidity: number | null
  pressure: number | null
  wind_speed: number | null
  wind_direction: number | null
  visibility: number | null
  source: string
  created_at: string
  area?: Area // For joined queries
}

export interface AirQualityPrediction {
  id: string
  area_id: string
  prediction_timestamp: string
  predicted_for: string
  predicted_aqi: number | null
  predicted_pm25: number | null
  predicted_pm10: number | null
  confidence_score: number | null
  model_version: string | null
  features_used: Record<string, any> | null
  created_at: string
  area?: Area
}

export interface AirQualityAlert {
  id: string
  area_id: string
  alert_type: string
  severity: "moderate" | "unhealthy" | "hazardous"
  message: string
  threshold_value: number | null
  actual_value: number | null
  is_active: boolean
  created_at: string
  resolved_at: string | null
  area?: Area
}

export interface OpenWeatherAirPollution {
  coord: {
    lon: number
    lat: number
  }
  list: Array<{
    main: {
      aqi: number
    }
    components: {
      co: number
      no: number
      no2: number
      o3: number
      so2: number
      pm2_5: number
      pm10: number
      nh3: number
    }
    dt: number
  }>
}

export interface OpenWeatherCurrent {
  coord: {
    lon: number
    lat: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    sea_level?: number
    grnd_level?: number
  }
  visibility: number
  wind: {
    speed: number
    deg: number
    gust?: number
  }
  dt: number
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
}

export enum AlertType {
  HEALTH_WARNING = "health_warning",
  POLLUTANT_SPIKE = "pollutant_spike",
  WEATHER_IMPACT = "weather_impact",
  PREDICTION_ALERT = "prediction_alert",
}

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface Alert {
  id: string
  areaId: string
  areaName: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  thresholdValue?: number
  currentValue?: number
  timestamp: Date
  isActive: boolean
}

// AQI Categories
export const AQI_CATEGORIES = {
  GOOD: { min: 0, max: 50, label: "Good", color: "green" },
  MODERATE: { min: 51, max: 100, label: "Moderate", color: "yellow" },
  UNHEALTHY_SENSITIVE: { min: 101, max: 150, label: "Unhealthy for Sensitive Groups", color: "orange" },
  UNHEALTHY: { min: 151, max: 200, label: "Unhealthy", color: "red" },
  VERY_UNHEALTHY: { min: 201, max: 300, label: "Very Unhealthy", color: "purple" },
  HAZARDOUS: { min: 301, max: 500, label: "Hazardous", color: "maroon" },
} as const

export function getAQICategory(aqi: number) {
  for (const [key, category] of Object.entries(AQI_CATEGORIES)) {
    if (aqi >= category.min && aqi <= category.max) {
      return { key, ...category }
    }
  }
  return { key: "UNKNOWN", min: 0, max: 0, label: "Unknown", color: "gray" }
}
