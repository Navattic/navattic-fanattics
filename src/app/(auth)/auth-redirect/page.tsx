import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { payload } from '@/lib/payloadClient'

export default async function AuthRedirect() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/login')
  }

  // Retry logic to handle race conditions and caching issues
  let user = null
  let attempts = 0
  const maxAttempts = 5
  const baseDelay = 100 // Start with 100ms

  while (!user && attempts < maxAttempts) {
    try {
      if (!payload) {
        console.error('[AuthRedirect] Payload is not initialized')
        redirect('/login?error=payload_not_initialized')
      }

      const users = await payload?.find({
        collection: 'users',
        where: {
          email: {
            equals: session.user.email,
          },
        },
        // Disable caching to ensure fresh data
        draft: false,
      })

      if (users?.docs.length > 0) {
        user = users?.docs[0] ?? null
        break
      } else {
        console.error('[AuthRedirect] User not found:', {
          email: session.user.email,
          attempts,
        })
        redirect('/login?error=user_not_found')
      }

      // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
      if (attempts < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempts)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      console.error(`[AuthRedirect] Attempt ${attempts + 1} failed:`, error)
    }

    attempts++
  }

  if (!user) {
    console.error('[AuthRedirect] User not found after all retries:', {
      email: session.user.email,
      attempts,
    })
    redirect('/login?error=user_not_found')
  }

  // Check onboarding status with explicit null/undefined handling
  const onboardingCompleted = user.onboardingCompleted === true

  if (!onboardingCompleted) {
    redirect('/register')
  }

  // User exists and has completed onboarding
  redirect('/')
}
