import { NextResponse } from "next/server"
import { AlertManager } from "@/lib/alerts/alert-manager"

export async function POST() {
  try {
    const alertManager = new AlertManager()
    const alerts = await alertManager.checkAndCreateAlerts()

    return NextResponse.json({
      success: true,
      alertsCreated: alerts.length,
      alerts,
    })
  } catch (error) {
    console.error("Error checking alerts:", error)
    return NextResponse.json({ error: "Failed to check alerts" }, { status: 500 })
  }
}
