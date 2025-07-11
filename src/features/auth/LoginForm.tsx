'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/shadcn/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type EmailFormData = z.infer<typeof emailSchema>

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const searchParams = useSearchParams()
  const isVerifying = searchParams.get('verify') === 'true'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const handleGoogleSignIn = () => {
    setIsLoading(true)
    signIn('google')
  }

  const handleEmailSignIn = async (data: EmailFormData) => {
    setIsLoading(true)
    try {
      await signIn('email', {
        email: data.email,
        callbackUrl: '/',
        redirect: false,
      })
      setEmailSent(true)
    } catch (error) {
      console.error('Error sending magic link:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="space-y-4 text-center">
        <div className="gradient-to-b relative inline-grid aspect-square place-items-center rounded-lg border border-gray-200 from-white to-gray-50 p-2 shadow-xs">
          <Image
            src="/logos/navattic-shadow.png"
            alt="Navattic Logo"
            width={40}
            height={40}
            priority
            className="translate-y-1"
          />
        </div>
        <h1 className="text-lg font-bold text-gray-800">Check your email</h1>
        <p className="text-gray-600">
          We sent you a magic link. Click the link in your email to sign in. This may take a few
          minutes.
        </p>
      </div>
    )
  }

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="gradient-to-b relative inline-grid aspect-square place-items-center rounded-lg border border-gray-200 from-white to-gray-50 p-2 shadow-xs">
          <Image
            src="/logos/navattic-shadow.png"
            alt="Navattic Logo"
            width={40}
            height={40}
            priority
            className="translate-y-1"
          />
        </div>
        <h1 className="text-lg font-bold text-gray-800">Check your email</h1>
        <p className="text-gray-600">
          We sent you a magic link. Click the link in your email to sign in.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="gradient-to-b relative inline-grid aspect-square place-items-center rounded-lg border border-gray-200 from-white to-gray-50 p-2 shadow-xs">
        <Image
          src="/logos/navattic-shadow.png"
          alt="Navattic Logo"
          width={40}
          height={40}
          priority
          className="translate-y-1"
        />
      </div>
      <h1 className="pb-6 text-lg font-bold text-gray-800">Sign in to Fanattic Portal</h1>

      <form onSubmit={handleSubmit(handleEmailSignIn)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full text-base" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner />
              Sending magic link...
            </span>
          ) : (
            'Sign in with Email'
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-gray-400">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full text-base"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner />
            Signing in...
          </span>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign in with Google
          </>
        )}
      </Button>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
