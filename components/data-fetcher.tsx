"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function DataFetcher() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/air-quality/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Data Fetcher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={fetchData} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching Data...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Fetch Latest Data
              </>
            )}
          </Button>

          <div className="text-sm text-slate-600 dark:text-slate-400">
            Fetches current air quality data from OpenWeather API for all Bengaluru areas
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully processed {result.processed} out of {result.total} areas
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium">Errors:</div>
                  <ul className="text-xs list-disc list-inside">
                    {result.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {result && result.results && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Successfully Updated Areas:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {result.results.map((item: any, index: number) => (
                <Badge key={index} variant="outline" className="justify-center">
                  {item.area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Note: You need to set the OPENWEATHER_API_KEY environment variable to fetch real data. Get your free API key
          from{" "}
          <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline">
            OpenWeatherMap
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
