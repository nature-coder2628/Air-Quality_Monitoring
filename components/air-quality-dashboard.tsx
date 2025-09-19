"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AirQualityMap } from "@/components/air-quality-map"
import { AirQualityChart } from "@/components/air-quality-chart"
import { PollutantBreakdown } from "@/components/pollutant-breakdown"
import { WeatherWidget } from "@/components/weather-widget"
import { AlertsPanel } from "@/components/alerts-panel"
import { PredictionsPanel } from "@/components/predictions-panel"
import { AlertNotifications } from "@/components/alert-notifications"
import { createClient } from "@/lib/supabase/client"
import { type Area, type AirQualityReading, getAQICategory } from "@/lib/types/air-quality"
import { RefreshCw, MapPin, TrendingUp, AlertTriangle } from "lucide-react"

export function AirQualityDashboard() {
  const [areas, setAreas] = useState<Area[]>([])
  const [selectedArea, setSelectedArea] = useState<string>("")
  const [currentReading, setCurrentReading] = useState<AirQualityReading | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const supabase = createClient()

  useEffect(() => {
    loadAreas()
  }, [])

  useEffect(() => {
    if (selectedArea) {
      loadCurrentReading(selectedArea)
    }
  }, [selectedArea])

  const loadAreas = async () => {
    try {
      const { data, error } = await supabase.from("areas").select("*").order("name")

      if (error) throw error

      setAreas(data || [])
      if (data && data.length > 0 && !selectedArea) {
        setSelectedArea(data[0].id)
      }
    } catch (error) {
      console.error("Error loading areas:", error)
    }
  }

  const loadCurrentReading = async (areaId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("air_quality_readings")
        .select(`
          *,
          area:areas(*)
        `)
        .eq("area_id", areaId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") throw error

      setCurrentReading(data || null)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading current reading:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    if (selectedArea) {
      loadCurrentReading(selectedArea)
    }
  }

  const selectedAreaData = areas.find((area) => area.id === selectedArea)
  const aqiCategory = currentReading?.aqi ? getAQICategory(currentReading.aqi) : null

  return (
    <div className="space-y-6">
      <AlertNotifications />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select an area" />
            </SelectTrigger>
            <SelectContent>
              {areas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {area.name} ({area.district})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Current AQI Overview */}
      {currentReading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Air Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                    {currentReading.aqi || "N/A"}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">AQI</div>
                </div>
                {aqiCategory && (
                  <div className="flex-1">
                    <Badge variant="secondary" className={`text-white bg-${aqiCategory.color}-500`}>
                      {aqiCategory.label}
                    </Badge>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {selectedAreaData?.name}, {selectedAreaData?.district}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <WeatherWidget reading={currentReading} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">PM2.5</span>
                  <span className="text-sm font-medium">{currentReading.pm25?.toFixed(1) || "N/A"} µg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">PM10</span>
                  <span className="text-sm font-medium">{currentReading.pm10?.toFixed(1) || "N/A"} µg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">NO₂</span>
                  <span className="text-sm font-medium">{currentReading.no2?.toFixed(1) || "N/A"} µg/m³</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PollutantBreakdown reading={currentReading} />
            <AirQualityChart areaId={selectedArea} />
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <AirQualityMap areas={areas} selectedArea={selectedArea} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <AirQualityChart areaId={selectedArea} showExtended={true} />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <PredictionsPanel areaId={selectedArea} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel areaId={selectedArea} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
