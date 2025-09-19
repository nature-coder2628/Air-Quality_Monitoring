import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { airQualityPredictor } from "@/lib/ml/air-quality-predictor"

export async function POST(request: NextRequest) {
  try {
    const { areaId, hoursAhead = 24 } = await request.json()

    if (!areaId) {
      return NextResponse.json({ error: "Area ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get area information
    const { data: area, error: areaError } = await supabase.from("areas").select("*").eq("id", areaId).single()

    if (areaError || !area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 })
    }

    // Get historical data (last 48 hours for better prediction)
    const { data: historicalData, error: historyError } = await supabase
      .from("air_quality_readings")
      .select("*")
      .eq("area_id", areaId)
      .gte("timestamp", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order("timestamp", { ascending: false })

    if (historyError) {
      throw new Error(`Failed to fetch historical data: ${historyError.message}`)
    }

    if (!historicalData || historicalData.length < 24) {
      return NextResponse.json(
        {
          error: "Insufficient historical data for prediction (minimum 24 hours required)",
        },
        { status: 400 },
      )
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

    console.log(`[v0] Generating predictions for ${area.name} (${hoursAhead} hours ahead)`)

    // Generate predictions
    const predictions = await airQualityPredictor.generatePredictions(
      historicalData,
      weatherData,
      area,
      Math.min(hoursAhead, 48), // Limit to 48 hours
    )

    // Store predictions in database
    const predictionRecords = predictions.map((prediction) => ({
      area_id: areaId,
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
      .eq("area_id", areaId)
      .gte("predicted_for", new Date().toISOString())

    // Insert new predictions
    const { data: insertedPredictions, error: insertError } = await supabase
      .from("air_quality_predictions")
      .insert(predictionRecords)
      .select()

    if (insertError) {
      throw new Error(`Failed to store predictions: ${insertError.message}`)
    }

    console.log(`[v0] Successfully generated and stored ${predictions.length} predictions for ${area.name}`)

    return NextResponse.json({
      success: true,
      area: area.name,
      predictions_generated: predictions.length,
      predictions: insertedPredictions,
      model_version: predictions[0]?.model_version,
      confidence_range: {
        min: Math.min(...predictions.map((p) => p.confidence_score)),
        max: Math.max(...predictions.map((p) => p.confidence_score)),
        avg: predictions.reduce((sum, p) => sum + p.confidence_score, 0) / predictions.length,
      },
    })
  } catch (error) {
    console.error("[v0] Prediction generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate predictions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Air Quality Prediction Generator",
    description: "Use POST to generate ML predictions for air quality",
    endpoints: {
      "POST /api/predictions/generate": "Generate predictions for a specific area",
    },
    parameters: {
      areaId: "UUID of the area to generate predictions for",
      hoursAhead: "Number of hours to predict (default: 24, max: 48)",
    },
  })
}
