import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AirQualityReading } from "@/lib/types/air-quality"
import { Thermometer, Droplets, Wind, Eye } from "lucide-react"

interface WeatherWidgetProps {
  reading: AirQualityReading | null
}

export function WeatherWidget({ reading }: WeatherWidgetProps) {
  if (!reading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400">No data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Temperature</span>
            </div>
            <span className="text-sm font-medium">{reading.temperature?.toFixed(1) || "N/A"}°C</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Humidity</span>
            </div>
            <span className="text-sm font-medium">{reading.humidity || "N/A"}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-500" />
              <span className="text-sm">Wind</span>
            </div>
            <span className="text-sm font-medium">{reading.wind_speed?.toFixed(1) || "N/A"} m/s</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Visibility</span>
            </div>
            <span className="text-sm font-medium">{reading.visibility?.toFixed(1) || "N/A"} km</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
