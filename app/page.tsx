import { Suspense } from "react"
import { AirQualityDashboard } from "@/components/air-quality-dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
            Bengaluru Air Quality Monitor
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-pretty">
            Real-time air quality monitoring and pollution prediction with advanced ML insights
          </p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <AirQualityDashboard />
        </Suspense>
      </div>
    </main>
  )
}
