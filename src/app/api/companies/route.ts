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
    const query = url.searchParams.get('query') || ''

    console.log(`[Companies] Fetching companies with query: ${query || '(none)'}`)

    const companies = await payload.find({
      collection: 'companies',
      where: query
        ? {
            or: [
              {
                name: {
                  contains: query,
                },
              },
              {
                name: {
                  contains: query.toLowerCase(),
                },
              },
            ],
          }
        : {},
      limit: 20,
    })

    console.log(`[Companies] Found ${companies.docs.length} companies`)

    // Log each company's data to help diagnose logo issues
    companies.docs.forEach((company, index) => {
      console.log(
        `[Companies] Company ${index + 1}: Name=${company.name}, Logo=${company.logoSrc || '(none)'}`,
      )
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('[Companies] Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
