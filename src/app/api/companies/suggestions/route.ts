import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { payload } from '@/lib/payloadClient'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const domain = url.searchParams.get('domain')

    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter is required' }, { status: 400 })
    }

    console.log(`[Companies] Fetching suggestions for domain: ${domain}`)

    // Find companies with websites that match the email domain
    const companies = await payload.find({
      collection: 'companies',
      where: {
        website: {
          contains: domain,
        },
      },
      limit: 3, // Limit to top 3 suggestions
      sort: '-createdAt', // Most recent first
    })

    // Filter for exact domain matches to avoid false positives
    const exactMatches = companies.docs.filter((company) => {
      if (!company.website) return false

      try {
        const companyDomain = extractDomain(company.website)
        return companyDomain === domain
      } catch {
        return false
      }
    })

    console.log(`[Companies] Found ${exactMatches.length} domain matches for ${domain}`)

    return NextResponse.json({ companies: exactMatches })
  } catch (error) {
    console.error('[Companies] Error fetching suggestions:', error)
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 })
  }
}

function extractDomain(url: string): string | null {
  try {
    // Handle URLs that might not have protocol
    let processedUrl = url.trim()

    // If URL doesn't start with http/https, add https://
    if (!processedUrl.match(/^https?:\/\//)) {
      processedUrl = `https://${processedUrl}`
    }

    const urlObj = new URL(processedUrl)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
