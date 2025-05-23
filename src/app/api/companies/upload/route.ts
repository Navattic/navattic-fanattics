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

    const { url, companyName } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // 1. Download image as buffer
    const imageRes = await fetch(url)
    if (!imageRes.ok) {
      throw new Error('Failed to fetch image from URL')
    }

    // For Brandfetch URLs, we know it's always PNG
    let contentType = url.includes('brandfetch.io')
      ? 'image/png'
      : imageRes.headers.get('content-type') || 'image/png'

    // Ensure contentType is one of our allowed types
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(contentType)) {
      contentType = 'image/png' // Default to PNG if not in allowed types
    }

    const imageBuffer = await imageRes.arrayBuffer()

    // 2. Prepare native FormData
    const formData = new FormData()
    formData.append(
      'file',
      new Blob([imageBuffer], { type: contentType }),
      `company-logo.${contentType.split('/')[1]}`,
    )
    formData.append(
      '_payload',
      JSON.stringify({
        alt: `${companyName || 'Company'} logo`,
      }),
    )

    // 3. Upload to Payload's REST API
    const uploadedLogo = await payload.create({
      collection: 'company-logos',
      data: {
        alt: `${companyName || 'Company'} logo`,
        // @ts-ignore
        url: url,
      },
      file: {
        data: Buffer.from(imageBuffer),
        mimetype: contentType,
        name: `company-logo.${contentType.split('/')[1]}`,
        size: imageBuffer.byteLength,
      },
    })

    return NextResponse.json({
      // @ts-ignore
      url: uploadedLogo.url,
      id: uploadedLogo.id,
    })
  } catch (error) {
    console.error('[Upload Company Logo] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload company logo',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
