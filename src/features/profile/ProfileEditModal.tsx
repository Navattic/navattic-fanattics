'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Icon, FieldSet, Modal } from '@/components/ui'
import { Form } from '@/components/shadcn/ui/form'
import { Input } from '@/components/shadcn/ui/input'
import { Textarea } from '@/components/shadcn/ui/textarea'
import Image from 'next/image'
import { CompanySelector } from '@/features/companies/CompanySelector'
import { LocationSelector } from '@/components/ui/LocationSelector'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(30),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(30),
  email: z.string().email('Please enter a valid email address'),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(500).optional(),
  company: z.number().optional(),
  location: z.string().optional(),
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

type ProfileEditModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ProfileData = {
  firstName: string
  lastName: string
  email: string
  bio: string
  company?: number
  location: string
  linkedinUrl: string
  interactiveDemoUrl: string
  avatar?: number
  avatarUrl?: string
  loginMethod: string
}

export function ProfileEditModal({ open, onOpenChange }: ProfileEditModalProps) {
  const router = useRouter()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAvatarUploading, setIsAvatarUploading] = useState(false)
  const [avatarId, setAvatarId] = useState<number | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const avatarUploadPromise = useRef<Promise<number | null> | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      avatar: undefined,
      bio: '',
      company: undefined,
      location: '',
      linkedinUrl: '',
      interactiveDemoUrl: '',
    },
  })

  useEffect(() => {
    if (open) {
      const fetchProfileData = async () => {
        try {
          setIsLoading(true)
          setError(null)

          const response = await fetch('/api/auth/update-profile')
          if (!response.ok) {
            throw new Error('Failed to fetch profile data')
          }

          const profileData: ProfileData = await response.json()

          form.reset({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            bio: profileData.bio,
            company: profileData.company,
            location: profileData.location,
            linkedinUrl: profileData.linkedinUrl,
            interactiveDemoUrl: profileData.interactiveDemoUrl,
          })

          if (profileData.avatarUrl) {
            setAvatarPreview(profileData.avatarUrl)
            setAvatarId(profileData.avatar || null)
          }
        } catch (error) {
          console.error('Error fetching profile data:', error)
          setError('Failed to load profile data')
        } finally {
          setIsLoading(false)
        }
      }

      fetchProfileData()
    }
  }, [open, form])

  useEffect(() => {
    if (!open) {
      setAvatarPreview(null)
      setAvatarId(null)
      setAvatarRemoved(false)
      setError(null)
      setIsLoading(true)
      avatarUploadPromise.current = null
    }
  }, [open])

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
      setAvatarId(data.id)
      return data.id
    } catch (error) {
      console.error('Error uploading avatar file:', error)
      return null
    } finally {
      setIsAvatarUploading(false)
    }
  }, [])

  const removeAvatar = useCallback(() => {
    setAvatarPreview(null)
    setAvatarId(null)
    setAvatarRemoved(true)
    form.setValue('avatar', undefined)
    avatarUploadPromise.current = null
  }, [form])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setAvatarRemoved(false)
      }
      reader.readAsDataURL(file)

      avatarUploadPromise.current = uploadAvatarFile(file)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      let finalAvatarId = avatarId

      // If there's an upload in progress, wait for it
      if (avatarUploadPromise.current) {
        const uploadResult = await avatarUploadPromise.current
        if (uploadResult) {
          finalAvatarId = uploadResult
        }
      }

      // If avatar was removed, don't send any avatar ID
      if (avatarRemoved) {
        finalAvatarId = null
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
          location: values.location || undefined,
          linkedinUrl: values.linkedinUrl || undefined,
          interactiveDemoUrl: values.interactiveDemoUrl || undefined,
          avatar: finalAvatarId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const modalContent = isLoading ? (
    <div className="flex items-center justify-center py-8">
      <Icon name="spinner" className="h-6 w-6" />
      <span className="ml-2">Loading profile data...</span>
    </div>
  ) : (
    <>
      {/* Hidden file input */}
      <input
        id="profile-avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="sr-only"
        disabled={isAvatarUploading}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Avatar Section */}
          <FieldSet
            label="Avatar"
            description="Upload a profile picture"
            promptText={form.formState.errors.avatar?.message}
            state={form.formState.errors.avatar ? 'error' : 'default'}
          >
            <div className="flex items-center gap-4">
              <div
                className="border-border bg-muted group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border"
                role="img"
                aria-label="Avatar preview"
              >
                {avatarPreview ? (
                  <>
                    <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                      width={96}
                      height={96}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={removeAvatar}
                        className="h-8 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                ) : (
                  <Icon name="user" className="text-muted-foreground h-10 w-10" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => document.getElementById('profile-avatar-upload')?.click()}
                  disabled={isAvatarUploading}
                  className="h-8"
                >
                  {isAvatarUploading ? (
                    <span className="flex items-center gap-1">
                      Uploading...
                      <Icon name="spinner" />
                    </span>
                  ) : avatarPreview ? (
                    'Change photo'
                  ) : (
                    'Upload photo'
                  )}
                </Button>
              </div>
            </div>
          </FieldSet>

          {/* Name Fields */}
          <div className="flex gap-3">
            <FieldSet
              className="flex-1"
              label="First Name"
              promptText={form.formState.errors.firstName?.message}
              state={form.formState.errors.firstName ? 'error' : 'default'}
            >
              <Input {...form.register('firstName')} placeholder="ex: John" />
            </FieldSet>

            <FieldSet
              className="flex-1"
              label="Last Name"
              promptText={form.formState.errors.lastName?.message}
              state={form.formState.errors.lastName ? 'error' : 'default'}
            >
              <Input {...form.register('lastName')} placeholder="ex: Doe" />
            </FieldSet>
          </div>

          {/* Email Field */}
          <FieldSet
            label="Email"
            promptText={form.formState.errors.email?.message}
            state={form.formState.errors.email ? 'error' : 'default'}
          >
            <Input {...form.register('email')} type="email" placeholder="john.doe@example.com" />
          </FieldSet>

          {/* Company Field */}
          <CompanySelector
            userEmail={form.watch('email')}
            name="company"
            label="Company"
            description="Select your company or add a new one"
          />

          {/* Bio Field */}
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

          {/* Location Field */}
          <FieldSet
            label="Location"
            description="Where are you based? (optional)"
            promptText={form.formState.errors.location?.message}
            state={form.formState.errors.location ? 'error' : 'default'}
          >
            <LocationSelector
              value={form.watch('location')}
              onChange={(value) => form.setValue('location', value)}
              error={form.formState.errors.location?.message}
              state={form.formState.errors.location ? 'error' : 'default'}
              placeholder="Select your location..."
            />
          </FieldSet>

          {/* LinkedIn Field */}
          <FieldSet
            label="LinkedIn Profile"
            description="Your LinkedIn profile URL (optional)"
            promptText={form.formState.errors.linkedinUrl?.message}
            state={form.formState.errors.linkedinUrl ? 'error' : 'default'}
          >
            <Input
              {...form.register('linkedinUrl')}
              type="url"
              placeholder="https://linkedin.com/in/your-profile"
            />
          </FieldSet>

          {/* Interactive Demo Field */}
          <FieldSet
            label="Favorite Interactive Demo"
            description="Share a link to your favorite interactive demo or project (optional)"
            promptText={form.formState.errors.interactiveDemoUrl?.message}
            state={form.formState.errors.interactiveDemoUrl ? 'error' : 'default'}
          >
            <Input
              {...form.register('interactiveDemoUrl')}
              type="url"
              placeholder="https://example.com/demo"
            />
          </FieldSet>
        </form>
      </Form>
    </>
  )

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Profile"
      description="Update your profile information"
      primaryButton={{
        children: isSubmitting ? (
          <>
            Saving <Icon name="spinner" />
          </>
        ) : (
          'Save Changes'
        ),
        disabled: isSubmitting || isLoading,
        onClick: form.handleSubmit(onSubmit),
      }}
      secondaryButton={{
        children: 'Cancel',
        onClick: () => onOpenChange(false),
      }}
      bodyClassName="max-h-[70vh]"
    >
      {modalContent}
    </Modal>
  )
}
