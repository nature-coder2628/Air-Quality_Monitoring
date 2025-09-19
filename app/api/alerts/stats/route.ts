import { NextResponse } from "next/server"
import { AlertManager } from "@/lib/alerts/alert-manager"

export async function GET() {
  try {
    const alertManager = new AlertManager()
    const stats = await alertManager.getAlertStats()

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching alert stats:", error)
    return NextResponse.json({ error: "Failed to fetch alert stats" }, { status: 500 })
  }
}
