"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Bell, X, RefreshCw } from "lucide-react"
import { type Alert as AlertType, AlertSeverity } from "@/lib/types/air-quality"

export function AlertsCenter() {
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const checkForNewAlerts = async () => {
    setRefreshing(true)
    try {
      await fetch("/api/alerts/check", { method: "POST" })
      await fetchAlerts()
    } catch (error) {
      console.error("Error checking for new alerts:", error)
      setRefreshing(false)
    }
  }

  const dismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts?alertId=${alertId}`, { method: "DELETE" })
      setAlerts(alerts.filter((alert) => alert.id !== alertId))
    } catch (error) {
      console.error("Error dismissing alert:", error)
    }
  }

  useEffect(() => {
    fetchAlerts()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return "bg-red-500 text-white"
      case AlertSeverity.HIGH:
        return "bg-orange-500 text-white"
      case AlertSeverity.MEDIUM:
        return "bg-yellow-500 text-white"
      case AlertSeverity.LOW:
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
      case AlertSeverity.HIGH:
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Environmental Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Environmental Alerts
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={checkForNewAlerts} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active alerts</p>
            <p className="text-sm">Air quality conditions are normal</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="relative">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                      <span className="text-sm text-slate-500">{alert.areaName}</span>
                    </div>
                    <h4 className="font-medium mb-1">{alert.title}</h4>
                    <AlertDescription className="text-sm">{alert.message}</AlertDescription>
                    {alert.currentValue && alert.thresholdValue && (
                      <div className="mt-2 text-xs text-slate-500">
                        Current: {alert.currentValue} | Threshold: {alert.thresholdValue}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-400">{alert.timestamp.toLocaleString()}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)} className="flex-shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
