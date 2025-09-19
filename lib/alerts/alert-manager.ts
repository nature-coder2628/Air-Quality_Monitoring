import { createServerClient } from "@/lib/supabase/server"
import { type Alert, AlertType, AlertSeverity } from "@/lib/types/air-quality"

export class AlertManager {
  private supabase = createServerClient()

  async checkAndCreateAlerts(): Promise<Alert[]> {
    const alerts: Alert[] = []

    // Get latest readings for all areas
    const { data: readings } = await this.supabase
      .from("air_quality_readings")
      .select(`
        *,
        areas (name, type)
      `)
      .order("timestamp", { ascending: false })
      .limit(50)

    if (!readings) return alerts

    // Group by area and get latest reading for each
    const latestByArea = new Map()
    readings.forEach((reading) => {
      if (!latestByArea.has(reading.area_id)) {
        latestByArea.set(reading.area_id, reading)
      }
    })

    // Check each area for alert conditions
    for (const [areaId, reading] of latestByArea) {
      const areaAlerts = await this.checkAreaAlerts(reading)
      alerts.push(...areaAlerts)
    }

    // Save alerts to database
    if (alerts.length > 0) {
      await this.supabase.from("alerts").insert(
        alerts.map((alert) => ({
          area_id: alert.areaId,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          message: alert.message,
          threshold_value: alert.thresholdValue,
          current_value: alert.currentValue,
          is_active: true,
          created_at: new Date().toISOString(),
        })),
      )
    }

    return alerts
  }

  private async checkAreaAlerts(reading: any): Promise<Alert[]> {
    const alerts: Alert[] = []
    const aqi = reading.aqi_us_epa

    // AQI threshold alerts
    if (aqi >= 301) {
      alerts.push({
        id: `hazardous-${reading.area_id}`,
        areaId: reading.area_id,
        areaName: reading.areas.name,
        type: AlertType.HEALTH_WARNING,
        severity: AlertSeverity.CRITICAL,
        title: "HAZARDOUS Air Quality",
        message: "Emergency conditions. Everyone should avoid all outdoor activities.",
        thresholdValue: 301,
        currentValue: aqi,
        timestamp: new Date(),
        isActive: true,
      })
    } else if (aqi >= 201) {
      alerts.push({
        id: `very-unhealthy-${reading.area_id}`,
        areaId: reading.area_id,
        areaName: reading.areas.name,
        type: AlertType.HEALTH_WARNING,
        severity: AlertSeverity.HIGH,
        title: "Very Unhealthy Air Quality",
        message: "Health warnings of emergency conditions. Everyone should avoid outdoor activities.",
        thresholdValue: 201,
        currentValue: aqi,
        timestamp: new Date(),
        isActive: true,
      })
    } else if (aqi >= 151) {
      alerts.push({
        id: `unhealthy-${reading.area_id}`,
        areaId: reading.area_id,
        areaName: reading.areas.name,
        type: AlertType.HEALTH_WARNING,
        severity: AlertSeverity.MEDIUM,
        title: "Unhealthy Air Quality",
        message: "Everyone may experience health effects. Limit outdoor activities.",
        thresholdValue: 151,
        currentValue: aqi,
        timestamp: new Date(),
        isActive: true,
      })
    }

    // Pollutant-specific alerts
    if (reading.pm25 > 55.4) {
      alerts.push({
        id: `pm25-high-${reading.area_id}`,
        areaId: reading.area_id,
        areaName: reading.areas.name,
        type: AlertType.POLLUTANT_SPIKE,
        severity: AlertSeverity.MEDIUM,
        title: "High PM2.5 Levels",
        message: "Fine particulate matter levels are elevated. Consider wearing masks outdoors.",
        thresholdValue: 55.4,
        currentValue: reading.pm25,
        timestamp: new Date(),
        isActive: true,
      })
    }

    if (reading.pm10 > 154) {
      alerts.push({
        id: `pm10-high-${reading.area_id}`,
        areaId: reading.area_id,
        areaName: reading.areas.name,
        type: AlertType.POLLUTANT_SPIKE,
        severity: AlertSeverity.MEDIUM,
        title: "High PM10 Levels",
        message: "Coarse particulate matter levels are elevated.",
        thresholdValue: 154,
        currentValue: reading.pm10,
        timestamp: new Date(),
        isActive: true,
      })
    }

    // Weather-based alerts
    if (reading.wind_speed < 2) {
      alerts.push({
        id: `low-wind-${reading.area_id}`,
        areaId: reading.area_id,
        areaName: reading.areas.name,
        type: AlertType.WEATHER_IMPACT,
        severity: AlertSeverity.LOW,
        title: "Low Wind Conditions",
        message: "Stagnant air conditions may lead to pollutant accumulation.",
        thresholdValue: 2,
        currentValue: reading.wind_speed,
        timestamp: new Date(),
        isActive: true,
      })
    }

    return alerts
  }

  async getActiveAlerts(areaId?: string): Promise<Alert[]> {
    let query = this.supabase
      .from("alerts")
      .select(`
        *,
        areas (name, type)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (areaId) {
      query = query.eq("area_id", areaId)
    }

    const { data } = await query

    return (
      data?.map((alert) => ({
        id: alert.id,
        areaId: alert.area_id,
        areaName: alert.areas.name,
        type: alert.type as AlertType,
        severity: alert.severity as AlertSeverity,
        title: alert.title,
        message: alert.message,
        thresholdValue: alert.threshold_value,
        currentValue: alert.current_value,
        timestamp: new Date(alert.created_at),
        isActive: alert.is_active,
      })) || []
    )
  }

  async dismissAlert(alertId: string): Promise<void> {
    await this.supabase.from("alerts").update({ is_active: false }).eq("id", alertId)
  }

  async getAlertStats(): Promise<{
    total: number
    bySeverity: Record<AlertSeverity, number>
    byType: Record<AlertType, number>
  }> {
    const { data } = await this.supabase.from("alerts").select("severity, type").eq("is_active", true)

    const stats = {
      total: data?.length || 0,
      bySeverity: {
        [AlertSeverity.LOW]: 0,
        [AlertSeverity.MEDIUM]: 0,
        [AlertSeverity.HIGH]: 0,
        [AlertSeverity.CRITICAL]: 0,
      },
      byType: {
        [AlertType.HEALTH_WARNING]: 0,
        [AlertType.POLLUTANT_SPIKE]: 0,
        [AlertType.WEATHER_IMPACT]: 0,
        [AlertType.PREDICTION_ALERT]: 0,
      },
    }

    data?.forEach((alert) => {
      stats.bySeverity[alert.severity as AlertSeverity]++
      stats.byType[alert.type as AlertType]++
    })

    return stats
  }
}
