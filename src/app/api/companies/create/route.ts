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
    console.log(
      `[CompaniesCreate] Creating company with name: ${name}, website: ${website}, logoSrc: ${logoSrc}`,
    )

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    // Check if company already exists
    const existingCompanies = await payload.find({
      collection: 'companies',
      where: {
        name: {
          equals: name,
        },
      },
      depth: 1,
    })

    if (existingCompanies.docs.length > 0) {
      console.log(`[CompaniesCreate] Company ${name} already exists`)
      return NextResponse.json({
        company: existingCompanies.docs[0],
        isNew: false,
      })
    }

    // If we have a logo URL, create a logo entry with the URL
    let logoId = null
    if (logoSrc) {
      try {
        console.log(`[CompaniesCreate] Creating logo entry with URL: ${logoSrc}`)

        // Create logo entry with URL
        const uploadedLogo = await payload.create({
          collection: 'company-logos',
          data: {
            alt: `${name} logo`,
            url: logoSrc,
          },
        })

        console.log(`[CompaniesCreate] Logo entry created successfully:`, uploadedLogo)
        logoId = uploadedLogo.id
      } catch (error) {
        console.error('[CompaniesCreate] Error creating logo entry:', error)
        // Continue without logo if creation fails
      }
    }

    // Create new company with the logo relationship
    console.log(`[CompaniesCreate] Creating company with logoId: ${logoId}`)
    const newCompany = await payload.create({
      collection: 'companies',
      data: {
        name,
        website,
        logoSrc: logoId, // This creates the relationship to the logo
      },
      depth: 2, // Get nested relationships
      user: session.user,
    })

    console.log(`[CompaniesCreate] Company created successfully:`, newCompany)

    return NextResponse.json({
      company: newCompany,
      isNew: true,
    })
  } catch (error: any) {
    console.error('[CompaniesCreate] Error creating company:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to create company' },
      { status: error?.status || 500 },
    )
  }
}
