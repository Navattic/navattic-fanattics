'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { Challenge, User, Comment } from '@/payload-types'
import { Button } from '@/components/ui'
import { createComment } from './actions'

type OptimisticComment = Omit<Comment, 'id'> & { id: string }

interface CommentFormProps {
  user: User
  challenge: Challenge
  onOptimisticComment: (comment: OptimisticComment) => void
  onRemoveOptimisticComment: (tempId: string) => void
}

// TOOD: make sure deleted comments get moved to the bottom of the list

function CommentForm({
  user,
  challenge,
  onOptimisticComment,
  onRemoveOptimisticComment,
}: CommentFormProps) {
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'executing' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!comment.trim()) return

    const commentContent = comment.trim()
    const tempId = `temp-${Date.now()}`

    console.log('Creating optimistic comment with tempId:', tempId)

    // Create optimistic comment
    const optimisticComment: OptimisticComment = {
      id: tempId,
      content: commentContent,
      user: user,
      challenge: challenge.id,
      status: 'approved',
      deleted: false,
      likes: 0,
      likedBy: [],
      flaggedReports: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log('Optimistic comment created:', optimisticComment)

    // Add optimistic comment immediately
    onOptimisticComment(optimisticComment)
    setComment('')
    setStatus('executing')
    setError(null)

    try {
      console.log('Submitting comment to server...')
      await createComment({
        commentContent,
        user,
        challenge,
      })

      console.log('Comment submitted successfully, removing optimistic comment')
      // Remove optimistic comment on success
      onRemoveOptimisticComment(tempId)
      setStatus('idle')
    } catch (err) {
      console.error('Error submitting comment:', err)
      // Remove optimistic comment on error
      onRemoveOptimisticComment(tempId)
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
