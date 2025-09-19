import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all areas with their latest readings
    const { data: areas, error } = await supabase
      .from("areas")
      .select(`
        *,
        air_quality_readings!inner(
          id,
          timestamp,
          aqi,
          pm25,
          pm10,
          temperature,
          humidity
        )
      `)
      .order("name")

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Process areas to get only the latest reading for each
    const areasWithLatest = await Promise.all(
      (areas || []).map(async (area) => {
        const { data: latestReading, error: readingError } = await supabase
          .from("air_quality_readings")
          .select("*")
          .eq("area_id", area.id)
          .order("timestamp", { ascending: false })
          .limit(1)
          .single()

        return {
          ...area,
          latest_reading: readingError ? null : latestReading,
        }
      }),
    )

    return NextResponse.json({
      areas: areasWithLatest,
      count: areasWithLatest.length,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch areas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
