import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import RegisterForm from '../../../features/auth/Form'

export default async function Page() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/')
  }

  return (
    <section className="flex flex-col items-center justify-center h-screen">
      <div className="w-xl">
        <RegisterForm />
      </div>
    </section>
  )
}
