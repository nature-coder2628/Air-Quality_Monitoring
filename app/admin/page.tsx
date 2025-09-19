import { DataFetcher } from "@/components/data-fetcher"
import { MLPredictor } from "@/components/ml-predictor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Settings, Database, Activity, Brain } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  // Get areas for ML predictor
  const { data: areas } = await supabase.from("areas").select("id, name, district").order("name")

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage air quality data collection, ML predictions, and system settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Data Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DataFetcher />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Areas Configured</span>
                    <span className="text-sm font-medium">{areas?.length || 0} locations</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ML Model Version</span>
                    <span className="text-sm font-medium">v1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prediction Engine</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ML Prediction Management */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Machine Learning Predictions
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Generate AI-powered air quality forecasts using advanced ensemble models
              </p>
            </div>

            <MLPredictor areas={areas || []} />
          </div>

          {/* System Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OpenWeather API</span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Setup Required</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ML Engine</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alerts System</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    • Fetch latest air quality data from OpenWeather
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    • Generate ML predictions for all areas
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    • Set up automated data collection schedule
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    • Configure environmental alert thresholds
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
