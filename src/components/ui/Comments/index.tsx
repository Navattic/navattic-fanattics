'use client'

import { useState } from 'react'
import CommentForm from '@/features/comments/CommentForm'
import CommentSection from '@/features/comments/CommentSection'
import { User, Challenge, Comment } from '@/payload-types'

type OptimisticComment = Omit<Comment, 'id'> & { id: string }

export const Comments = ({
  user,
  challenge,
}: {
  user: User
  challenge: Challenge & { comments: Comment[] }
}) => {
  const [optimisticComments, setOptimisticComments] = useState<OptimisticComment[]>([])

  const addOptimisticComment = (comment: OptimisticComment) => {
    console.log('Adding optimistic comment:', comment)
    setOptimisticComments((prev) => {
      const newComments = [...prev, comment]
      console.log('New optimistic comments:', newComments)
      return newComments
    })
  }

  const removeOptimisticComment = (tempId: string) => {
    console.log('Removing optimistic comment:', tempId)
    setOptimisticComments((prev) => {
      const filteredComments = prev.filter((c) => String(c.id) !== tempId)
      console.log('Remaining optimistic comments:', filteredComments)
      return filteredComments
    })
  }

  // Combine server comments with optimistic comments
  const allComments: (Comment | OptimisticComment)[] = [
    ...challenge.comments,
    ...optimisticComments,
  ]

  console.log('All comments (server + optimistic):', allComments.length)
  console.log('Server comments:', challenge.comments.length)
  console.log('Optimistic comments:', optimisticComments.length)

  return (
    <div className="w-full py-10">
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-medium">Comments</h2>
        <CommentForm
          user={user}
          challenge={challenge}
          onOptimisticComment={addOptimisticComment}
          onRemoveOptimisticComment={removeOptimisticComment}
        />
        <CommentSection
          challenge={{ ...challenge, comments: allComments }}
          onOptimisticComment={addOptimisticComment}
          onRemoveOptimisticComment={removeOptimisticComment}
        />
      </div>
    </div>
  )
}
