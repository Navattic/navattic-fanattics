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

    const { name, website, logoSrc } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    // Get user ID from Payload first
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session.user.email,
        },
      },
    })

    if (!users.docs.length) {
      console.error('[Companies] User not found:', session.user.email)
      return NextResponse.json(
        { error: 'User not found when trying to create company' },
        { status: 404 },
      )
    }

    const userId = users.docs[0].id
    console.log('[Companies] Found user ID:', userId)

    // Check if company already exists
    const existingCompanies = await payload.find({
      collection: 'companies',
      where: {
        name: {
          equals: name,
        },
      },
    })

    console.log('[Companies] Search results:', {
      query: name,
      found: existingCompanies.docs.length,
      companies: existingCompanies.docs.map((c) => ({ id: c.id, name: c.name })),
    })

    if (existingCompanies.docs.length > 0) {
      // For existing company, just update the user's profile
      const existingCompany = existingCompanies.docs[0]
      await payload.update({
        collection: 'users',
        id: userId,
        data: {
          company: existingCompany.id,
        },
      })
      console.log('[Companies] Updated user profile with existing company reference')

      return NextResponse.json({
        company: existingCompany,
        isNew: false,
      })
    }

    // Create a new company logo record if a logo URL is provided
    let logoId = null
    if (logoSrc) {
      const logo = await payload.create({
        collection: 'company-logos',
        data: {
          defaultUrl: logoSrc,
          alt: `${name} logo`,
        },
      })
      logoId = logo.id
      console.log('[Companies] Created logo record:', logoId)
    }

    // Create the company with author only for new companies
    const company = await payload.create({
      collection: 'companies',
      data: {
        name,
        website,
        logoSrc: logoId,
        author: userId, // Only set author for new companies
      },
    })
    console.log('[Companies] Created new company:', {
      id: company.id,
      name: company.name,
      author: userId,
    })

    // Update the user's profile with the company reference
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        company: company.id,
      },
    })
    console.log('[Companies] Updated user profile with new company reference')

    return NextResponse.json({
      company,
      isNew: true,
    })
  } catch (error) {
    console.error('[Companies] Error creating company:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
