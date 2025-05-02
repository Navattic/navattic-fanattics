'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/shadcn/ui/form'
import { Input } from '@/components/shadcn/ui/input'
import { Textarea } from '@/components/shadcn/ui/textarea'
import { FieldSet } from '@/components/ui/FieldSet'
import { Icon } from '@/components/ui'
import { Label } from '@/components/shadcn/ui/label'
import { Session } from 'next-auth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { CompanySelector } from '@/features/companies/CompanySelector'
import LoadingSpinner from '@/components/ui/icons/LoadingSpinner'

const formSchema = z.object({
  firstName: z.string().min(2).max(30),
  lastName: z.string().min(2).max(30),
  email: z.string().email(),
  username: z.string().min(2).max(60),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(500).optional(),
  company: z.number().optional(),
})

type OnboardingFormProps = {
  session: Session
}

export default function OnboardingForm({ session }: OnboardingFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [avatarId, setAvatarId] = useState<number | null>(null)

  // Add a ref to store the upload promise
  const avatarUploadPromise = useRef<Promise<number | null> | null>(null)

  // Split the name from the session
  const nameParts = session.user?.name?.split(' ') || []
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Get email from session
  const email = session.user?.email || ''

  // Get avatar URL from session
  const avatarUrl = session.user?.image || null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName,
      lastName,
      email,
      avatar: undefined,
      username: firstName.toLowerCase() + (lastName ? lastName.toLowerCase().charAt(0) : ''),
      bio: '',
      company: undefined,
    },
  })

  async function uploadAvatar(url: string) {
    try {
      setIsAvatarUploading(true)

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          alt: `${firstName} ${lastName}'s avatar`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      const data = await response.json()
      console.log('[Onboarding] Successfully uploaded avatar:', data)
      setAvatarId(data.id)
      return data.id
    } catch (error) {
      console.error('[Onboarding] Error uploading Google avatar:', error)
      return null
    } finally {
      setIsAvatarUploading(false)
    }
  }

  // Set avatar preview if available from Google
  useEffect(() => {
    if (avatarUrl) {
      const highResGoogleAvatarUrl = avatarUrl.replace('s96-c', 's192-c') // get higher res avatar
      setAvatarPreview(highResGoogleAvatarUrl)
      // Store the promise for later use
      avatarUploadPromise.current = uploadAvatar(highResGoogleAvatarUrl)
    }
  }, [avatarUrl])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // If there's an ongoing upload, wait for it
      if (avatarUploadPromise.current) {
        await avatarUploadPromise.current
      }

      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          bio: values.bio,
          company: values.company,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      router.push('/')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNextStep() {
    const firstStepFields = ['firstName', 'lastName', 'email', 'username']
    const isFirstStepValid = firstStepFields.every(
      (field) => !form.formState.errors[field as keyof z.infer<typeof formSchema>],
    )

    if (isFirstStepValid) {
      setStep(2)
    } else {
      // Trigger validation for first step fields
      firstStepFields.forEach((field) => form.trigger(field as keyof z.infer<typeof formSchema>))
    }
  }

  function handlePreviousStep() {
    setStep(1)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue('avatar', file)
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const title = step === 1 ? 'Set up your profile' : 'Optional information'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h5 className="text-xl font-semibold tracking-tight">{title}</h5>
        {step === 1 ? (
          <>
            <FieldSet
              label="First Name"
              promptText={form.formState.errors.firstName?.message}
              state={form.formState.errors.firstName ? 'error' : 'default'}
            >
              <Input {...form.register('firstName')} placeholder="John" />
            </FieldSet>

            <FieldSet
              label="Last Name"
              promptText={form.formState.errors.lastName?.message}
              state={form.formState.errors.lastName ? 'error' : 'default'}
            >
              <Input {...form.register('lastName')} placeholder="Doe" />
            </FieldSet>

            <FieldSet
              label="Email"
              description="We'll never share your email with anyone else."
              promptText={form.formState.errors.email?.message}
              state={form.formState.errors.email ? 'error' : 'default'}
            >
              <Input {...form.register('email')} type="email" placeholder="john.doe@example.com" />
            </FieldSet>

            <div className="flex justify-end">
              <Button type="button" variant="solid" size="md" onClick={handleNextStep}>
                Continue <Icon name="arrow-right" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <FieldSet
              label="Avatar"
              description="Upload a profile picture (optional)"
              promptText={form.formState.errors.avatar?.message}
              state={form.formState.errors.avatar ? 'error' : 'default'}
            >
              <div className="flex items-center gap-4">
                <div className="border-border bg-muted relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                      width={96}
                      height={96}
                    />
                  ) : (
                    <Icon name="user" className="text-muted-foreground h-10 w-10" />
                  )}
                </div>
                <Label
                  htmlFor="avatar-upload"
                  className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-8 cursor-pointer items-center justify-center rounded-md border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  {avatarPreview ? 'Change photo' : 'Upload photo'}
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </div>
            </FieldSet>

            <CompanySelector
              userEmail={email} // Used to associate a user with the creation of a company (for admin purposes)
              name="company"
              label="Company"
              description="Select your company or add a new one"
            />

            <FieldSet
              label="Bio"
              description="A short bio about yourself (optional)"
              promptText={form.formState.errors.bio?.message}
              state={form.formState.errors.bio ? 'error' : 'default'}
            >
              <Textarea
                {...form.register('bio')}
                placeholder="Tell us about yourself"
                className="resize-none"
              />
            </FieldSet>

            <div className="flex justify-between">
              <Button type="button" variant="outline" size="md" onClick={handlePreviousStep}>
                Back
              </Button>
              <Button type="submit" variant="solid" size="md" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Enter portal'}
                {isSubmitting ? <LoadingSpinner /> : <Icon name="arrow-right" />}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  )
}
