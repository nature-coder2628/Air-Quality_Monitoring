import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { AirQualityReading } from "@/lib/types/air-quality"
import { Activity } from "lucide-react"

interface PollutantBreakdownProps {
  reading: AirQualityReading | null
}

export function PollutantBreakdown({ reading }: PollutantBreakdownProps) {
  if (!reading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Pollutant Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400">No data available</div>
        </CardContent>
      </Card>
    )
  }

  const pollutants = [
    {
      name: "PM2.5",
      value: reading.pm25 || 0,
      unit: "µg/m³",
      max: 100,
      color: "bg-red-500",
      description: "Fine particulate matter",
    },
    {
      name: "PM10",
      value: reading.pm10 || 0,
      unit: "µg/m³",
      max: 150,
      color: "bg-orange-500",
      description: "Coarse particulate matter",
    },
    {
      name: "NO₂",
      value: reading.no2 || 0,
      unit: "µg/m³",
      max: 200,
      color: "bg-yellow-500",
      description: "Nitrogen dioxide",
    },
    {
      name: "SO₂",
      value: reading.so2 || 0,
      unit: "µg/m³",
      max: 350,
      color: "bg-green-500",
      description: "Sulfur dioxide",
    },
    {
      name: "CO",
      value: reading.co || 0,
      unit: "mg/m³",
      max: 30,
      color: "bg-blue-500",
      description: "Carbon monoxide",
    },
    {
      name: "O₃",
      value: reading.o3 || 0,
      unit: "µg/m³",
      max: 180,
      color: "bg-purple-500",
      description: "Ozone",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Pollutant Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pollutants.map((pollutant) => {
            const percentage = Math.min((pollutant.value / pollutant.max) * 100, 100)

            return (
              <div key={pollutant.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{pollutant.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{pollutant.description}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {pollutant.value.toFixed(1)} {pollutant.unit}
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
