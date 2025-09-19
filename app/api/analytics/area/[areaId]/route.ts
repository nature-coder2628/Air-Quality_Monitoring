import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { airQualityAnalytics } from "@/lib/analytics/air-quality-analytics"

export async function GET(request: NextRequest, { params }: { params: Promise<{ areaId: string }> }) {
  try {
    const { areaId } = await params
    const supabase = await createClient()

    // Get area information
    const { data: area, error: areaError } = await supabase.from("areas").select("*").eq("id", areaId).single()

    if (areaError || !area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 })
    }

    // Get readings for this area (last 7 days)
    const { data: readings, error: readingsError } = await supabase
      .from("air_quality_readings")
      .select("*")
      .eq("area_id", areaId)
      .gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("timestamp", { ascending: false })

    if (readingsError) {
      throw new Error(`Failed to fetch readings: ${readingsError.message}`)
    }

    // Get all areas data for ranking
    const { data: allAreas, error: allAreasError } = await supabase.from("areas").select("*")

    if (allAreasError) {
      throw new Error(`Failed to fetch all areas: ${allAreasError.message}`)
    }

    // Get latest readings for all areas for ranking
    const allAreasData = await Promise.all(
      (allAreas || []).map(async (area) => {
        const { data: areaReadings } = await supabase
          .from("air_quality_readings")
          .select("*")
          .eq("area_id", area.id)
          .order("timestamp", { ascending: false })
          .limit(50) // Last 50 readings for trend analysis

        return {
          area,
          readings: areaReadings || [],
        }
      }),
    )

    // Generate analytics
    const analytics = await airQualityAnalytics.generateAreaAnalytics(area, readings || [], allAreasData)

    return NextResponse.json({
      success: true,
      analytics,
      data_points: readings?.length || 0,
      analysis_period: "7 days",
    })
  } catch (error) {
    console.error("[v0] Area analytics error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate area analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
