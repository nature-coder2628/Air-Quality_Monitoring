import { type NextRequest, NextResponse } from "next/server"
import { AlertManager } from "@/lib/alerts/alert-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaId = searchParams.get("areaId")

    const alertManager = new AlertManager()
    const alerts = await alertManager.getActiveAlerts(areaId || undefined)

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get("alertId")

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 })
    }

    const alertManager = new AlertManager()
    await alertManager.dismissAlert(alertId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error dismissing alert:", error)
    return NextResponse.json({ error: "Failed to dismiss alert" }, { status: 500 })
  }
}
