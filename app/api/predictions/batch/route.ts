import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { airQualityPredictor } from "@/lib/ml/air-quality-predictor"

export async function POST(request: NextRequest) {
  try {
    const { hoursAhead = 24 } = await request.json()
    const supabase = await createClient()

    // Get all areas
    const { data: areas, error: areasError } = await supabase.from("areas").select("*")

    if (areasError || !areas) {
      throw new Error(`Failed to fetch areas: ${areasError?.message}`)
    }

    const results = []
    const errors = []

    console.log(`[v0] Starting batch prediction generation for ${areas.length} areas`)

    // Generate predictions for each area
    for (const area of areas) {
      try {
        // Get historical data for this area
        const { data: historicalData, error: historyError } = await supabase
          .from("air_quality_readings")
          .select("*")
          .eq("area_id", area.id)
          .gte("timestamp", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
          .order("timestamp", { ascending: false })

        if (historyError || !historicalData || historicalData.length < 24) {
          errors.push(`${area.name}: Insufficient historical data`)
          continue
        }

        // Get latest weather data
        const latestReading = historicalData[0]
        const weatherData = {
          temperature: latestReading.temperature,
          humidity: latestReading.humidity,
          pressure: latestReading.pressure,
          wind_speed: latestReading.wind_speed,
          wind_direction: latestReading.wind_direction,
        }

        // Generate predictions
        const predictions = await airQualityPredictor.generatePredictions(
          historicalData,
          weatherData,
          area,
          Math.min(hoursAhead, 48),
        )

        // Prepare prediction records
        const predictionRecords = predictions.map((prediction) => ({
          area_id: area.id,
          prediction_timestamp: new Date().toISOString(),
          predicted_for: new Date(Date.now() + prediction.prediction_horizon_hours * 60 * 60 * 1000).toISOString(),
          predicted_aqi: prediction.predicted_aqi,
          predicted_pm25: prediction.predicted_pm25,
          predicted_pm10: prediction.predicted_pm10,
          confidence_score: prediction.confidence_score,
          model_version: prediction.model_version,
          features_used: prediction.features_used,
        }))

        // Clear old predictions for this area
        await supabase
          .from("air_quality_predictions")
          .delete()
          .eq("area_id", area.id)
          .gte("predicted_for", new Date().toISOString())

        // Insert new predictions
        const { error: insertError } = await supabase.from("air_quality_predictions").insert(predictionRecords)

        if (insertError) {
          errors.push(`${area.name}: Failed to store predictions - ${insertError.message}`)
          continue
        }

        results.push({
          area: area.name,
          predictions_generated: predictions.length,
          avg_confidence: predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length,
          status: "success",
        })

        console.log(`[v0] Generated predictions for ${area.name}`)

        // Add delay to prevent overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        errors.push(`${area.name}: ${errorMessage}`)
        console.error(`[v0] Error generating predictions for ${area.name}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      total: areas.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        successful_areas: results.length,
        failed_areas: errors.length,
        avg_confidence: results.length > 0 ? results.reduce((sum, r) => sum + r.avg_confidence, 0) / results.length : 0,
      },
    })
  } catch (error) {
    console.error("[v0] Batch prediction error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate batch predictions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Batch Air Quality Prediction Generator",
    description: "Use POST to generate ML predictions for all areas",
    endpoints: {
      "POST /api/predictions/batch": "Generate predictions for all areas",
    },
    parameters: {
      hoursAhead: "Number of hours to predict (default: 24, max: 48)",
    },
  })
}
