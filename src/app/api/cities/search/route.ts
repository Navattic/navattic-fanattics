import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const name = url.searchParams.get('name')

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
    }

    const apiKey = process.env.API_NINJAS_CITY_KEY
    if (!apiKey) {
      console.error('[Cities] API_NINJAS_CITY_KEY environment variable is not set')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    console.log(`[Cities] Searching for cities with name: ${name}`)

    const response = await fetch(
      `https://api.api-ninjas.com/v1/city?name=${encodeURIComponent(name)}`,
      {
        headers: {
          'X-Api-Key': apiKey,
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Cities] API request failed: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `API request failed: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    const cities = Array.isArray(data) ? data : []

    // Limit results to 10 on our end since we can't use the API limit parameter
    const limitedCities = cities.slice(0, 10)

    console.log(`[Cities] Found ${cities.length} cities, returning ${limitedCities.length}`)

    return NextResponse.json({ cities: limitedCities })
  } catch (error) {
    console.error('[Cities] Error fetching cities:', error)
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}
