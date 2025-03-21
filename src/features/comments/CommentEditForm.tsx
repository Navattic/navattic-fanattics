'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { updateComment } from './actions'
import { Comment } from '@/payload-types'
interface CommentEditFormProps {
  initialContent: string
  commentId: Comment['id']
  onCancel: () => void
  onSuccess: () => void
}

function CommentEditForm({ initialContent, commentId, onCancel, onSuccess }: CommentEditFormProps) {
  const [content, setContent] = useState(initialContent)
  const [status, setStatus] = useState<'idle' | 'executing' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) return

    try {
      setStatus('executing')
      setError(null)

      await updateComment({
        commentId,
        content,
      })

      setStatus('idle')
      onSuccess()
    } catch (err) {
      setStatus('error')
      setError('Failed to update comment. Please try again.')
      console.error('Error updating comment:', err)
    }
  }

  return (
    <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
      <textarea
        className="w-full bg-white border rounded-lg p-3 h-24 resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={status === 'executing'}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          colorScheme="gray"
          type="button"
          size="sm"
          onClick={onCancel}
          disabled={status === 'executing'}
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          colorScheme="gray"
          type="submit"
          size="sm"
          disabled={!content.trim() || status === 'executing'}
        >
          Save Changes
        </Button>
      </div>
    </form>
  )
}

export default CommentEditForm
