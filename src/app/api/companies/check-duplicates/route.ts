import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'
import { payload } from '@/lib/payloadClient'

export async function POST(request: Request) {
  try {
    const { name, website } = await request.json()

    if (!name || name.trim().length < 3) {
      return NextResponse.json({ duplicates: [] })
    }

    const trimmedName = name.trim()
    const trimmedWebsite = website?.trim()

    // Build more precise query conditions
    const orConditions = []

    // Exact name match (case insensitive)
    orConditions.push({
      name: {
        equals: trimmedName,
      },
    })

    // If website is provided, check for exact domain match
    if (trimmedWebsite) {
      // Extract domain from website
      const domain = extractDomainFromUrl(trimmedWebsite)
      if (domain) {
        orConditions.push({
          website: {
            contains: domain,
          },
        })
      }
    }

    const duplicates = await payload.find({
      collection: 'companies',
      where: {
        or: orConditions,
      },
      limit: 5, // Limit results for performance
      select: {
        id: true,
        name: true,
        website: true,
      },
    })

    // Determine match type for each duplicate
    const duplicatesWithMatchType = duplicates.docs.map((company) => {
      let matchType: 'name' | 'website' | 'both' = 'name'

      const nameMatches = company.name.toLowerCase() === trimmedName.toLowerCase()
      const websiteMatches =
        trimmedWebsite &&
        company.website &&
        extractDomainFromUrl(company.website) === extractDomainFromUrl(trimmedWebsite)

      if (nameMatches && websiteMatches) {
        matchType = 'both'
      } else if (websiteMatches) {
        matchType = 'website'
      }

      return {
        id: company.id,
        name: company.name,
        website: company.website,
        matchType,
      }
    })

    return NextResponse.json({
      duplicates: duplicatesWithMatchType,
    })
  } catch (error) {
    console.error('[API] Error checking duplicates:', error)
    return NextResponse.json({ error: 'Failed to check duplicates' }, { status: 500 })
  }
}

// Helper function to extract domain from URL
function extractDomainFromUrl(url: string): string | null {
  try {
    let processedUrl = url.trim()
    if (!processedUrl.match(/^https?:\/\//)) {
      processedUrl = `https://${processedUrl}`
    }
    const urlObj = new URL(processedUrl)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}
