'use client'

import { useState, useRef } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Icon } from '@/components/ui'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/shadcn/ui/form'
import { Input } from '@/components/shadcn/ui/input'
import { User } from '@/payload-types'
import { createDiscussionPost } from '@/features/discussions/actions'

const formSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(300, 'Title must be less than 300 characters'),
  content: z
    .object({
      root: z.object({
        type: z.string(),
        children: z.array(z.any()),
        direction: z.union([z.literal('ltr'), z.literal('rtl'), z.null()]),
        format: z.string(),
        indent: z.number(),
        version: z.number(),
      }),
    })
    .refine((content) => {
      // Check if content has meaningful text (not just empty paragraphs)
      const hasText = JSON.stringify(content).length > 100 // Basic check for content
      return hasText
    }, 'Content is required'),
})

interface CreatePostFormProps {
  user: User
  onSuccess: () => void
  onCancel: () => void
}

export function CreatePostForm({ user, onSuccess, onCancel }: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '' }],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
  })

  const insertLink = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const url = prompt('Enter URL:')
    if (!url) return

    const text = prompt('Enter link text:') || url
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = textarea.value

    const newValue =
      currentValue.substring(0, start) + `[${text}](${url})` + currentValue.substring(end)
    textarea.value = newValue

    // Trigger onChange to update form state
    const event = new Event('input', { bubbles: true })
    textarea.dispatchEvent(event)

    // Focus back to textarea
    textarea.focus()
    const newCursorPos = start + `[${text}](${url})`.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }

  const convertMarkdownToLexical = (text: string) => {
    // Simple markdown to Lexical conversion for links
    const children: any[] = []
    const parts = text.split(/(\[([^\]]+)\]\(([^)]+)\))/g)

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)) {
        // This is a link
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (linkMatch) {
          children.push({
            type: 'link',
            url: linkMatch[2],
            children: [
              {
                type: 'text',
                text: linkMatch[1],
                format: 0,
                style: '',
                mode: 'normal',
                detail: 0,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
          })
        }
      } else if (part && !part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)) {
        // Regular text
        children.push({
          type: 'text',
          text: part,
          format: 0,
          style: '',
          mode: 'normal',
          detail: 0,
        })
      }
    }

    return {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children:
              children.length > 0
                ? children
                : [
                    {
                      type: 'text',
                      text: text,
                      format: 0,
                      style: '',
                      mode: 'normal',
                      detail: 0,
                    },
                  ],
            direction: 'ltr',
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      await createDiscussionPost({
        title: values.title,
        content: values.content,
        author: user,
      })
      onSuccess()
    } catch (err) {
      console.error('Error creating discussion post:', err)
      setError(err instanceof Error ? err.message : 'Failed to create discussion post')
    } finally {
      setIsSubmitting(false)
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
                <Input
                  placeholder="What would you like to discuss?"
                  {...field}
                  disabled={isSubmitting}
                />
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
                <div className="min-h-[200px] rounded-lg border">
                  {/* Toolbar */}
                  <div className="border-b bg-gray-50 px-3 py-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={insertLink}
                        disabled={isSubmitting}
                        className="h-8 px-2"
                      >
                        <Icon name="link" className="size-4" />
                        Link
                      </Button>
                      <div className="ml-2 flex items-center text-xs text-gray-500">
                        Use [text](url) for links
                      </div>
                    </div>
                  </div>

                  {/* Text Area */}
                  <textarea
                    ref={textareaRef}
                    className="h-48 w-full resize-none border-0 p-4 outline-none"
                    placeholder="Share your thoughts, ask questions, or start a conversation...&#10;&#10;You can add links using [text](url) format or use the Link button above."
                    onChange={(e) => {
                      const textContent = e.target.value
                      field.onChange(convertMarkdownToLexical(textContent))
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">{error}</div>}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            colorScheme="gray"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="solid" colorScheme="brand" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Creating... <Icon name="spinner" className="size-4" />
              </>
            ) : (
              'Create Discussion'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
