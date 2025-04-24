// This is a Cloudflare Worker function that will be deployed to handle the API request
export async function onRequest(context) {
  // Get the username from the query parameters
  const url = new URL(context.request.url)
  const username = url.searchParams.get("username")

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }

  try {
    // Construct the URL with the username
    const targetUrl = `https://jaefu3p97g.execute-api.us-east-1.amazonaws.com/default/smttab?username=${encodeURIComponent(username)}`

    console.log(`Fetching data from: ${targetUrl}`)

    // Fetch the data with a timeout
    const controller = new AbortController()
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 15000))

    const fetchPromise = fetch(targetUrl, {
      headers: {
        Accept: "application/json, text/plain",
        "User-Agent": "Cloudflare-Worker",
      },
      cf: {
        // Disable caching
        cacheEverything: false,
        cacheTtl: 0,
      },
    })

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise])

    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`)
      return new Response(
        JSON.stringify({
          error: `Error from external API: ${response.status} ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        },
      )
    }

    // Get the content type
    const contentType = response.headers.get("content-type") || ""

    // Handle different response types
    if (contentType.includes("application/json")) {
      // If it's JSON, parse it
      const jsonData = await response.json()
      console.log("Received JSON response:", JSON.stringify(jsonData).substring(0, 200))

      // Pass through the JSON data
      return new Response(JSON.stringify(jsonData), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } else {
      // If it's not JSON, get the text
      const data = await response.text()
      console.log(`Received text response (first 200 chars): ${data.substring(0, 200)}`)

      // Try to parse it as JSON
      try {
        const jsonData = JSON.parse(data)
        return new Response(JSON.stringify(jsonData), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        })
      } catch (e) {
        // Not JSON, return as text
        return new Response(data, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        })
      }
    }
  } catch (error) {
    console.error(`Error in Cloudflare Worker: ${error.message || "Unknown error"}`)

    // Check if it's a timeout error
    if (error.message === "Request timeout") {
      return new Response(
        JSON.stringify({
          error: "Request timed out when connecting to the external API",
        }),
        {
          status: 504,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
    }

    return new Response(
      JSON.stringify({
        error: `Failed to fetch data from external API: ${error.message || "Unknown error"}`,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
}
