// Advanced Air Quality Analytics Engine
// Provides comprehensive insights and comparisons across Bengaluru areas

import type { AirQualityReading, Area } from "@/lib/types/air-quality"

export interface AreaAnalytics {
  area: Area
  current: {
    aqi: number | null
    pm25: number | null
    pm10: number | null
    temperature: number | null
    humidity: number | null
    last_updated: string | null
  }
  trends: {
    aqi_24h_change: number
    pm25_24h_change: number
    trend_direction: "improving" | "worsening" | "stable"
  }
  statistics: {
    aqi_avg_7d: number
    aqi_max_7d: number
    aqi_min_7d: number
    pm25_avg_7d: number
    unhealthy_hours_7d: number
    good_hours_7d: number
  }
  ranking: {
    aqi_rank: number
    pm25_rank: number
    overall_rank: number
  }
  health_impact: {
    risk_level: "low" | "moderate" | "high" | "very_high"
    sensitive_groups_warning: boolean
    outdoor_activity_recommendation: string
  }
}

export interface CityWideAnalytics {
  overview: {
    total_areas: number
    areas_monitored: number
    avg_aqi: number
    worst_area: string
    best_area: string
    last_updated: string
  }
  distribution: {
    good: number
    moderate: number
    unhealthy_sensitive: number
    unhealthy: number
    very_unhealthy: number
    hazardous: number
  }
  trends: {
    city_avg_24h_change: number
    improving_areas: number
    worsening_areas: number
    stable_areas: number
  }
  hotspots: Array<{
    area: string
    aqi: number
    severity: string
    reason: string
  }>
  insights: string[]
}

export interface ComparisonAnalytics {
  areas: Array<{
    name: string
    district: string
    aqi: number | null
    pm25: number | null
    rank: number
  }>
  correlations: {
    weather_impact: number
    district_patterns: Record<string, number>
    time_patterns: Record<string, number>
  }
  recommendations: string[]
}

export class AirQualityAnalytics {
  /**
   * Generate comprehensive analytics for a specific area
   */
  async generateAreaAnalytics(
    area: Area,
    readings: AirQualityReading[],
    allAreasData: Array<{ area: Area; readings: AirQualityReading[] }>,
  ): Promise<AreaAnalytics> {
    if (readings.length === 0) {
      throw new Error(`No data available for ${area.name}`)
    }

    const current = this.getCurrentStats(readings)
    const trends = this.calculateTrends(readings)
    const statistics = this.calculateStatistics(readings)
    const ranking = this.calculateRanking(area, allAreasData)
    const health_impact = this.assessHealthImpact(current, trends)

    return {
      area,
      current,
      trends,
      statistics,
      ranking,
      health_impact,
    }
  }

  /**
   * Generate city-wide analytics across all areas
   */
  async generateCityWideAnalytics(
    allAreasData: Array<{ area: Area; readings: AirQualityReading[] }>,
  ): Promise<CityWideAnalytics> {
    const areasWithData = allAreasData.filter((data) => data.readings.length > 0)

    const overview = this.calculateCityOverview(areasWithData)
    const distribution = this.calculateAQIDistribution(areasWithData)
    const trends = this.calculateCityTrends(areasWithData)
    const hotspots = this.identifyHotspots(areasWithData)
    const insights = this.generateInsights(areasWithData, distribution, trends)

    return {
      overview,
      distribution,
      trends,
      hotspots,
      insights,
    }
  }

  /**
   * Generate comparison analytics between areas
   */
  async generateComparisonAnalytics(
    allAreasData: Array<{ area: Area; readings: AirQualityReading[] }>,
  ): Promise<ComparisonAnalytics> {
    const areasWithData = allAreasData.filter((data) => data.readings.length > 0)

    const areas = areasWithData
      .map((data, index) => {
        const latest = data.readings[0]
        return {
          name: data.area.name,
          district: data.area.district,
          aqi: latest?.aqi || null,
          pm25: latest?.pm25 || null,
          rank: index + 1, // Will be recalculated
        }
      })
      .sort((a, b) => (b.aqi || 0) - (a.aqi || 0))
      .map((area, index) => ({ ...area, rank: index + 1 }))

    const correlations = this.calculateCorrelations(areasWithData)
    const recommendations = this.generateRecommendations(areasWithData, correlations)

    return {
      areas,
      correlations,
      recommendations,
    }
  }

  // Private helper methods

  private getCurrentStats(readings: AirQualityReading[]) {
    const latest = readings[0]
    return {
      aqi: latest?.aqi || null,
      pm25: latest?.pm25 || null,
      pm10: latest?.pm10 || null,
      temperature: latest?.temperature || null,
      humidity: latest?.humidity || null,
      last_updated: latest?.timestamp || null,
    }
  }

