"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CityWideOverview } from "@/components/citywide-overview"
import { AreaComparison } from "@/components/area-comparison"
import { AnalyticsInsights } from "@/components/analytics-insights"
import { BarChart3, TrendingUp, MapPin } from "lucide-react"

export function AnalyticsDashboard() {
  const [cityWideData, setCityWideData] = useState<any>(null)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)

      const [cityWideResponse, comparisonResponse] = await Promise.all([
        fetch("/api/analytics/citywide"),
        fetch("/api/analytics/comparison"),
      ])

      const [cityWideResult, comparisonResult] = await Promise.all([cityWideResponse.json(), comparisonResponse.json()])

      if (cityWideResult.success) {
        setCityWideData(cityWideResult.analytics)
      }

      if (comparisonResult.success) {
        setComparisonData(comparisonResult.analytics)
      }
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      {cityWideData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">City Average AQI</p>
                  <p className="text-2xl font-bold">{cityWideData.overview.avg_aqi}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Areas Monitored</p>
                  <p className="text-2xl font-bold">{cityWideData.overview.areas_monitored}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Best Area</p>
                  <p className="text-lg font-bold text-green-600">{cityWideData.overview.best_area}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Worst Area</p>
                  <p className="text-lg font-bold text-red-600">{cityWideData.overview.worst_area}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500 rotate-180" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AQI Distribution */}
      {cityWideData && (
        <Card>
          <CardHeader>
            <CardTitle>Air Quality Distribution Across Bengaluru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{cityWideData.distribution.good}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Good</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    0-50
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{cityWideData.distribution.moderate}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Moderate</div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    51-100
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {cityWideData.distribution.unhealthy_sensitive}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Unhealthy for Sensitive</div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    101-150
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{cityWideData.distribution.unhealthy}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Unhealthy</div>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    151-200
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{cityWideData.distribution.very_unhealthy}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Very Unhealthy</div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    201-300
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-800">{cityWideData.distribution.hazardous}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Hazardous</div>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    301+
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">City Overview</TabsTrigger>
          <TabsTrigger value="comparison">Area Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights & Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CityWideOverview data={cityWideData} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <AreaComparison data={comparisonData} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {cityWideData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  24-Hour Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{cityWideData.trends.improving_areas}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Areas Improving</div>
                    <Progress
                      value={(cityWideData.trends.improving_areas / cityWideData.overview.areas_monitored) * 100}
                      className="mt-2"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{cityWideData.trends.worsening_areas}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Areas Worsening</div>
                    <Progress
                      value={(cityWideData.trends.worsening_areas / cityWideData.overview.areas_monitored) * 100}
                      className="mt-2"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-600">{cityWideData.trends.stable_areas}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Areas Stable</div>
                    <Progress
                      value={(cityWideData.trends.stable_areas / cityWideData.overview.areas_monitored) * 100}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AnalyticsInsights cityWideData={cityWideData} comparisonData={comparisonData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
