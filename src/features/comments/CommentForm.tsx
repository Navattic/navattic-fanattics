'use client'

import { useState, useEffect, useRef } from 'react'
import { Avatar, Icon, Button, LexicalEditor } from '@/components/ui'
import { Challenge, User, DiscussionPost } from '@/payload-types'
import { createComment } from './actions'
import { useOptimisticComments } from './OptimisticCommentsContext'
import {
  extractTextFromLexicalContent,
  removeTrailingEmptyParagraphs,
} from '@/utils/commentContent'

interface CommentFormProps {
  user: User
  challenge?: Challenge
  discussionPost?: DiscussionPost
}

function CommentForm({ user, challenge, discussionPost }: CommentFormProps) {
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
      optimisticId = addOptimisticComment({
        content: '', // Empty for new comments
        richContent: richContent,
        user: user,
        challenge: challenge || undefined,
        discussionPost: discussionPost || undefined,
        parent: null,
        status: 'approved',
        deleted: false,
        likes: 0,
        likedBy: [],
        flaggedReports: 0,
      })

      // Reset editor to default empty state and force remount
      setRichContent(defaultEmptyState)
      setEditorKey((prev) => prev + 1)

      // Clean empty paragraphs before sending to server
      const cleanedRichContent = removeTrailingEmptyParagraphs(richContent)

      // Wait for server response
      const result = await createComment({
        richContent: cleanedRichContent,
        user,
        challenge,
        discussionPost,
      })

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
    setRichContent(defaultEmptyState)
    setEditorKey((prev) => prev + 1)
    setError(null)
  }

  return (
    <div className="flex gap-3">
      <div>
        <Avatar user={user} showCompany={true} />
      </div>
      <form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
        <LexicalEditor
          key={editorKey}
          value={richContent}
          onChange={setRichContent}
          placeholder="Leave a comment..."
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
            disabled={
              !extractTextFromLexicalContent(richContent.root).trim() || status === 'executing'
            }
          >
            {status === 'executing' ? 'Posting' : 'Post comment'}
            {status === 'executing' && <Icon name="spinner" size="sm" />}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CommentForm