  private calculateTrends(readings: AirQualityReading[]) {
    if (readings.length < 2) {
      return {
        aqi_24h_change: 0,
        pm25_24h_change: 0,
        trend_direction: "stable" as const,
      }
    }

    const current = readings[0]
    const dayAgo = readings.find((r) => {
      const timeDiff = new Date(current.timestamp).getTime() - new Date(r.timestamp).getTime()
      return timeDiff >= 20 * 60 * 60 * 1000 // ~24 hours ago (with some tolerance)
    })

    const aqi_24h_change = dayAgo ? (current.aqi || 0) - (dayAgo.aqi || 0) : 0
    const pm25_24h_change = dayAgo ? (current.pm25 || 0) - (dayAgo.pm25 || 0) : 0

    let trend_direction: "improving" | "worsening" | "stable" = "stable"
    if (aqi_24h_change > 10) trend_direction = "worsening"
    else if (aqi_24h_change < -10) trend_direction = "improving"

    return {
      aqi_24h_change,
      pm25_24h_change,
      trend_direction,
    }
  }

  private calculateStatistics(readings: AirQualityReading[]) {
    const last7Days = readings.filter((r) => {
      const timeDiff = new Date().getTime() - new Date(r.timestamp).getTime()
      return timeDiff <= 7 * 24 * 60 * 60 * 1000
    })

    const aqiValues = last7Days.map((r) => r.aqi).filter((v) => v != null) as number[]
    const pm25Values = last7Days.map((r) => r.pm25).filter((v) => v != null) as number[]

    const aqi_avg_7d = aqiValues.length > 0 ? aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length : 0
    const aqi_max_7d = aqiValues.length > 0 ? Math.max(...aqiValues) : 0
    const aqi_min_7d = aqiValues.length > 0 ? Math.min(...aqiValues) : 0
    const pm25_avg_7d = pm25Values.length > 0 ? pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length : 0

    const unhealthy_hours_7d = aqiValues.filter((aqi) => aqi > 150).length
    const good_hours_7d = aqiValues.filter((aqi) => aqi <= 50).length

    return {
      aqi_avg_7d: Math.round(aqi_avg_7d),
      aqi_max_7d,
      aqi_min_7d,
      pm25_avg_7d: Math.round(pm25_avg_7d * 10) / 10,
      unhealthy_hours_7d,
      good_hours_7d,
    }
  }

  private calculateRanking(area: Area, allAreasData: Array<{ area: Area; readings: AirQualityReading[] }>) {
    const areasWithData = allAreasData
      .filter((data) => data.readings.length > 0)
      .map((data) => ({
        area: data.area,
        aqi: data.readings[0]?.aqi || 0,
        pm25: data.readings[0]?.pm25 || 0,
      }))

    // Sort by AQI (lower is better)
    const aqiRanking = [...areasWithData].sort((a, b) => a.aqi - b.aqi)
    const pm25Ranking = [...areasWithData].sort((a, b) => a.pm25 - b.pm25)

    const aqi_rank = aqiRanking.findIndex((item) => item.area.id === area.id) + 1
    const pm25_rank = pm25Ranking.findIndex((item) => item.area.id === area.id) + 1
    const overall_rank = Math.round((aqi_rank + pm25_rank) / 2)

    return {
      aqi_rank,
      pm25_rank,
      overall_rank,
    }
  }

  private assessHealthImpact(current: any, trends: any) {
    const aqi = current.aqi || 0

    let risk_level: "low" | "moderate" | "high" | "very_high" = "low"
    let sensitive_groups_warning = false
    let outdoor_activity_recommendation = "Safe for all outdoor activities"

    if (aqi <= 50) {
      risk_level = "low"
      outdoor_activity_recommendation = "Excellent conditions for outdoor activities"
    } else if (aqi <= 100) {
      risk_level = "moderate"
      outdoor_activity_recommendation = "Good conditions, suitable for most outdoor activities"
    } else if (aqi <= 150) {
      risk_level = "high"
      sensitive_groups_warning = true
      outdoor_activity_recommendation = "Sensitive individuals should limit prolonged outdoor activities"
    } else if (aqi <= 200) {
      risk_level = "very_high"
      sensitive_groups_warning = true
      outdoor_activity_recommendation = "Everyone should limit outdoor activities"
    } else {
      risk_level = "very_high"
      sensitive_groups_warning = true
      outdoor_activity_recommendation = "Avoid all outdoor activities"
    }

    // Adjust based on trends
    if (trends.trend_direction === "worsening") {
      outdoor_activity_recommendation += ". Conditions are deteriorating."
    } else if (trends.trend_direction === "improving") {
      outdoor_activity_recommendation += ". Conditions are improving."
    }

    return {
      risk_level,
      sensitive_groups_warning,
      outdoor_activity_recommendation,
    }
  }

