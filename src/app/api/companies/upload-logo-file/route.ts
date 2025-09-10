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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Please upload PNG, JPG, JPEG, or SVG files only.',
        },
        { status: 400 },
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'File too large. Maximum size is 5MB.',
        },
        { status: 400 },
      )
    }

    // Upload to media collection
    const uploadedFile = await payload.create({
      collection: 'media',
      data: {
        alt: 'Company logo',
      },
      // @ts-ignore - Payload handles File objects
      file,
    })

    // Create company logo record
    const companyLogo = await payload.create({
      collection: 'company-logos',
      data: {
        alt: 'Company logo',
        uploadedLogo: uploadedFile.id,
      },
    })

    return NextResponse.json({
      logoId: companyLogo.id,
      mediaId: uploadedFile.id,
      url: uploadedFile.url,
    })
  } catch (error) {
    console.error('[Companies] Error uploading logo file:', error)
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 })
  }
}