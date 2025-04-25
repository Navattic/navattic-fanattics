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

    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // 1. Download image as buffer
    const imageRes = await fetch(url)
    if (!imageRes.ok) {
      throw new Error('Failed to fetch image from URL')
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await imageRes.arrayBuffer()

    // 2. Prepare native FormData
    const formData = new FormData()
    formData.append('file', new Blob([imageBuffer], { type: contentType }), 'avatar.jpg')
    formData.append(
      '_payload',
      JSON.stringify({
        alt: `${session.user.name}'s avatar`,
      }),
    )

    // 3. Upload to Payload's REST API
    const uploadedAvatar = await payload.create({
      collection: 'avatars',
      data: {
        alt: `${session.user.name}'s avatar`,
        url: url,
      },
      file: {
        data: Buffer.from(imageBuffer),
        mimetype: contentType,
        name: 'avatar.jpg',
        size: imageBuffer.byteLength,
      },
    })

    // 4. Find user
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: session.user.email } },
    })

    if (!users.docs.length) throw new Error('User not found')

    // 5. Update user avatar
    const userId = users.docs[0].id
    await payload.update({
      collection: 'users',
      id: userId,
      data: { avatar: uploadedAvatar.id },
    })

    return NextResponse.json({
      url: uploadedAvatar.url,
      id: uploadedAvatar.id,
    })
  } catch (error) {
    console.error('[Upload Avatar] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload avatar',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
