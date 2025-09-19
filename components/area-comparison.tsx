import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAQICategory } from "@/lib/types/air-quality"
import { MapPin, Award, AlertTriangle } from "lucide-react"

interface AreaComparisonProps {
  data: any
}

export function AreaComparison({ data }: AreaComparisonProps) {
  if (!data || !data.areas) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-slate-500 dark:text-slate-400">No comparison data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Area Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Area Rankings by Air Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.areas.slice(0, 10).map((area: any, index: number) => {
              const aqiCategory = area.aqi ? getAQICategory(area.aqi) : null
              const isTop3 = index < 3
              const isBottom3 = index >= data.areas.length - 3

              return (
                <div
                  key={area.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isTop3
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20"
                      : isBottom3
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20"
                        : "bg-slate-50 border-slate-200 dark:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isTop3
                          ? "bg-green-500 text-white"
                          : isBottom3
                            ? "bg-red-500 text-white"
                            : "bg-slate-500 text-white"
                      }`}
                    >
                      {area.rank}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {area.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{area.district}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{area.aqi || "N/A"}</div>
                    {aqiCategory && (
                      <Badge variant="outline" className={`text-white bg-${aqiCategory.color}-500`}>
                        {aqiCategory.label}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* District Patterns */}
      {data.correlations && data.correlations.district_patterns && (
        <Card>
          <CardHeader>
            <CardTitle>District-wise Air Quality Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(data.correlations.district_patterns).map(([district, avgAqi]: [string, any]) => {
                const aqiCategory = getAQICategory(avgAqi)
                return (
                  <div key={district} className="p-4 border rounded-lg text-center">
                    <div className="font-medium">{district}</div>
                    <div className="text-2xl font-bold mt-2">{avgAqi}</div>
                    <Badge variant="outline" className={`mt-2 text-white bg-${aqiCategory.color}-500`}>
                      {aqiCategory.label}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Area-specific Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm">{recommendation}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
