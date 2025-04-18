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

    if (!apiKey) {
      console.warn('[Brandfetch] API key not configured. Using fallback method.')
      // Create a fallback based on the company name
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`,
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

    if (!searchResponse.ok) {
      console.error(`[Brandfetch] Search error: ${searchResponse.status}`)
      // Use UI Avatars as a fallback
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`,
          website: null,
        },
      })
    }

    const searchData = await searchResponse.json()
    console.log(`[Brandfetch] Search results:`, JSON.stringify(searchData, null, 2))

    if (!searchData.length) {
      console.log(`[Brandfetch] No results found for ${companyName}`)
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`,
          website: null,
        },
      })
    }

    // Get the domain of the first result
    const domain = searchData[0].domain

    if (!domain) {
      console.log(`[Brandfetch] No domain found in search results`)
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`,
          website: null,
        },
      })
    }

    // Use UI Avatars as a more reliable fallback instead of Brandfetch CDN
    const fallbackLogoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`

    console.log(`[Brandfetch] Domain: ${domain}, Fallback logo URL: ${fallbackLogoUrl}`)

    // Then, fetch the brand data using the domain
    const brandUrl = `https://api.brandfetch.io/v2/brands/${domain}`

    console.log(`[Brandfetch] Brand request URL: ${brandUrl}`)

    const brandResponse = await fetch(brandUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!brandResponse.ok) {
      console.warn(`[Brandfetch] Brand fetch error: ${brandResponse.status}, using fallback logo`)
      return NextResponse.json({
        data: {
          name: companyName,
          logoSrc: fallbackLogoUrl,
          website: `https://${domain}`,
        },
      })
    }

    const brandData = await brandResponse.json()
    console.log(`[Brandfetch] Brand data:`, JSON.stringify(brandData, null, 2))

    // Extract the logo and website
    let logo = null

    if (brandData.logos && brandData.logos.length > 0) {
      // First try to get a PNG logo
      const pngLogo = brandData.logos
        .find((l: BrandfetchLogo) => l.type === 'logo')
        ?.formats?.find((f: BrandfetchLogoFormat) => f.format === 'png')

      // If no PNG, try to get any logo
      if (pngLogo && pngLogo.src) {
        logo = pngLogo.src
      } else if (brandData.logos[0].formats && brandData.logos[0].formats.length > 0) {
        logo = brandData.logos[0].formats[0].src
      }
    }

    const website =
      brandData.links?.find((l: BrandfetchLink) => l.type === 'website')?.url || `https://${domain}`

    console.log(`[Brandfetch] Extracted logo URL: ${logo || '(none)'}`)
    console.log(`[Brandfetch] Using logo URL: ${logo || fallbackLogoUrl}`)

    return NextResponse.json({
      data: {
        name: brandData.name || companyName,
        logoSrc: logo || fallbackLogoUrl,
        website: website || `https://${domain}`,
      },
    })
  } catch (error) {
    console.error('[Brandfetch] Error fetching from Brandfetch:', error)
    // Use UI Avatars as a fallback in case of error
    const companyName = new URL(req.url).searchParams.get('name') || 'Unknown'
    return NextResponse.json({
      data: {
        name: companyName,
        logoSrc: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`,
        website: null,
      },
    })
  }
}
