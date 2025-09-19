import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { openWeatherService } from "@/lib/openweather"
import type { AirQualityReading } from "@/lib/types/air-quality"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all areas from database
    const { data: areas, error: areasError } = await supabase.from("areas").select("*")

    if (areasError) {
      throw new Error(`Database error: ${areasError.message}`)
    }

    if (!areas || areas.length === 0) {
      return NextResponse.json({ error: "No areas found in database" }, { status: 404 })
    }

    const results = []
    const errors = []

    // Fetch data for each area
    for (const area of areas) {
      try {
        console.log(`[v0] Fetching data for ${area.name}...`)

        // Fetch both weather and air pollution data
        const [weatherData, pollutionData] = await Promise.all([
          openWeatherService.getCurrentWeather(area.latitude, area.longitude),
          openWeatherService.getAirPollution(area.latitude, area.longitude),
        ])

        if (!weatherData || !pollutionData) {
          errors.push(`Failed to fetch data for ${area.name}`)
          continue
        }

        // Prepare air quality reading data
        const pollutionReading = pollutionData.list[0]
        const reading: Partial<AirQualityReading> = {
          area_id: area.id,
          timestamp: new Date().toISOString(),

          // Air quality data
          aqi: openWeatherService.convertAQI(pollutionReading.main.aqi),
          pm25: pollutionReading.components.pm2_5,
          pm10: pollutionReading.components.pm10,
          no2: pollutionReading.components.no2,
          so2: pollutionReading.components.so2,
          co: pollutionReading.components.co,
          o3: pollutionReading.components.o3,

          // Weather data
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          wind_speed: weatherData.wind.speed,
          wind_direction: weatherData.wind.deg,
          visibility: weatherData.visibility / 1000, // Convert to km

          source: "openweather",
        }

        // Insert into database
        const { data: insertedReading, error: insertError } = await supabase
          .from("air_quality_readings")
          .insert(reading)
          .select()
          .single()

        if (insertError) {
          errors.push(`Database insert error for ${area.name}: ${insertError.message}`)
          continue
        }

        results.push({
          area: area.name,
          reading: insertedReading,
          status: "success",
        })

        console.log(`[v0] Successfully stored data for ${area.name}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        errors.push(`Error processing ${area.name}: ${errorMessage}`)
        console.error(`[v0] Error processing ${area.name}:`, error)
      }

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: areas.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch air quality data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Air Quality Data Fetcher",
    description: "Use POST to fetch and store air quality data for all areas",
    endpoints: {
      "POST /api/air-quality/fetch": "Fetch current air quality data for all areas",
    },
  })
}
