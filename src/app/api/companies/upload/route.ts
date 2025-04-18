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

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create a proper file object that Payload expects
    const fileData = {
      data: buffer,
      mimetype: file.type,
      name: file.name,
      size: file.size,
    }

    // Upload to Payload
    const uploadedLogo = await payload.create({
      collection: 'company-logos',
      data: {
        alt: file.name,
      },
      file: fileData,
    })

    return NextResponse.json({
      url: uploadedLogo.url,
      id: uploadedLogo.id,
    })
  } catch (error) {
    console.error('[Upload] Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
