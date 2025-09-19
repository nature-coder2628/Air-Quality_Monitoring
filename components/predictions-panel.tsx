"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { type AirQualityPrediction, getAQICategory } from "@/lib/types/air-quality"
import { Brain, Clock } from "lucide-react"

interface PredictionsPanelProps {
  areaId: string
}

export function PredictionsPanel({ areaId }: PredictionsPanelProps) {
  const [predictions, setPredictions] = useState<AirQualityPrediction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (areaId) {
      loadPredictions()
    }
  }, [areaId])

  const loadPredictions = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("air_quality_predictions")
        .select(`
          *,
          area:areas(*)
        `)
        .eq("area_id", areaId)
        .gte("predicted_for", new Date().toISOString())
        .order("predicted_for", { ascending: true })
        .limit(24) // Next 24 hours

      if (error) throw error

      setPredictions(data || [])
    } catch (error) {
      console.error("Error loading predictions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400">Loading predictions...</div>
        </CardContent>
      </Card>
    )
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto text-slate-400" />
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No Predictions Available</h3>
              <p className="text-slate-600 dark:text-slate-400">
                ML predictions will appear here once the model is trained with sufficient data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Predictions - Next 24 Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.slice(0, 6).map((prediction) => {
              const predictedTime = new Date(prediction.predicted_for)
              const aqiCategory = prediction.predicted_aqi ? getAQICategory(prediction.predicted_aqi) : null

              return (
                <div key={prediction.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {predictedTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {prediction.confidence_score && (
                      <Badge variant="outline">{Math.round(prediction.confidence_score * 100)}% confidence</Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Predicted AQI</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{prediction.predicted_aqi || "N/A"}</span>
                        {aqiCategory && (
                          <Badge variant="secondary" className={`text-white bg-${aqiCategory.color}-500 text-xs`}>
                            {aqiCategory.label}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">PM2.5</span>
                      <span className="text-sm font-medium">
                        {prediction.predicted_pm25?.toFixed(1) || "N/A"} µg/m³
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
