import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'
import { payload } from '@/lib/payloadClient'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, website, logoData } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    // Get user ID from Payload
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session.user.email,
        },
      },
    })

    if (!users.docs.length) {
      return NextResponse.json(
        { error: 'User not found when trying to create company' },
        { status: 404 },
      )
    }

    const userId = users.docs[0].id

    // Check if company already exists (exact name match or same domain)
    const existingCompanies = await payload.find({
      collection: 'companies',
      where: {
        or: [
          {
            name: {
              equals: name.trim(),
            },
          },
          ...(website
            ? [
                {
                  website: {
                    contains: extractDomain(website),
                  },
                },
              ]
            : []),
        ],
      },
    })

    // Filter for exact matches
    const exactMatch = existingCompanies.docs.find((company) => {
      const isNameMatch = company.name.toLowerCase().trim() === name.toLowerCase().trim()
      const isDomainMatch =
        website && company.website && extractDomain(company.website) === extractDomain(website)
      return isNameMatch || isDomainMatch
    })

    if (exactMatch) {
      // Update user's company reference
      await payload.update({
        collection: 'users',
        id: userId,
        data: {
          company: exactMatch.id,
        },
      })

      return NextResponse.json({
        company: exactMatch,
        isNew: false,
      })
    }

    // Create company logo record if logo data is provided
    let logoId = null
    if (logoData) {
      const logo = await payload.create({
        collection: 'company-logos',
        data: {
          alt: `${name} logo`,
          ...logoData,
        },
      })
      logoId = logo.id
    }

    // Create the company
    const company = await payload.create({
      collection: 'companies',
      data: {
        name: name.trim(),
        website: website?.trim() || null,
        logoSrc: logoId,
        author: userId,
      },
    })

    // Update the user's profile with the company reference
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        company: company.id,
      },
    })

    return NextResponse.json({
      company,
      isNew: true,
    })
  } catch (error) {
    console.error('[Companies] Error creating company:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}

function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return null
  }
}
