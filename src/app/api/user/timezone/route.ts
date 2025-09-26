import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { payload } from '@/lib/payloadClient'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timezone } = await req.json()

    if (!timezone) {
      return NextResponse.json({ error: 'Timezone required' }, { status: 400 })
    }

    // Update user's timezone
    await payload.update({
      collection: 'users',
      where: {
        email: { equals: session.user.email },
      },
      data: {
        timezone,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user timezone:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
