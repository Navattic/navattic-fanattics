'use client'

import { useState } from 'react'
import { Button, LexicalEditor } from '@/components/ui'
import { updateComment } from './actions'
import { Comment } from '@/payload-types'
import { convertStringToLexical, extractTextFromLexicalContent } from '@/utils/commentContent'

interface CommentEditFormProps {
  commentId: number
  initialContent: string | object
  onCancel: () => void
  onSuccess: (updatedComment: Comment) => void
}

export function CommentEditForm({
  commentId,
  initialContent,
  onCancel,
  onSuccess,
}: CommentEditFormProps) {
  // Convert initial content to Lexical format if it's a string
  const getInitialLexicalContent = () => {
    if (typeof initialContent === 'string') {
      // Old comment format - convert to Lexical
      return convertStringToLexical(initialContent)
    }
    // Already in Lexical format
    return initialContent
  }

  const [richContent, setRichContent] = useState<any>(getInitialLexicalContent())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate content
    const textContent = extractTextFromLexicalContent(richContent.root).trim()
    if (!textContent) return

    setIsSubmitting(true)

    try {
      const updatedComment = await updateComment({
        commentId,
        richContent,
      })
      onSuccess(updatedComment)
    } catch (error) {
      console.error('Error updating comment:', error)
      // Optionally show an error message to the user
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
      <LexicalEditor
        value={richContent}
        onChange={setRichContent}
        placeholder="Edit your comment"
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <Button
          variant="ghost"
          colorScheme="gray"
          type="button"
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          colorScheme="gray"
          type="submit"
          size="md"
          disabled={!extractTextFromLexicalContent(richContent.root).trim() || isSubmitting}
        >
          Save changes
        </Button>
      </div>
    </form>
  )
}
