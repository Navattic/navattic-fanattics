import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

type BrandfetchLogoFormat = {
  format: string
  src: string
}

type BrandfetchLogo = {
  type: string
  formats: Array<BrandfetchLogoFormat>
}

type BrandfetchLink = {
  type: string
  url: string
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const companyName = url.searchParams.get('name')

    if (!companyName) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    console.log(`[Brandfetch] Searching for company: ${companyName}`)

    // Replace this with your Brandfetch API key
    const apiKey = process.env.BRANDFETCH_API_KEY
    console.log(`[Brandfetch] API Key configured: ${!!apiKey}`)

    if (!apiKey) {
      console.warn('[Brandfetch] API key not configured.')
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: null,
          website: null,
        },
      })
    }

    // First, search for the company by name
    const searchUrl = `https://api.brandfetch.io/v2/search/${encodeURIComponent(companyName)}`

    console.log(`[Brandfetch] Search request URL: ${searchUrl}`)

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })

    console.log(`[Brandfetch] Search response status: ${searchResponse.status}`)

    if (!searchResponse.ok) {
      console.error(`[Brandfetch] Search error: ${searchResponse.status}`)
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: null,
          website: null,
        },
      })
    }

    const searchData = await searchResponse.json()
    console.log(`[Brandfetch] Raw search results:`, searchData)

    if (!searchData.length) {
      console.log(`[Brandfetch] No results found for ${companyName}`)
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: null,
          website: null,
        },
      })
    }

    // Get the domain of the first result
    const domain = searchData[0].domain
    console.log(`[Brandfetch] First result domain: ${domain}`)

    if (!domain) {
      console.log(`[Brandfetch] No domain found in search results`)
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: null,
          website: null,
        },
      })
    }

    // Generate the Brandfetch CDN URL
    const logoUrl = `https://cdn.brandfetch.io/${domain}/w/48/h/42/symbol?c=1idjh-kE7Sr91f3HSWS`
    const website = `https://${domain}`

    console.log(`[Brandfetch] Generated logo URL: ${logoUrl}`)
    console.log(`[Brandfetch] Generated website: ${website}`)

    return NextResponse.json({
      data: {
        name: searchData[0].name || companyName,
        logoSrc: logoUrl,
        website: website,
      },
    })
  } catch (error) {
    console.error('[Brandfetch] Error fetching from Brandfetch:', error)
    const searchQuery = new URL(req.url).searchParams.get('name') || 'Unknown'
    return NextResponse.json({
      data: {
        name: searchQuery,
        logoSrc: null,
        website: null,
      },
    })
  }
}
