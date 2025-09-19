"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Zap, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface MLPredictorProps {
  areas: Array<{ id: string; name: string; district: string }>
}

export function MLPredictor({ areas }: MLPredictorProps) {
  const [selectedArea, setSelectedArea] = useState<string>("")
  const [hoursAhead, setHoursAhead] = useState<string>("24")
  const [isLoading, setIsLoading] = useState(false)
  const [isBatchLoading, setIsBatchLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [batchResult, setBatchResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generatePredictions = async (batch = false) => {
    if (batch) {
      setIsBatchLoading(true)
      setBatchResult(null)
    } else {
      setIsLoading(true)
      setResult(null)
    }

    setError(null)

    try {
      const endpoint = batch ? "/api/predictions/batch" : "/api/predictions/generate"
      const body = batch
        ? { hoursAhead: Number.parseInt(hoursAhead) }
        : { areaId: selectedArea, hoursAhead: Number.parseInt(hoursAhead) }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate predictions")
      }

      if (batch) {
        setBatchResult(data)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      if (batch) {
        setIsBatchLoading(false)
      } else {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Single Area Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Prediction Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Area</label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name} ({area.district})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Hours Ahead</label>
              <Select value={hoursAhead} onValueChange={setHoursAhead}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => generatePredictions(false)}
                disabled={!selectedArea || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Predictions
                  </>
                )}
              </Button>
            </div>
          </div>

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully generated {result.predictions_generated} predictions for {result.area}
                <div className="mt-2 text-xs">
                  Model: {result.model_version} | Confidence: {Math.round(result.confidence_range.avg * 100)}% avg
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Batch Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Batch Prediction Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => generatePredictions(true)} disabled={isBatchLoading} variant="outline">
              {isBatchLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating for all areas...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate for All Areas
                </>
              )}
            </Button>

            <div className="text-sm text-slate-600 dark:text-slate-400">
              Generates predictions for all {areas.length} areas in Bengaluru
            </div>
          </div>

          {batchResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Batch prediction completed: {batchResult.summary.successful_areas} successful,{" "}
                {batchResult.summary.failed_areas} failed
                <div className="mt-2">
                  <div className="text-xs">
                    Average confidence: {Math.round(batchResult.summary.avg_confidence * 100)}%
                  </div>
                  {batchResult.results && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-2">
                      {batchResult.results.slice(0, 8).map((item: any, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {item.area}
                        </Badge>
                      ))}
                      {batchResult.results.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{batchResult.results.length - 8} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ML Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            ML Model Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Prediction Features</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Historical air quality trends (24h averages)</li>
                <li>• Weather conditions (temperature, humidity, wind)</li>
                <li>• Temporal patterns (hour, day, season)</li>
                <li>• Location characteristics (area type, district)</li>
                <li>• Traffic and activity cycles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Model Ensemble</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Linear trend extrapolation (30%)</li>
                <li>• Seasonal pattern analysis (40%)</li>
                <li>• Weather-based modeling (30%)</li>
                <li>• Confidence scoring based on data quality</li>
                <li>• Bengaluru-specific calibration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
