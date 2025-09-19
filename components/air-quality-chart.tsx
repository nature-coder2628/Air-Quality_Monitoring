"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { createClient } from "@/lib/supabase/client"
import type { AirQualityReading } from "@/lib/types/air-quality"
import { TrendingUp } from "lucide-react"

interface AirQualityChartProps {
  areaId: string
  showExtended?: boolean
}

export function AirQualityChart({ areaId, showExtended = false }: AirQualityChartProps) {
  const [data, setData] = useState<AirQualityReading[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (areaId) {
      loadChartData()
    }
  }, [areaId, showExtended])

  const loadChartData = async () => {
    try {
      setIsLoading(true)
      const hoursBack = showExtended ? 168 : 24 // 7 days vs 24 hours
      const interval = showExtended ? "1 hour" : "1 hour"

      const { data, error } = await supabase
        .from("air_quality_readings")
        .select("*")
        .eq("area_id", areaId)
        .gte("timestamp", new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: true })

      if (error) throw error

      setData(data || [])
    } catch (error) {
      console.error("Error loading chart data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = data.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      ...(showExtended && { month: "short", day: "numeric" }),
    }),
    aqi: reading.aqi,
    pm25: reading.pm25,
    pm10: reading.pm10,
    temperature: reading.temperature,
  }))

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {showExtended ? "7-Day Trends" : "24-Hour Trends"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-slate-500 dark:text-slate-400">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {showExtended ? "7-Day Trends" : "24-Hour Trends"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" fontSize={12} tick={{ fill: "currentColor" }} />
              <YAxis fontSize={12} tick={{ fill: "currentColor" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2} name="AQI" dot={false} />
              <Line type="monotone" dataKey="pm25" stroke="#f97316" strokeWidth={2} name="PM2.5 (µg/m³)" dot={false} />
              <Line type="monotone" dataKey="pm10" stroke="#eab308" strokeWidth={2} name="PM10 (µg/m³)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
