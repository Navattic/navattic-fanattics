'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { Challenge, User } from '@/payload-types'
import { Button } from '@/components/ui'
import { createComment } from './actions'

interface CommentFormProps {
  user: User
  challenge: Challenge
}

function CommentForm({ user, challenge }: CommentFormProps) {
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'executing' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!comment.trim()) return

    const commentContent = comment.trim()
    setStatus('executing')
    setError(null)

    try {
      await createComment({
        commentContent,
        user,
        challenge,
      })

      setComment('')
      setStatus('idle')
    } catch (err) {
      console.error('Error submitting comment:', err)
      setStatus('error')
      setError('Failed to post comment. Please try again.')
    }
  }

  function handleCancel() {
    setComment('')
  }

  return (
    <div className="flex gap-3">
      <div>
        <Avatar user={user} showCompany={true} />
      </div>
      <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
        <textarea
          className="h-24 w-full resize-none rounded-lg border bg-white p-3"
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={status === 'executing'}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button
            variant="outline"
            colorScheme="gray"
            type="button"
            size="md"
            onClick={handleCancel}
            disabled={status === 'executing'}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="brand"
            type="submit"
            size="md"
            disabled={!comment.trim() || status === 'executing'}
          >
            {status === 'executing' ? 'Posting...' : 'Post comment'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
