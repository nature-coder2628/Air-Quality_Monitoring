import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Wind, Clock, MapPin } from "lucide-react"

interface AnalyticsInsightsProps {
  cityWideData: any
  comparisonData: any
}

export function AnalyticsInsights({ cityWideData, comparisonData }: AnalyticsInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Health Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Health & Safety Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Best Times for Outdoor Activities
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Early Morning (5-7 AM)</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Best
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Late Evening (9-11 PM)</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Good
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Morning Rush (7-10 AM)</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    Avoid
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Evening Rush (6-9 PM)</span>
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    Avoid
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Weather-based Tips
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div>• Higher wind speeds (>5 m/s) generally improve air quality</div>
                <div>• High humidity can trap pollutants - consider indoor activities</div>
                <div>• Rainy days naturally cleanse the air</div>
                <div>• Temperature inversions in winter can worsen pollution</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Area-specific Insights */}
      {comparisonData && comparisonData.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location-based Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm">{recommendation}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Protective Measures */}
      <Card>
        <CardHeader>
          <CardTitle>Protective Measures by AQI Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <Badge className="bg-green-500 text-white mb-2">Good (0-50)</Badge>
                <div className="text-sm space-y-1">
                  <div>• No restrictions</div>
                  <div>• Perfect for all outdoor activities</div>
                  <div>• Windows can be kept open</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <Badge className="bg-yellow-500 text-white mb-2">Moderate (51-100)</Badge>
                <div className="text-sm space-y-1">
                  <div>• Generally safe for most people</div>
                  <div>• Sensitive individuals may experience minor issues</div>
                  <div>• Normal outdoor activities OK</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <Badge className="bg-orange-500 text-white mb-2">Unhealthy for Sensitive (101-150)</Badge>
                <div className="text-sm space-y-1">
                  <div>• Sensitive groups should limit outdoor activities</div>
                  <div>• Consider wearing masks outdoors</div>
                  <div>• Keep windows closed</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <Badge className="bg-red-500 text-white mb-2">Unhealthy (151-200)</Badge>
                <div className="text-sm space-y-1">
                  <div>• Everyone should limit outdoor activities</div>
                  <div>• Wear N95 masks when outside</div>
                  <div>• Use air purifiers indoors</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <Badge className="bg-purple-500 text-white mb-2">Very Unhealthy (201-300)</Badge>
                <div className="text-sm space-y-1">
                  <div>• Avoid all outdoor activities</div>
                  <div>• Stay indoors with air purification</div>
                  <div>• Seek medical attention if experiencing symptoms</div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <Badge className="bg-red-800 text-white mb-2">Hazardous (301+)</Badge>
                <div className="text-sm space-y-1">
                  <div>• Emergency conditions</div>
                  <div>• Stay indoors at all times</div>
                  <div>• Consider evacuation if possible</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
