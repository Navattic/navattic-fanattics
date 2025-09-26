import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Find the user by email with populated avatar and company
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session.user.email,
        },
      },
      depth: 2,
    })

    if (!users.docs.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users.docs[0]

    // Format the response data
    const profileData = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      bio: user.bio || '',
      company: typeof user.company === 'object' ? user.company?.id : user.company,
      location: user.location || '',
      linkedinUrl: user.linkedinUrl || '',
      interactiveDemoUrl: user.interactiveDemoUrl || '',
      avatar: typeof user.avatar === 'object' ? user.avatar?.id : user.avatar,
      avatarUrl: typeof user.avatar === 'object' ? user.avatar?.url : null,
      loginMethod: user.loginMethod || 'email',
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error('Error fetching profile data:', error)
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      firstName,
      lastName,
      email,
      bio,
      company,
      location,
      linkedinUrl,
      interactiveDemoUrl,
      avatar,
      loginMethod,
      timezone,
    } = await req.json()

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
        email,
        bio,
        company: company || undefined,
        location: location || undefined,
        linkedinUrl: linkedinUrl || undefined,
        interactiveDemoUrl: interactiveDemoUrl || undefined,
        avatar: avatar || undefined,
        loginMethod: loginMethod || 'email',
        onboardingCompleted: true,
        timezone: timezone || 'UTC',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
