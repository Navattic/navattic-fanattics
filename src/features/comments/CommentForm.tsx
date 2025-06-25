'use client'

import { useState, useEffect, useRef } from 'react'
import Avatar from '@/components/ui/Avatar'
import { Challenge, User } from '@/payload-types'
import { Button } from '@/components/ui'
import { createComment } from './actions'
import { useOptimisticComments } from './OptimisticCommentsContext'

interface CommentFormProps {
  user: User
  challenge: Challenge
}

function CommentForm({ user, challenge }: CommentFormProps) {
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'executing' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const { addOptimisticComment, removeOptimisticComment, replaceOptimisticComment } =
    useOptimisticComments()

  // Add ref to track if component is mounted
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!comment.trim() || status === 'executing') return

    const commentContent = comment.trim()
    setStatus('executing')
    setError(null)

    let optimisticId: string | null = null

    try {
      console.log('Adding optimistic comment...')

      // Add optimistic comment
      optimisticId = addOptimisticComment({
        content: commentContent,
        user: user,
        challenge: challenge,
        parent: null,
        status: 'approved',
        deleted: false,
        likes: 0,
        likedBy: [],
        flaggedReports: 0,
      })

      console.log('Optimistic comment added with ID:', optimisticId)

      // Clear form immediately
      setComment('')

      // Wait for server response
      const result = await createComment({
        commentContent,
        user,
        challenge,
      })

      console.log('Server response received:', result)

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Replace optimistic comment with real one
        if (optimisticId) {
          replaceOptimisticComment(optimisticId, result)
        }
        setStatus('idle')
      }
    } catch (err) {
      console.error('Error submitting comment:', err)

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Remove optimistic comment on error
        if (optimisticId) {
          removeOptimisticComment(optimisticId)
        }
        setStatus('error')
        setError('Failed to post comment. Please try again.')
      }
    }
  }

  function handleCancel() {
    setComment('')
    setError(null)
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
