'use client'

import CommentForm from '@/features/comments/CommentForm'
import CommentSection from '@/features/comments/CommentSection'
import { User, Challenge, Comment } from '@/payload-types'
import { OptimisticCommentsProvider } from '@/features/comments/OptimisticCommentsContext'
import { CommentErrorBoundary } from '@/features/comments/ErrorBoundary'

export const Comments = ({
  user,
  challenge,
}: {
  user: User
  challenge: Challenge & { comments: Comment[] }
}) => {
  return (
    <CommentErrorBoundary>
      <OptimisticCommentsProvider>
        <div className="w-full py-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-medium">Comments</h2>
            <CommentForm user={user} challenge={challenge} />
            <CommentSection challenge={challenge} />
          </div>
        </div>
      </OptimisticCommentsProvider>
    </CommentErrorBoundary>
  )
}
