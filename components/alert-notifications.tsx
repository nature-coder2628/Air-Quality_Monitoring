"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, Bell } from "lucide-react"
import { type Alert as AlertType, AlertSeverity } from "@/lib/types/air-quality"

export function AlertNotifications() {
  const [notifications, setNotifications] = useState<AlertType[]>([])

  useEffect(() => {
    // Check for new alerts every minute
    const checkAlerts = async () => {
      try {
        const response = await fetch("/api/alerts")
        const data = await response.json()
        const newAlerts =
          data.alerts?.filter(
            (alert: AlertType) => alert.severity === AlertSeverity.CRITICAL || alert.severity === AlertSeverity.HIGH,
          ) || []

        // Only show new notifications (not already shown)
        const unseenAlerts = newAlerts.filter((alert: AlertType) => !notifications.some((n) => n.id === alert.id))

        if (unseenAlerts.length > 0) {
          setNotifications((prev) => [...prev, ...unseenAlerts])
        }
      } catch (error) {
        console.error("Error checking for alert notifications:", error)
      }
    }

    checkAlerts()
    const interval = setInterval(checkAlerts, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [notifications])

  const dismissNotification = (alertId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== alertId))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((alert) => (
        <Alert
          key={alert.id}
          className={`shadow-lg border-l-4 ${
            alert.severity === AlertSeverity.CRITICAL
              ? "border-l-red-500 bg-red-50 dark:bg-red-950"
              : "border-l-orange-500 bg-orange-50 dark:bg-orange-950"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {alert.severity === AlertSeverity.CRITICAL ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Bell className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm mb-1">
                {alert.title} - {alert.areaName}
              </div>
              <AlertDescription className="text-xs">{alert.message}</AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(alert.id)}
              className="flex-shrink-0 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  )
}
