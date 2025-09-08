import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find the user by email
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
    })

    if (users.docs.length === 0) {
      return NextResponse.json({ loginMethod: null, exists: false })
    }

    const user = users.docs[0]
    return NextResponse.json({
      loginMethod: user.loginMethod,
      exists: true,
    })
  } catch (error) {
    console.error('Error checking login method:', error)
    return NextResponse.json({ error: 'Failed to check login method' }, { status: 500 })
  }
}
