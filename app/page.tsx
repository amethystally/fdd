"use client"

import { useState, useEffect } from "react"
import { EmailFetcher } from "@/components/email-fetcher"
import { ThemeToggle } from "./theme-toggle"

export default function Home() {
  const [isStatic, setIsStatic] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkApiAvailability = async () => {
      if (typeof window !== "undefined" && window.ENV_IS_STATIC === "true") {
        console.log("Static mode detected via environment variable")
        setIsStatic(true)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/direct?email=test@example.com", {
          method: "GET",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        })
        setIsStatic(false)
      } catch (error) {
        console.log("API routes not available, using static mode")
        setIsStatic(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkApiAvailability()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-zinc-900">
      <ThemeToggle />
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <EmailFetcher isUsername={true} />
            <EmailFetcher />
          </>
        )}
        <p className="col-span-full text-center text-sm text-gray-500 dark:text-zinc-500 mt-4">
          This tool helps identify the region of TikTok accounts based on their username or email address.
          {isStatic && " (Running in static mode)"}
        </p>
      </div>
    </main>
  )
}