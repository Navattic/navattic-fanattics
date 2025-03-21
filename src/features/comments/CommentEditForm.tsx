'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { updateComment } from './actions'
import { Comment } from '@/payload-types'

interface CommentEditFormProps {
  commentId: number
  initialContent: string
  onCancel: () => void
  onSuccess: (updatedComment: Comment) => void
}

export function CommentEditForm({
  commentId,
  initialContent,
  onCancel,
  onSuccess,
}: CommentEditFormProps) {
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updatedComment = await updateComment({
        commentId,
        content,
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
    <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
      <textarea
        className="w-full bg-white border rounded-lg p-3 h-24 resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <Button
          variant="ghost"
          colorScheme="gray"
          type="button"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          colorScheme="gray"
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}
