import type { OpenWeatherAirPollution, OpenWeatherCurrent } from "@/lib/types/air-quality"

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const BASE_URL = "https://api.openweathermap.org"

if (!OPENWEATHER_API_KEY) {
  console.warn("OPENWEATHER_API_KEY environment variable is not set")
}

export class OpenWeatherService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || OPENWEATHER_API_KEY || ""
  }

  /**
   * Fetch current weather data for a location
   */
  async getCurrentWeather(lat: number, lon: number): Promise<OpenWeatherCurrent | null> {
    if (!this.apiKey) {
      console.error("OpenWeather API key is required")
      return null
    }

    try {
      const response = await fetch(
        `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`,
      )

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching current weather:", error)
      return null
    }
  }

  /**
   * Fetch air pollution data for a location
   */
  async getAirPollution(lat: number, lon: number): Promise<OpenWeatherAirPollution | null> {
    if (!this.apiKey) {
      console.error("OpenWeather API key is required")
      return null
    }

    try {
      const response = await fetch(`${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${this.apiKey}`)

      if (!response.ok) {
        throw new Error(`OpenWeather Air Pollution API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching air pollution data:", error)
      return null
    }
  }

  /**
   * Fetch historical air pollution data
   */
  async getHistoricalAirPollution(
    lat: number,
    lon: number,
    start: number,
    end: number,
  ): Promise<OpenWeatherAirPollution | null> {
    if (!this.apiKey) {
      console.error("OpenWeather API key is required")
      return null
    }

    try {
      const response = await fetch(
        `${BASE_URL}/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${this.apiKey}`,
      )

      if (!response.ok) {
        throw new Error(`OpenWeather Historical API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching historical air pollution data:", error)
      return null
    }
  }

  /**
   * Convert OpenWeather AQI (1-5) to US EPA AQI (0-500)
   */
  convertAQI(openWeatherAQI: number): number {
    // OpenWeather uses a 1-5 scale, convert to approximate US EPA scale
    const aqiMap: Record<number, number> = {
      1: 25, // Good (0-50)
      2: 75, // Fair (51-100)
      3: 125, // Moderate (101-150)
      4: 175, // Poor (151-200)
      5: 250, // Very Poor (201-300)
    }
    return aqiMap[openWeatherAQI] || 0
  }
}

// Singleton instance
export const openWeatherService = new OpenWeatherService()
