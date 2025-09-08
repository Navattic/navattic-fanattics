import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { payload } from '@/lib/payloadClient'

export default async function AuthRedirect() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Check if user has completed onboarding
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

    // If user hasn't completed onboarding, send them there
    if (!user.onboardingCompleted) {
      redirect('/register')
    }
  }

  // Default to homepage
  redirect('/')
}
