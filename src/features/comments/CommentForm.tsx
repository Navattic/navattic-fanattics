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

    try {
      setStatus('executing')
      setError(null)
      
      await createComment({
        commentContent: comment,
        user,
        challenge
      })

      setComment('')
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError('Failed to post comment. Please try again.')
      console.error(err)
    }
  }

  function handleCancel() {
    setComment('')
  }

  return (
    <div className="flex gap-3">
      <div>
        <Avatar user={user} />
      </div>
      <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit}>
        <textarea
          className="w-full bg-white border rounded-lg p-3 h-24 resize-none"
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
            onClick={handleCancel}
            disabled={status === 'executing'}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="brand"
            type="submit"
            disabled={!comment.trim() || status === 'executing'}
          >
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
