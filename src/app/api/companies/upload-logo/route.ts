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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const companyId = formData.get('companyId') as string

    if (!file || !companyId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload the file to Payload
    const uploadedFile = await payload.create({
      collection: 'media',
      data: {
        alt: 'Company logo',
      },
      // @ts-ignore
      file,
    })

    // Update the company with the uploaded logo
    const company = await payload.update({
      collection: 'companies',
      id: companyId,
      data: {
        logoSrc: {
          uploadedLogo: uploadedFile.id,
        },
      },
    })

    return NextResponse.json({ company })
  } catch (error) {
    console.error('[Companies] Error uploading logo:', error)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }
}
