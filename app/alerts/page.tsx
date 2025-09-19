import { AlertsCenter } from "@/components/alerts-center"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bell, Wind, Activity } from "lucide-react"

export default function AlertsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Environmental Alerts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Real-time notifications and warnings for air quality conditions
          </p>
        </div>
      </div>

      {/* Alert Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Health Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Critical air quality conditions that may affect health
            </p>
            <Badge variant="destructive" className="mt-2 text-xs">
              High Priority
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-orange-500" />
              Pollutant Spikes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Sudden increases in specific pollutant concentrations
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              Medium Priority
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wind className="h-4 w-4 text-blue-500" />
              Weather Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Weather conditions affecting air quality dispersion
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              Low Priority
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4 text-purple-500" />
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              ML-based forecasts of upcoming air quality changes
            </p>
            <Badge variant="outline" className="mt-2 text-xs">
              Informational
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Main Alerts Center */}
      <AlertsCenter />

      {/* Alert Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Severity Levels</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500 text-white">CRITICAL</Badge>
                  <span className="text-sm">Immediate action required</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-orange-500 text-white">HIGH</Badge>
                  <span className="text-sm">Significant health risk</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-yellow-500 text-white">MEDIUM</Badge>
                  <span className="text-sm">Moderate concern</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500 text-white">LOW</Badge>
                  <span className="text-sm">Informational</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Response Actions</h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div>
                  • <strong>Critical:</strong> Stay indoors, avoid all outdoor activities
                </div>
                <div>
                  • <strong>High:</strong> Limit outdoor exposure, wear protective masks
                </div>
                <div>
                  • <strong>Medium:</strong> Reduce strenuous outdoor activities
                </div>
                <div>
                  • <strong>Low:</strong> Monitor conditions, take precautions if sensitive
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
