import { Suspense } from "react"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { AnalyticsSkeleton } from "@/components/analytics-skeleton"

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 text-balance">
            Air Quality Analytics
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-pretty">
            Comprehensive insights and comparisons across Bengaluru areas
          </p>
        </div>

        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsDashboard />
        </Suspense>
      </div>
    </main>
  )
}
