import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import LoginForm from '../../../features/auth/LoginForm'

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (session) {
    // Redirect to dashboard if already logged in
    redirect('/')
  }

  return (
    <section className="flex h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-xl rounded-xl bg-white p-8 shadow-sm">
        <LoginForm mode="signin" />
      </div>
    </section>
  )
}
