'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, Button } from '@/components/ui'
import { Challenge, User, Comment as PayloadComment } from '@/payload-types'
import { createComment } from './actions'
import { useOptimisticComments } from './OptimisticCommentsContext'

interface CommentReplyFormProps {
  parentComment: PayloadComment
  user: User
  challenge: Challenge
  setOpenReply: (open: boolean) => void
  hasReplies: boolean
}

function CommentReplyForm({
  parentComment,
  user,
  challenge,
  setOpenReply,
  hasReplies,
}: CommentReplyFormProps) {
  const [commentContent, setCommentContent] = useState('')
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

    if (!commentContent.trim() || status === 'executing') return

    const content = commentContent.trim()
    setStatus('executing')
    setError(null)

    let optimisticId: string | null = null

    try {
      // Add optimistic comment
      optimisticId = addOptimisticComment({
        content: content,
        user: user,
        challenge: challenge,
        parent: parentComment,
        status: 'approved',
        deleted: false,
        likes: 0,
        likedBy: [],
        flaggedReports: 0,
      })

      // Clear form and close reply form immediately
      setCommentContent('')
      setOpenReply(false)

      const result = await createComment({
        commentContent: content,
        user,
        challenge,
        parentComment,
      })

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Replace optimistic comment with real one
        if (optimisticId) {
          replaceOptimisticComment(optimisticId, result)
        }
        setStatus('idle')
      } else {
        // Component unmounted but we still need to replace the optimistic comment
        if (optimisticId) {
          replaceOptimisticComment(optimisticId, result)
        }
      }
    } catch (err) {
      // Only update local state if component is still mounted
      if (isMountedRef.current) {
        setStatus('error')
        setError('Failed to post reply. Please try again.')
      }

      // Always remove optimistic comment on error, even if unmounted
      if (optimisticId) {
        removeOptimisticComment(optimisticId)
      }

      console.error('Error submitting reply:', err)
    }
  }

  function handleCancel() {
    setCommentContent('')
    setError(null)
    setOpenReply(false)
  }

  return (
    <div className="flex gap-3">
      <div className="mr-3 self-stretch px-4">
        {hasReplies && <div className="h-full w-0.5 bg-gray-300"></div>}
      </div>
      <div className="mt-4">
        <Avatar user={user} showCompany={true} />
      </div>
      <form className="mt-4 flex w-full flex-col gap-3" onSubmit={handleSubmit}>
        <textarea
          className="h-24 w-full resize-none rounded-lg border bg-white p-3"
          placeholder="Add a reply"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          disabled={status === 'executing'}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button
            variant="ghost"
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
            colorScheme="gray"
            type="submit"
            size="md"
            disabled={!commentContent.trim() || status === 'executing'}
          >
            {status === 'executing' ? 'Posting...' : 'Reply'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentReplyForm
