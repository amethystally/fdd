"use client"

import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Country code to name mapping
const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  JP: "Japan",
  CN: "China",
  RU: "Russia",
  BR: "Brazil",
  IN: "India",
  MX: "Mexico",
  KR: "South Korea",
  CH: "Switzerland",
  BE: "Belgium",
}

export function EmailFetcher({ isUsername = false }: { isUsername?: boolean }) {
  const [input, setInput] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input) {
      setError(`Please enter a valid ${isUsername ? "username" : "email address"}`)
      return
    }

    if (!isUsername && !input.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/fetch-email-data?email=${encodeURIComponent(input)}&_=${timestamp}`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.text()
      
      let formattedResult = data.trim()

      if (formattedResult.toUpperCase() === "SG") {
        formattedResult = "Account doesn't exist"
      } else if (formattedResult.length === 2 && /^[A-Z]{2}$/.test(formattedResult)) {
        const countryName = countryNames[formattedResult] || "Unknown Country"
        formattedResult = `${formattedResult} (${countryName})`
      }

      setResult(formattedResult)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred while processing your request")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-black">
      <CardHeader className="space-y-4 pb-6">
        <CardTitle className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
          TikTok {isUsername ? "Username" : "Email"} Region Fetcher
        </CardTitle>
        <CardDescription className="text-sm md:text-lg text-gray-600 dark:text-zinc-400">
          Enter a TikTok {isUsername ? "username" : "email address"} to discover its region
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 md:space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-4">
            <Input
              type={isUsername ? "text" : "email"}
              placeholder={isUsername ? "@username" : "tiktok@example.com"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="h-12 md:h-14 px-4 md:px-6 text-base md:text-lg rounded-xl border-gray-200 bg-white/50 dark:border-zinc-800 dark:bg-zinc-900/50 focus:border-purple-500 focus:ring-purple-500 transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
            />
          </div>

          <Button
            type="submit"
            className="flame-button w-full h-12 md:h-14 text-base md:text-lg rounded-xl font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 relative overflow-hidden shine-effect active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 md:h-6 md:w-6 animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch Region"
            )}
            <span className="absolute top-0 left-0 w-full h-full shine-element"></span>
          </Button>
        </form>

        {error && (
          <Alert
            variant="destructive"
            className="mt-4 md:mt-6 bg-red-50/50 border-red-200/50 text-red-600 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 rounded-xl"
          >
            <AlertDescription className="text-sm md:text-base">{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-lg md:text-xl font-medium text-gray-800 dark:text-zinc-300">Region:</h3>
            <div className="p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-x-auto shadow-inner">
              <p className="font-mono text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">{result}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}