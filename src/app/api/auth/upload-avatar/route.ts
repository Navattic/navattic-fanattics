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

    const contentType = req.headers.get('content-type') || ''

    // Handle file upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      return handleFileUpload(req, session)
    }

    // Handle URL-based upload (application/json)
    if (contentType.includes('application/json')) {
      return handleUrlUpload(req, session)
    }

    return NextResponse.json(
      {
        error:
          'Unsupported content type. Use multipart/form-data for file uploads or application/json for URL uploads.',
      },
      { status: 400 },
    )
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

async function handleFileUpload(req: Request, session: any) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const alt = (formData.get('alt') as string) || 'User avatar'

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
      { status: 400 },
    )
  }

  // Validate file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: 'File size too large. Maximum size is 5MB.' },
      { status: 400 },
    )
  }

  try {
    // Upload to Payload
    const uploadedAvatar = await payload.create({
      collection: 'avatars',
      data: {
        alt,
      },
      // @ts-ignore
      file,
    })

    // Find and update user
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: session.user.email } },
    })

    if (!users.docs.length) {
      throw new Error('User not found')
    }

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
    console.error('[Upload Avatar] File upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload avatar file',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function handleUrlUpload(req: Request, session: any) {
  const { url, alt = 'User avatar' } = await req.json()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Download image as buffer
    const imageRes = await fetch(url)
    if (!imageRes.ok) {
      throw new Error('Failed to fetch image from URL')
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await imageRes.arrayBuffer()

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid image type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 },
      )
    }

    // Upload to Payload
    const uploadedAvatar = await payload.create({
      collection: 'avatars',
      data: {
        alt,
        url,
      },
      file: {
        data: Buffer.from(imageBuffer),
        mimetype: contentType,
        name: `avatar.${contentType.split('/')[1]}`,
        size: imageBuffer.byteLength,
      },
    })

    // Find and update user
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: session.user.email } },
    })

    if (!users.docs.length) {
      throw new Error('User not found')
    }

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
    console.error('[Upload Avatar] URL upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload avatar from URL',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
