import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { payload } from '@/lib/payloadClient'

// This page is used to redirect users to the onboarding page if they are new (upon signing in for the first time). Else, log them in as usual
export default async function AuthRedirect() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Check if user is new by looking up when they were created
  const users = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: session.user?.email,
      },
    },
  })

  if (users.docs.length > 0) {
    const user = users.docs[0]
    const createdAt = new Date(user.createdAt)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    // If created within the last 5 minutes, consider them new
    if (createdAt > fiveMinutesAgo) {
      redirect('/register')
    }
  }

  // Default to homepage
  redirect('/')
}