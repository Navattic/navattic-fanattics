'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef, useCallback } from 'react'
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
import { debounce } from 'lodash'

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(30),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(30),
  email: z.string().email('Please enter a valid email address'),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(500).optional(),
  company: z.number().optional(),
  linkedinUrl: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((url) => {
      if (!url) return true // Allow empty values

      try {
        const urlObj = new URL(url)
        const isLinkedIn =
          urlObj.hostname === 'linkedin.com' || urlObj.hostname === 'www.linkedin.com'
        const hasProfilePath = urlObj.pathname.startsWith('/in/')
        const hasValidUsername = urlObj.pathname.length > 4 // /in/ + at least 1 character

        return isLinkedIn && hasProfilePath && hasValidUsername
      } catch {
        return false
      }
    }, 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)'),
  interactiveDemoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
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
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false)

  // Add a ref to store the upload promise
  const avatarUploadPromise = useRef<Promise<number | null> | null>(null)

  const [error, setError] = useState<string | null>(null)

  // Split the nextauth session name to infer the user's first/last names
  const nameParts = session.user?.name?.split(' ') || []
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Get email from nextauth session
  const email = session.user?.email || ''

  // Get avatar URL from nextauth session (for Google logins)
  const avatarUrl = session.user?.image || null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName,
      lastName,
      email,
      avatar: undefined,
      bio: '',
      company: undefined,
      linkedinUrl: '',
      interactiveDemoUrl: '',
    },
  })

  // Add debug logging for form field changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log(' Form field changed:', { name, type, value })
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Add debug logging for form validation errors
  useEffect(() => {
    console.log('❌ Form errors:', form.formState.errors)
  }, [form.formState.errors])

  // form state persistence to localStorage
  useEffect(() => {
    const savedFormData = localStorage.getItem('onboarding-form-data')
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        form.reset(parsed)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
      }
    }
  }, [form])

  // Save form data on changes
  useEffect(() => {
    const formData = form.getValues()
    localStorage.setItem('onboarding-form-data', JSON.stringify(formData))
  }, [form])

  // Clear saved data on successful submission
  const clearSavedFormData = () => {
    localStorage.removeItem('onboarding-form-data')
  }

  // Set avatar preview if available from Google
  useEffect(() => {
    if (avatarUrl) {
      const highResGoogleAvatarUrl = avatarUrl.replace('s96-c', 's192-c') // get higher res avatar
      setAvatarPreview(highResGoogleAvatarUrl)

      // Define upload function inside useEffect to avoid dependency issues
      const uploadAvatar = async (url: string) => {
        try {
          setIsAvatarUploading(true)

          const response = await fetch('/api/auth/upload-avatar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: url,
              alt: 'User avatar',
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to upload avatar')
          }

          const data = await response.json()
          setAvatarId(data.id)
          console.log('[Onboarding] Successfully uploaded avatar:', data)
          return data.id
        } catch (error) {
          console.error('[Onboarding] Error uploading Google avatar:', error)
          return null
        } finally {
          setIsAvatarUploading(false)
        }
      }

      // Store the promise for later use
      avatarUploadPromise.current = uploadAvatar(highResGoogleAvatarUrl)
    }
  }, [avatarUrl])

  // Add a function to handle file uploads
  const uploadAvatarFile = useCallback(async (file: File) => {
    try {
      setIsAvatarUploading(true)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', 'User avatar')

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      const data = await response.json()
      console.log('[Onboarding] Successfully uploaded avatar file:', data)
      setAvatarId(data.id)
      return data.id
    } catch (error) {
      console.error('[Onboarding] Error uploading avatar file:', error)
      return null
    } finally {
      setIsAvatarUploading(false)
    }
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('onSubmit called with values:', values)
    setIsSubmitting(true)
    setError(null)

    try {
      // Wait for avatar upload and get the ID
      let avatarId = null
      if (avatarUploadPromise.current) {
        avatarId = await avatarUploadPromise.current
      }

      // If user uploaded a file, use that avatar ID instead
      if (values.avatar && avatarId === null) {
        // The file was already uploaded in handleAvatarChange, so avatarId should be set
        avatarId = avatarId
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
          linkedinUrl: values.linkedinUrl || undefined,
          interactiveDemoUrl: values.interactiveDemoUrl || undefined,
          avatar: avatarId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      router.push('/')
      clearSavedFormData()
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNextStep() {
    setHasAttemptedValidation(true)

    const currentStepFields =
      step === 1
        ? ['firstName', 'lastName', 'email']
        : step === 2
          ? [] // All fields are optional on step 2
          : [] // All fields are optional on step 3

    // If no required fields, allow progression
    if (currentStepFields.length === 0) {
      setStep(step + 1)
      return
    }

    // Trigger validation for all current step fields
    const validationPromises = currentStepFields.map((field) =>
      form.trigger(field as keyof z.infer<typeof formSchema>),
    )

    Promise.all(validationPromises).then((results) => {
      const isCurrentStepValid = results.every((result) => result === true)

      if (isCurrentStepValid) {
        setStep(step + 1)
        setHasAttemptedValidation(false) // Reset for next step
      }
    })
  }

  function handlePreviousStep() {
    setStep(step - 1)
    setHasAttemptedValidation(false) // Reset when going back
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault() // Prevent any form submission
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        form.setError('avatar', { message: 'File size must be less than 5MB' })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        form.setError('avatar', { message: 'Please select an image file' })
        return
      }

      form.setValue('avatar', file)
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload the file immediately
      uploadAvatarFile(file)
    }
  }

  const title =
    step === 1
      ? '1. Basic Information'
      : step === 2
        ? '2. Profile Details (optional)'
        : '3. Social Links (optional)'

  // Helper function to check if a field has validation errors and should show them
  const hasFieldError = (fieldName: keyof z.infer<typeof formSchema>) => {
    return hasAttemptedValidation && !!form.formState.errors[fieldName]
  }

  // Helper function to get field error message only if validation has been attempted
  const getFieldErrorMessage = (fieldName: keyof z.infer<typeof formSchema>) => {
    return hasAttemptedValidation ? form.formState.errors[fieldName]?.message : undefined
  }

  // Helper function to get field state only if validation has been attempted
  const getFieldState = (fieldName: keyof z.infer<typeof formSchema>) => {
    return hasAttemptedValidation && form.formState.errors[fieldName] ? 'error' : 'default'
  }

  return (
    <>
      {/* Move file input outside the form */}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="sr-only"
        aria-describedby="avatar-description"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="mb-10 flex items-center gap-2">
            <div className={`h-1 w-8 rounded ${step >= 1 ? 'bg-gray-600' : 'bg-gray-300'}`} />
            <div className={`h-1 w-8 rounded ${step >= 2 ? 'bg-gray-600' : 'bg-gray-300'}`} />
            <div className={`h-1 w-8 rounded ${step >= 3 ? 'bg-gray-600' : 'bg-gray-300'}`} />
          </div>
          <h5 className="text-xl font-semibold tracking-tight">{title}</h5>
          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          {isAvatarUploading && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <LoadingSpinner />
              <span>Uploading avatar...</span>
            </div>
          )}
          {step === 1 ? (
            <>
              {/* Step 1 content */}
              <FieldSet
                label="First Name"
                promptText={getFieldErrorMessage('firstName')}
                state={getFieldState('firstName')}
              >
                <Input {...form.register('firstName')} placeholder="ex: John" />
              </FieldSet>

              <FieldSet
                label="Last Name"
                promptText={getFieldErrorMessage('lastName')}
                state={getFieldState('lastName')}
              >
                <Input {...form.register('lastName')} placeholder="ex: Doe" />
              </FieldSet>

              <FieldSet
                label="Email"
                description="We'll never share your email with anyone else."
                promptText={getFieldErrorMessage('email')}
                state={getFieldState('email')}
              >
                <Input
                  {...form.register('email')}
                  type="email"
                  placeholder="john.doe@example.com"
                />
              </FieldSet>

              <div className="flex justify-end">
                <Button type="button" variant="solid" size="md" onClick={handleNextStep}>
                  Continue <Icon name="arrow-right" />
                </Button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              {/* Step 2 content */}
              <FieldSet
                label="Avatar"
                description="Upload a profile picture"
                promptText={getFieldErrorMessage('avatar')}
                state={getFieldState('avatar')}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="border-border bg-muted relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border"
                    role="img"
                    aria-label="Avatar preview"
                  >
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
                  <div id="avatar-description" className="sr-only">
                    Select an image file to upload as your profile picture
                  </div>
                </div>
              </FieldSet>

              <CompanySelector
                userEmail={email}
                name="company"
                label="Company"
                description="Select your company or add a new one"
              />

              <FieldSet
                label="Bio"
                description="A short bio about yourself (optional)"
                promptText={getFieldErrorMessage('bio')}
                state={getFieldState('bio')}
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
                <Button type="button" variant="solid" size="md" onClick={handleNextStep}>
                  Continue <Icon name="arrow-right" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Step 3 content */}
              {/* Step 3 validation summary */}
              {hasAttemptedValidation &&
                (hasFieldError('linkedinUrl') || hasFieldError('interactiveDemoUrl')) && (
                  <div className="bg-destructive/10 border-destructive/20 mb-4 rounded-md border p-3">
                    <p className="text-destructive mb-2 text-sm font-medium">
                      Please fix the following errors:
                    </p>
                    <ul className="text-destructive space-y-1 text-sm">
                      {hasFieldError('linkedinUrl') && (
                        <li>• {form.formState.errors.linkedinUrl?.message}</li>
                      )}
                      {hasFieldError('interactiveDemoUrl') && (
                        <li>• {form.formState.errors.interactiveDemoUrl?.message}</li>
                      )}
                    </ul>
                  </div>
                )}
              <FieldSet
                label="LinkedIn Profile"
                description="Your LinkedIn profile URL (optional)"
                promptText={getFieldErrorMessage('linkedinUrl')}
                state={getFieldState('linkedinUrl')}
              >
                <Input
                  {...form.register('linkedinUrl')}
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </FieldSet>

              <FieldSet
                label="Favorite Interactive Demo"
                description="Share a link to your favorite interactive demo or project (optional)"
                promptText={getFieldErrorMessage('interactiveDemoUrl')}
                state={getFieldState('interactiveDemoUrl')}
              >
                <Input
                  {...form.register('interactiveDemoUrl')}
                  type="url"
                  placeholder="https://example.com/demo"
                />
              </FieldSet>

              <div className="flex justify-between">
                <Button type="button" variant="outline" size="md" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  size="md"
                  disabled={isSubmitting}
                  onClick={() => console.log('Submit button clicked!')}
                >
                  {isSubmitting ? 'Saving...' : 'Enter portal'}
                  {isSubmitting ? <LoadingSpinner /> : <Icon name="arrow-right" />}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </>
  )
}
