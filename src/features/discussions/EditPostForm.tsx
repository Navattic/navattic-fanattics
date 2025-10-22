'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { LexicalEditor } from '@/components/ui'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form'
import { Input } from '@/components/shadcn/ui/input'
import { User, DiscussionPost } from '@/payload-types'
import { updateDiscussionPost } from '@/features/discussions/actions'

// Helper function to extract text from Lexical content recursively
function extractTextFromLexicalContent(node: any): string {
  if (!node) return ''

  // If this is a text node, return its text
  if (node.type === 'text' && node.text) {
    return node.text
  }

  // If this node has children, recursively extract text from them
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromLexicalContent).join('')
  }

  return ''
}

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(300, 'Title must be less than 300 characters'),
  content: z.any().refine((value) => {
    // Check if the content has meaningful text
    if (!value || !value.root) return false

    // Extract all text content recursively
    const textContent = extractTextFromLexicalContent(value.root).trim()

    // Check if there's at least 5 characters of actual text
    return textContent.length >= 5
  }, 'Content must be at least 5 characters'),
})

interface EditPostFormProps {
  user: User
  discussionPost: DiscussionPost
  onSuccess: () => void
  onSubmittingChange?: (isSubmitting: boolean) => void
}

interface EditPostFormRef {
  requestSubmit: () => void
}

export const EditPostForm = forwardRef<EditPostFormRef, EditPostFormProps>(
  ({ user, discussionPost, onSuccess, onSubmittingChange }, ref) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        title: discussionPost.title,
        content: discussionPost.content,
      },
    })

    useImperativeHandle(ref, () => ({
      requestSubmit: () => {
        form.handleSubmit(onSubmit)()
      },
    }))

    async function onSubmit(values: z.infer<typeof formSchema>) {
      setIsSubmitting(true)
      onSubmittingChange?.(true)
      setError(null)

      console.log('Edit form submission values:', {
        title: values.title,
        content: values.content,
      })

      try {
        await updateDiscussionPost({
          postId: discussionPost.id,
          title: values.title,
          content: values.content,
          currentUser: user,
        })

        // Call onSuccess to close the modal
        onSuccess()

        // Refresh the page to show updated content
        router.refresh()
      } catch (err) {
        console.error('Error updating discussion post:', err)
        setError(err instanceof Error ? err.message : 'Failed to update discussion post')
      } finally {
        setIsSubmitting(false)
        onSubmittingChange?.(false)
      }
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Let's talk about..." {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <LexicalEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Share your thoughts, ask questions, or start a conversation..."
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}
        </form>
      </Form>
    )
  },
)

EditPostForm.displayName = 'EditPostForm'
