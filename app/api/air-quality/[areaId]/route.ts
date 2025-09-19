import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ areaId: string }> }) {
  try {
    const { areaId } = await params
    const supabase = await createClient()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "24")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    // Calculate time range
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    // Fetch air quality readings for the area
    const { data: readings, error } = await supabase
      .from("air_quality_readings")
      .select(`
        *,
        area:areas(*)
      `)
      .eq("area_id", areaId)
      .gte("timestamp", startTime)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Get the latest reading
    const latestReading = readings && readings.length > 0 ? readings[0] : null

    // Get area info
    const { data: area, error: areaError } = await supabase.from("areas").select("*").eq("id", areaId).single()

    if (areaError) {
      throw new Error(`Area not found: ${areaError.message}`)
    }

    return NextResponse.json({
      area,
      latest: latestReading,
      readings: readings || [],
      count: readings?.length || 0,
      timeRange: {
        start: startTime,
        end: new Date().toISOString(),
        hours,
      },
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch area air quality data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
