import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { payload } from '@/lib/payloadClient'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, website, logoSrc } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    console.log(
      `[CompaniesCreate] Creating company: ${name}, Website: ${website || '(none)'}, Logo: ${logoSrc || '(none)'}`,
    )

    // Check if company already exists
    const existingCompanies = await payload.find({
      collection: 'companies',
      where: {
        name: {
          equals: name,
        },
      },
    })

    if (existingCompanies.docs.length > 0) {
      console.log(`[CompaniesCreate] Company ${name} already exists, returning existing company`)
      return NextResponse.json({ company: existingCompanies.docs[0], isNew: false })
    }

    // Generate a fallback logo URL if website is provided but no logo
    let finalLogoSrc = logoSrc
    if (!logoSrc && website) {
      try {
        // Extract domain from website
        const url = new URL(website)
        const domain = url.hostname
        console.log(`[CompaniesCreate] Extracted domain from website: ${domain}`)

        // Generate random ID for cache-busting
        const randomId = Math.random().toString(36).substring(2, 15)
        finalLogoSrc = `https://cdn.brandfetch.io/${domain}/w/48/h/42/symbol?c=${randomId}`
        console.log(`[CompaniesCreate] Generated fallback logo URL: ${finalLogoSrc}`)
      } catch (error) {
        console.error(`[CompaniesCreate] Error generating fallback logo URL:`, error)
      }
    }

    // Create new company
    const newCompany = await payload.create({
      collection: 'companies',
      data: {
        name,
        website,
        logoSrc: finalLogoSrc,
      },
    })

    console.log(`[CompaniesCreate] Created new company:`, newCompany)
    return NextResponse.json({ company: newCompany, isNew: true })
  } catch (error) {
    console.error('[CompaniesCreate] Error creating company:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
