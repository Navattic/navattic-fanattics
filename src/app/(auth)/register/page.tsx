import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import OnboardingForm from '../../../features/auth/OnboardingForm'

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // If no session, redirect to login
    console.log('No session, redirecting to login')
    redirect('/login')
    return null
  }

  return (
    <section className="bg-gray-50 flex flex-col items-center justify-center h-screen">
      <div className="w-xl bg-white rounded-xl p-8 shadow-sm">
        <OnboardingForm session={session} />
      </div>
    </section>
  )
}
