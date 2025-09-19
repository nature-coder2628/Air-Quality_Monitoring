import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { airQualityAnalytics } from "@/lib/analytics/air-quality-analytics"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all areas
    const { data: allAreas, error: allAreasError } = await supabase.from("areas").select("*")

    if (allAreasError) {
      throw new Error(`Failed to fetch areas: ${allAreasError.message}`)
    }

    // Get recent readings for all areas
    const allAreasData = await Promise.all(
      (allAreas || []).map(async (area) => {
        const { data: readings } = await supabase
          .from("air_quality_readings")
          .select("*")
          .eq("area_id", area.id)
          .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("timestamp", { ascending: false })
          .limit(50)

        return {
          area,
          readings: readings || [],
        }
      }),
    )

    // Generate comparison analytics
    const analytics = await airQualityAnalytics.generateComparisonAnalytics(allAreasData)

    return NextResponse.json({
      success: true,
      analytics,
      areas_compared: allAreasData.filter((data) => data.readings.length > 0).length,
      total_areas: allAreas?.length || 0,
      analysis_period: "24 hours",
    })
  } catch (error) {
    console.error("[v0] Comparison analytics error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate comparison analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
