"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Area } from "@/lib/types/air-quality"
import { Map } from "lucide-react"

interface AirQualityMapProps {
  areas: Area[]
  selectedArea: string
}

export function AirQualityMap({ areas, selectedArea }: AirQualityMapProps) {
  // This is a placeholder for the map component
  // In a real implementation, you would integrate with a mapping library like Leaflet or Google Maps

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Bengaluru Air Quality Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <Map className="h-12 w-12 mx-auto text-slate-400" />
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Interactive Map Coming Soon</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Real-time air quality visualization across Bengaluru areas
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
              {areas.slice(0, 8).map((area) => (
                <div
                  key={area.id}
                  className={`p-2 rounded text-xs text-center border ${
                    area.id === selectedArea
                      ? "bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700"
                      : "bg-white border-slate-200 dark:bg-slate-700 dark:border-slate-600"
                  }`}
                >
                  <div className="font-medium">{area.name}</div>
                  <div className="text-slate-500 dark:text-slate-400">{area.district}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
