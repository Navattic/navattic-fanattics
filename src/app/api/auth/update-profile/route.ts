import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstName, lastName, bio, company, avatar } = await req.json()

    const payload = await getPayload({ config })

    // Find the user by email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session.user.email,
        },
      },
    })

    if (!users.docs.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = users.docs[0].id

    // Update the user profile
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        firstName,
        lastName,
        bio,
        company: company || undefined,
        avatar: avatar || undefined,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