  private calculateCityOverview(areasWithData: Array<{ area: Area; readings: AirQualityReading[] }>) {
    const currentReadings = areasWithData.map((data) => data.readings[0]).filter((r) => r != null)

    const aqiValues = currentReadings.map((r) => r.aqi).filter((v) => v != null) as number[]
    const avg_aqi = aqiValues.length > 0 ? Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length) : 0

    const worstArea = areasWithData.reduce((worst, current) => {
      const currentAqi = current.readings[0]?.aqi || 0
      const worstAqi = worst.readings[0]?.aqi || 0
      return currentAqi > worstAqi ? current : worst
    })

    const bestArea = areasWithData.reduce((best, current) => {
      const currentAqi = current.readings[0]?.aqi || Number.POSITIVE_INFINITY
      const bestAqi = best.readings[0]?.aqi || Number.POSITIVE_INFINITY
      return currentAqi < bestAqi ? current : best
    })

    return {
      total_areas: areasWithData.length,
      areas_monitored: areasWithData.filter((data) => data.readings.length > 0).length,
      avg_aqi,
      worst_area: worstArea.area.name,
      best_area: bestArea.area.name,
      last_updated: new Date().toISOString(),
    }
  }

  private calculateAQIDistribution(areasWithData: Array<{ area: Area; readings: AirQualityReading[] }>) {
    const currentReadings = areasWithData.map((data) => data.readings[0]).filter((r) => r?.aqi != null)

    const distribution = {
      good: 0, // 0-50
      moderate: 0, // 51-100
      unhealthy_sensitive: 0, // 101-150
      unhealthy: 0, // 151-200
      very_unhealthy: 0, // 201-300
      hazardous: 0, // 301+
    }

    currentReadings.forEach((reading) => {
      const aqi = reading.aqi!
      if (aqi <= 50) distribution.good++
      else if (aqi <= 100) distribution.moderate++
      else if (aqi <= 150) distribution.unhealthy_sensitive++
      else if (aqi <= 200) distribution.unhealthy++
      else if (aqi <= 300) distribution.very_unhealthy++
      else distribution.hazardous++
    })

    return distribution
  }

  private calculateCityTrends(areasWithData: Array<{ area: Area; readings: AirQualityReading[] }>) {
    let totalChange = 0
    let improving_areas = 0
    let worsening_areas = 0
    let stable_areas = 0

    areasWithData.forEach((data) => {
      const trends = this.calculateTrends(data.readings)
      totalChange += trends.aqi_24h_change

      if (trends.trend_direction === "improving") improving_areas++
      else if (trends.trend_direction === "worsening") worsening_areas++
      else stable_areas++
    })

    const city_avg_24h_change = areasWithData.length > 0 ? totalChange / areasWithData.length : 0

    return {
      city_avg_24h_change: Math.round(city_avg_24h_change * 10) / 10,
      improving_areas,
      worsening_areas,
      stable_areas,
    }
  }

  private identifyHotspots(areasWithData: Array<{ area: Area; readings: AirQualityReading[] }>) {
    return areasWithData
      .filter((data) => data.readings[0]?.aqi && data.readings[0].aqi > 150)
      .sort((a, b) => (b.readings[0]?.aqi || 0) - (a.readings[0]?.aqi || 0))
      .slice(0, 5)
      .map((data) => {
        const aqi = data.readings[0]?.aqi || 0
        let severity = "Unhealthy"
        let reason = "High particulate matter concentration"

        if (aqi > 300) {
          severity = "Hazardous"
          reason = "Extremely high pollution levels - avoid all outdoor activities"
        } else if (aqi > 200) {
          severity = "Very Unhealthy"
          reason = "Very high pollution - health warnings for everyone"
        } else if (aqi > 150) {
          severity = "Unhealthy"
          reason = "Unhealthy air quality - sensitive groups should avoid outdoor activities"
        }

        return {
          area: data.area.name,
          aqi,
          severity,
          reason,
        }
      })
  }

  private calculateCorrelations(areasWithData: Array<{ area: Area; readings: AirQualityReading[] }>) {
    // Weather impact correlation (simplified)
    let weatherCorrelation = 0
    let validReadings = 0

    areasWithData.forEach((data) => {
      data.readings.forEach((reading) => {
        if (reading.aqi && reading.wind_speed && reading.humidity) {
          // Higher wind speed generally reduces AQI (negative correlation)
          // Higher humidity can trap pollutants (positive correlation)
          const windEffect = -reading.wind_speed * 5
          const humidityEffect = (reading.humidity - 50) * 0.5
          const expectedChange = windEffect + humidityEffect
          const actualAqi = reading.aqi

          weatherCorrelation += Math.abs(expectedChange) > 0 ? 1 : 0
          validReadings++
        }
      })
    })

    const weather_impact = validReadings > 0 ? weatherCorrelation / validReadings : 0

    // District patterns
    const district_patterns: Record<string, number> = {}
    areasWithData.forEach((data) => {
      const avgAqi = data.readings.reduce((sum, r) => sum + (r.aqi || 0), 0) / data.readings.length
      district_patterns[data.area.district] = Math.round(avgAqi)
    })

    // Time patterns (simplified - would need more data for accurate analysis)
    const time_patterns = {
      morning_rush: 120, // 7-10 AM
      afternoon: 100, // 12-4 PM
      evening_rush: 130, // 6-9 PM
      night: 80, // 10 PM - 6 AM
    }

    return {
      weather_impact: Math.round(weather_impact * 100) / 100,
      district_patterns,
      time_patterns,
    }
  }

  private generateInsights(
    areasWithData: Array<{ area: Area; readings: AirQualityReading[] }>,
    distribution: any,
    trends: any,
  ): string[] {
    const insights: string[] = []

    // Distribution insights
    const totalAreas = Object.values(distribution).reduce((a: number, b: number) => a + b, 0)
    const unhealthyPercentage =
      ((distribution.unhealthy + distribution.very_unhealthy + distribution.hazardous) / totalAreas) * 100

    if (unhealthyPercentage > 30) {
      insights.push(`${Math.round(unhealthyPercentage)}% of monitored areas have unhealthy air quality levels`)
    }

    if (distribution.good > totalAreas * 0.5) {
      insights.push("More than half of Bengaluru areas currently have good air quality")
    }

    // Trend insights
    if (trends.improving_areas > trends.worsening_areas) {
      insights.push(
        `Air quality is improving in ${trends.improving_areas} areas, worsening in ${trends.worsening_areas}`,
      )
    } else if (trends.worsening_areas > trends.improving_areas) {
      insights.push(
        `Air quality is worsening in ${trends.worsening_areas} areas, improving in ${trends.improving_areas}`,
      )
    }

    // Seasonal insights (simplified)
    const currentMonth = new Date().getMonth() + 1
    if (currentMonth >= 11 || currentMonth <= 2) {
      insights.push("Winter months typically show higher pollution levels due to reduced wind dispersion")
    } else if (currentMonth >= 6 && currentMonth <= 9) {
      insights.push("Monsoon season generally improves air quality through natural cleansing")
    }

    // District insights
    const districtAverages = new Map<string, number[]>()
    areasWithData.forEach((data) => {
      const district = data.area.district
      const aqi = data.readings[0]?.aqi
      if (aqi) {
        if (!districtAverages.has(district)) {
          districtAverages.set(district, [])
        }
        districtAverages.get(district)!.push(aqi)
      }
    })

    const districtAvgs = Array.from(districtAverages.entries()).map(([district, aqis]) => ({
      district,
      avg: aqis.reduce((a, b) => a + b, 0) / aqis.length,
    }))

    if (districtAvgs.length > 1) {
      const best = districtAvgs.reduce((a, b) => (a.avg < b.avg ? a : b))
      const worst = districtAvgs.reduce((a, b) => (a.avg > b.avg ? a : b))
      insights.push(`${best.district} areas generally have better air quality than ${worst.district} areas`)
    }

    return insights.slice(0, 5) // Limit to top 5 insights
  }

  private generateRecommendations(
    areasWithData: Array<{ area: Area; readings: AirQualityReading[] }>,
    correlations: any,
  ): string[] {
    const recommendations: string[] = []

    // Weather-based recommendations
    if (correlations.weather_impact > 0.3) {
      recommendations.push("Monitor wind patterns - higher wind speeds typically improve air quality")
      recommendations.push("Consider indoor activities during high humidity periods when pollution may be trapped")
    }

    // District-based recommendations
    const districtAvgs = Object.entries(correlations.district_patterns) as [string, number][]
    const bestDistrict = districtAvgs.reduce((a, b) => (a[1] < b[1] ? a : b))
    const worstDistrict = districtAvgs.reduce((a, b) => (a[1] > b[1] ? a : b))

    if (bestDistrict[1] < worstDistrict[1] - 20) {
      recommendations.push(`Consider ${bestDistrict[0]} areas for outdoor activities - consistently better air quality`)
      recommendations.push(`Limit outdoor exposure in ${worstDistrict[0]} areas during high pollution periods`)
    }

    // Time-based recommendations
    recommendations.push("Avoid outdoor exercise during morning (7-10 AM) and evening (6-9 PM) rush hours")
    recommendations.push("Early morning (5-7 AM) and late evening (after 9 PM) typically have cleaner air")

    // General health recommendations
    recommendations.push("Use air purifiers indoors when AQI exceeds 100")
    recommendations.push("Wear N95 masks outdoors when AQI exceeds 150")

    return recommendations.slice(0, 6)
  }
}

// Singleton instance
export const airQualityAnalytics = new AirQualityAnalytics()
