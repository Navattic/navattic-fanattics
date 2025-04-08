'use client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Form } from '@/components/shadcn/ui/form'
import { Input } from '@/components/shadcn/ui/input'
import { Textarea } from '@/components/shadcn/ui/textarea'
import { FieldSet } from '@/components/ui/FieldSet'
import { Icon } from '@/components/ui'
import { Label } from '@/components/shadcn/ui/label'

const formSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  username: z.string().min(2).max(50),
  avatar: z.instanceof(File).optional(),
  bio: z.string().max(500).optional(),
})

export default function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      bio: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
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
                <div className="relative w-24 h-24 rounded-full border border-border flex items-center justify-center bg-muted overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon name="user" className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="sr-only"
                  {...form.register('avatar')}
                />
              </div>
            </FieldSet>

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
              <Button type="submit" variant="solid" size="md">
                Enter portal <Icon name="arrow-right" />
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  )
}
