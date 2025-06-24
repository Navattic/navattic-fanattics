'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { Challenge, User, Comment as PayloadComment } from '@/payload-types'
import { Button } from '@/components/ui'
import { createComment } from './actions'

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!commentContent.trim()) return

    const content = commentContent.trim()
    setStatus('executing')
    setError(null)

    try {
      await createComment({
        commentContent: content,
        user,
        challenge,
        parentComment,
      })

      setCommentContent('')
      setStatus('idle')
      setOpenReply(false)
    } catch (err) {
      setStatus('error')
      setError('Failed to post reply. Please try again.')
      console.error('Error submitting reply:', err)
    }
  }

  function handleCancel() {
    setCommentContent('')
    setOpenReply(false)
  }

  return (
    <div className="flex gap-3">
      <div className="mr-3 self-stretch px-4">
        {hasReplies && <div className="h-full w-0.5 bg-gray-300"></div>}
      </div>
      <div className="mt-4">
        <Avatar user={user} />
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
