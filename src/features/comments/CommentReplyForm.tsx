'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, Button, LexicalEditor } from '@/components/ui'
import { Challenge, User, Comment as PayloadComment, DiscussionPost } from '@/payload-types'
import { createComment } from './actions'
import { useOptimisticComments } from './OptimisticCommentsContext'
import {
  extractTextFromLexicalContent,
  removeTrailingEmptyParagraphs,
} from '@/utils/commentContent'

interface CommentReplyFormProps {
  parentComment: PayloadComment
  user: User
  challenge?: Challenge
  discussionPost?: DiscussionPost
  setOpenReply: (open: boolean) => void
  hasReplies: boolean
}

function CommentReplyForm({
  parentComment,
  user,
  challenge,
  discussionPost,
  setOpenReply,
  hasReplies,
}: CommentReplyFormProps) {
  const defaultEmptyState = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '',
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }

  const [richContent, setRichContent] = useState<any>(defaultEmptyState)
  const [editorKey, setEditorKey] = useState(0)
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

    // Extract text from Lexical content for validation
    const textContent = extractTextFromLexicalContent(richContent.root).trim()
    if (!textContent || status === 'executing') return

    setStatus('executing')
    setError(null)

    let optimisticId: string | null = null

    try {
      // Add optimistic comment
      optimisticId = addOptimisticComment({
        content: '', // Empty for new comments
        richContent: richContent,
        user: user,
        challenge: challenge || undefined,
        discussionPost: discussionPost || undefined,
        parent: parentComment,
        status: 'approved',
        deleted: false,
        likes: 0,
        likedBy: [],
        flaggedReports: 0,
      })

      // Reset editor to default empty state and force remount
      setRichContent(defaultEmptyState)
      setEditorKey((prev) => prev + 1)
      setOpenReply(false)

      // Clean empty paragraphs before sending to server
      const cleanedRichContent = removeTrailingEmptyParagraphs(richContent)

      const result = await createComment({
        richContent: cleanedRichContent,
        user,
        challenge,
        discussionPost,
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
    setRichContent(defaultEmptyState)
    setEditorKey((prev) => prev + 1)
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
        <LexicalEditor
          key={editorKey}
          value={richContent}
          onChange={setRichContent}
          placeholder="Add a reply..."
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
            isDisabled={status === 'executing'}
          >
            Cance
          </Button>
          <Button
            variant="solid"
            colorScheme="gray"
            type="submit"
            size="md"
            isDisabled={
              !extractTextFromLexicalContent(richContent.root).trim() || status === 'executing'
            }
          >
            {status === 'executing' ? 'Posting...' : 'Reply'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentReplyForm
