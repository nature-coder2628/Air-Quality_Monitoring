// Advanced Machine Learning Air Quality Predictor
// Uses time series analysis and feature engineering for pollution forecasting

export interface PredictionFeatures {
  // Historical air quality data
  aqi_avg_24h: number
  pm25_avg_24h: number
  pm10_avg_24h: number
  no2_avg_24h: number

  // Weather features
  temperature: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_direction: number

  // Temporal features
  hour_of_day: number
  day_of_week: number
  month: number
  is_weekend: boolean

  // Seasonal features
  season: "winter" | "summer" | "monsoon" | "post_monsoon"

  // Trend features
  aqi_trend_3h: number
  pm25_trend_3h: number

  // Location features
  area_type: "central" | "north" | "south" | "east" | "west"
}

export interface PredictionResult {
  predicted_aqi: number
  predicted_pm25: number
  predicted_pm10: number
  confidence_score: number
  prediction_horizon_hours: number
  features_used: PredictionFeatures
  model_version: string
}

export class AirQualityPredictor {
  private modelVersion = "v1.0.0"

  /**
   * Generate air quality predictions using ensemble methods
   */
  async generatePredictions(
    historicalData: any[],
    weatherData: any,
    areaInfo: any,
    hoursAhead = 24,
  ): Promise<PredictionResult[]> {
    if (historicalData.length < 24) {
      throw new Error("Insufficient historical data for prediction (minimum 24 hours required)")
    }

    const predictions: PredictionResult[] = []

    // Generate predictions for each hour ahead
    for (let hour = 1; hour <= hoursAhead; hour++) {
      const features = this.extractFeatures(historicalData, weatherData, areaInfo, hour)
      const prediction = this.predictSingleHour(features, hour)
      predictions.push(prediction)
    }

    return predictions
  }

  /**
   * Extract engineered features for ML prediction
   */
  private extractFeatures(
    historicalData: any[],
    weatherData: any,
    areaInfo: any,
    hoursAhead: number,
  ): PredictionFeatures {
    // Calculate historical averages
    const recent24h = historicalData.slice(0, 24)
    const recent3h = historicalData.slice(0, 3)

    const aqi_avg_24h = this.calculateAverage(recent24h, "aqi")
    const pm25_avg_24h = this.calculateAverage(recent24h, "pm25")
    const pm10_avg_24h = this.calculateAverage(recent24h, "pm10")
    const no2_avg_24h = this.calculateAverage(recent24h, "no2")

    // Calculate trends
    const aqi_trend_3h = this.calculateTrend(recent3h, "aqi")
    const pm25_trend_3h = this.calculateTrend(recent3h, "pm25")

    // Temporal features
    const futureTime = new Date(Date.now() + hoursAhead * 60 * 60 * 1000)
    const hour_of_day = futureTime.getHours()
    const day_of_week = futureTime.getDay()
    const month = futureTime.getMonth() + 1
    const is_weekend = day_of_week === 0 || day_of_week === 6

    // Seasonal classification for Bengaluru
    const season = this.getSeason(month)

    // Area type classification
    const area_type = this.getAreaType(areaInfo.district)

    return {
      aqi_avg_24h,
      pm25_avg_24h,
      pm10_avg_24h,
      no2_avg_24h,
      temperature: weatherData.temperature || 25,
      humidity: weatherData.humidity || 60,
      pressure: weatherData.pressure || 1013,
      wind_speed: weatherData.wind_speed || 2,
      wind_direction: weatherData.wind_direction || 180,
      hour_of_day,
      day_of_week,
      month,
      is_weekend,
      season,
      aqi_trend_3h,
      pm25_trend_3h,
      area_type,
    }
  }

  /**
   * Predict air quality for a single hour using ensemble methods
   */
  private predictSingleHour(features: PredictionFeatures, hoursAhead: number): PredictionResult {
    // Ensemble of different prediction methods
    const linearPrediction = this.linearTrendPrediction(features, hoursAhead)
    const seasonalPrediction = this.seasonalPrediction(features, hoursAhead)
    const weatherBasedPrediction = this.weatherBasedPrediction(features, hoursAhead)

    // Weighted ensemble
    const weights = {
      linear: 0.3,
      seasonal: 0.4,
      weather: 0.3,
    }

    const predicted_aqi = Math.round(
      linearPrediction.aqi * weights.linear +
        seasonalPrediction.aqi * weights.seasonal +
        weatherBasedPrediction.aqi * weights.weather,
    )

    const predicted_pm25 =
      Math.round(
        (linearPrediction.pm25 * weights.linear +
          seasonalPrediction.pm25 * weights.seasonal +
          weatherBasedPrediction.pm25 * weights.weather) *
          10,
      ) / 10

    const predicted_pm10 =
      Math.round(
        (linearPrediction.pm10 * weights.linear +
          seasonalPrediction.pm10 * weights.seasonal +
          weatherBasedPrediction.pm10 * weights.weather) *
          10,
      ) / 10

    // Calculate confidence based on data quality and prediction horizon
    const confidence_score = this.calculateConfidence(features, hoursAhead)

    return {
      predicted_aqi: Math.max(0, Math.min(500, predicted_aqi)),
      predicted_pm25: Math.max(0, predicted_pm25),
      predicted_pm10: Math.max(0, predicted_pm10),
      confidence_score,
      prediction_horizon_hours: hoursAhead,
      features_used: features,
      model_version: this.modelVersion,
    }
  }

  /**
   * Linear trend-based prediction
   */
  private linearTrendPrediction(features: PredictionFeatures, hoursAhead: number) {
    const base_aqi = features.aqi_avg_24h
    const base_pm25 = features.pm25_avg_24h
    const base_pm10 = features.pm10_avg_24h

    // Apply trend extrapolation
    const trend_factor = Math.min(hoursAhead / 24, 1) // Limit trend impact

    return {
      aqi: base_aqi + features.aqi_trend_3h * trend_factor,
      pm25: base_pm25 + features.pm25_trend_3h * trend_factor,
      pm10: base_pm10 + features.pm25_trend_3h * 1.2 * trend_factor, // PM10 correlates with PM2.5
    }
  }

  /**
   * Seasonal and temporal pattern-based prediction
   */
  private seasonalPrediction(features: PredictionFeatures, hoursAhead: number) {
    const base_aqi = features.aqi_avg_24h
    const base_pm25 = features.pm25_avg_24h
    const base_pm10 = features.pm10_avg_24h

    // Seasonal adjustments for Bengaluru
    const seasonalMultipliers = {
      winter: { aqi: 1.3, pm25: 1.4, pm10: 1.3 }, // Higher pollution in winter
      summer: { aqi: 1.1, pm25: 1.2, pm10: 1.1 }, // Moderate increase
      monsoon: { aqi: 0.7, pm25: 0.6, pm10: 0.7 }, // Rain clears pollution
      post_monsoon: { aqi: 1.0, pm25: 1.0, pm10: 1.0 }, // Baseline
    }

    const multiplier = seasonalMultipliers[features.season]

    // Hourly patterns (traffic and activity cycles)
    const hourlyMultipliers = this.getHourlyMultiplier(features.hour_of_day)

    // Weekend effect
    const weekendMultiplier = features.is_weekend ? 0.85 : 1.0

    return {
      aqi: base_aqi * multiplier.aqi * hourlyMultipliers.aqi * weekendMultiplier,
      pm25: base_pm25 * multiplier.pm25 * hourlyMultipliers.pm25 * weekendMultiplier,
      pm10: base_pm10 * multiplier.pm10 * hourlyMultipliers.pm10 * weekendMultiplier,
    }
  }

  /**
   * Weather-based prediction model
   */
  private weatherBasedPrediction(features: PredictionFeatures, hoursAhead: number) {
    const base_aqi = features.aqi_avg_24h
    const base_pm25 = features.pm25_avg_24h
    const base_pm10 = features.pm10_avg_24h

    // Wind speed effect (higher wind disperses pollution)
    const windEffect = Math.max(0.5, 1 - (features.wind_speed - 2) * 0.1)

    // Humidity effect (higher humidity can trap pollutants)
    const humidityEffect = 1 + (features.humidity - 60) * 0.005

    // Temperature effect (higher temperatures can increase certain pollutants)
    const tempEffect = 1 + (features.temperature - 25) * 0.01

    // Pressure effect (low pressure can trap pollutants)
    const pressureEffect = 1 + (1013 - features.pressure) * 0.001

    const weatherMultiplier = windEffect * humidityEffect * tempEffect * pressureEffect

    return {
      aqi: base_aqi * weatherMultiplier,
      pm25: base_pm25 * weatherMultiplier,
      pm10: base_pm10 * weatherMultiplier,
    }
  }

  /**
   * Calculate prediction confidence score
   */
  private calculateConfidence(features: PredictionFeatures, hoursAhead: number): number {
    let confidence = 1.0

    // Decrease confidence with prediction horizon
    confidence *= Math.max(0.3, 1 - hoursAhead / 48)

    // Decrease confidence for extreme weather conditions
    if (features.wind_speed > 10 || features.wind_speed < 0.5) confidence *= 0.8
    if (features.humidity > 90 || features.humidity < 20) confidence *= 0.9

    // Seasonal confidence adjustments
    const seasonalConfidence = {
      winter: 0.85, // More predictable patterns
      summer: 0.8, // Heat effects
      monsoon: 0.6, // Highly variable due to rain
      post_monsoon: 0.9, // Most stable
    }

    confidence *= seasonalConfidence[features.season]

    return Math.round(Math.max(0.1, Math.min(1.0, confidence)) * 100) / 100
  }

  // Helper methods
  private calculateAverage(data: any[], field: string): number {
    const values = data.map((d) => d[field]).filter((v) => v != null)
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  private calculateTrend(data: any[], field: string): number {
    if (data.length < 2) return 0
    const values = data.map((d) => d[field]).filter((v) => v != null)
    if (values.length < 2) return 0
    return values[0] - values[values.length - 1] // Recent - oldest
  }

  private getSeason(month: number): "winter" | "summer" | "monsoon" | "post_monsoon" {
    if (month >= 12 || month <= 2) return "winter"
    if (month >= 3 && month <= 5) return "summer"
    if (month >= 6 && month <= 9) return "monsoon"
    return "post_monsoon"
  }

  private getAreaType(district: string): "central" | "north" | "south" | "east" | "west" {
    const districtLower = district.toLowerCase()
    if (districtLower.includes("central")) return "central"
    if (districtLower.includes("north")) return "north"
    if (districtLower.includes("south")) return "south"
    if (districtLower.includes("east")) return "east"
    return "west"
  }

  private getHourlyMultiplier(hour: number) {
    // Traffic and activity patterns in Bengaluru
    const patterns = {
      // Morning rush (7-10 AM)
      7: { aqi: 1.3, pm25: 1.4, pm10: 1.3 },
      8: { aqi: 1.4, pm25: 1.5, pm10: 1.4 },
      9: { aqi: 1.3, pm25: 1.4, pm10: 1.3 },
      10: { aqi: 1.2, pm25: 1.3, pm10: 1.2 },

      // Evening rush (6-9 PM)
      18: { aqi: 1.3, pm25: 1.4, pm10: 1.3 },
      19: { aqi: 1.4, pm25: 1.5, pm10: 1.4 },
      20: { aqi: 1.3, pm25: 1.4, pm10: 1.3 },
      21: { aqi: 1.2, pm25: 1.3, pm10: 1.2 },

      // Night hours (low activity)
      0: { aqi: 0.8, pm25: 0.7, pm10: 0.8 },
      1: { aqi: 0.7, pm25: 0.6, pm10: 0.7 },
      2: { aqi: 0.7, pm25: 0.6, pm10: 0.7 },
      3: { aqi: 0.7, pm25: 0.6, pm10: 0.7 },
      4: { aqi: 0.8, pm25: 0.7, pm10: 0.8 },
      5: { aqi: 0.9, pm25: 0.8, pm10: 0.9 },
    }

    return patterns[hour] || { aqi: 1.0, pm25: 1.0, pm10: 1.0 }
  }
}

// Singleton instance
export const airQualityPredictor = new AirQualityPredictor()
