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
    <section className="bg-gray-50 flex flex-col items-center justify-center h-screen">
      <div className="w-xl bg-white rounded-xl p-8 shadow-sm">
        <LoginForm />
      </div>
    </section>
  )
}
