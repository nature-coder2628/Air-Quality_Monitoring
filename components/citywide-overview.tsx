import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"

interface CityWideOverviewProps {
  data: any
}

export function CityWideOverview({ data }: CityWideOverviewProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-slate-500 dark:text-slate-400">No data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pollution Hotspots */}
      {data.hotspots && data.hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Current Pollution Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.hotspots.map((hotspot: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{hotspot.area}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{hotspot.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{hotspot.aqi}</div>
                    <Badge variant="destructive">{hotspot.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* City Insights */}
      {data.insights && data.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm">{insight}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour City Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {data.trends.city_avg_24h_change > 0 ? (
                  <TrendingUp className="h-6 w-6 text-red-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-green-500" />
                )}
                <span className="text-2xl font-bold">
                  {data.trends.city_avg_24h_change > 0 ? "+" : ""}
                  {data.trends.city_avg_24h_change}
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Average AQI change across all areas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
