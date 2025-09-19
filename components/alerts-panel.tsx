"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { AirQualityAlert } from "@/lib/types/air-quality"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface AlertsPanelProps {
  areaId: string
}

export function AlertsPanel({ areaId }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<AirQualityAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (areaId) {
      loadAlerts()
    }
  }, [areaId])

  const loadAlerts = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("air_quality_alerts")
        .select(`
          *,
          area:areas(*)
        `)
        .eq("area_id", areaId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setAlerts(data || [])
    } catch (error) {
      console.error("Error loading alerts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "moderate":
        return "bg-yellow-500"
      case "unhealthy":
        return "bg-orange-500"
      case "hazardous":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "hazardous":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Environmental Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400">Loading alerts...</div>
        </CardContent>
      </Card>
    )
  }

  const activeAlerts = alerts.filter((alert) => alert.is_active)
  const resolvedAlerts = alerts.filter((alert) => !alert.is_active)

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Alerts ({activeAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Active Alerts</h3>
                <p className="text-slate-600 dark:text-slate-400">Air quality levels are within acceptable ranges</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{alert.alert_type.replace("_", " ").toUpperCase()}</span>
                          <Badge className={`text-white ${getSeverityColor(alert.severity)}`}>{alert.severity}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {alert.threshold_value && alert.actual_value && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Threshold: {alert.threshold_value}</span>
                      <span>Actual: {alert.actual_value}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts History */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Alert History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{alert.alert_type.replace("_", " ").toUpperCase()}</span>
                      <Badge variant="outline" className="text-xs">
                        Resolved
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(alert.resolved_at || alert.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
