'use client'

import CommentForm from '@/features/comments/CommentForm'
import CommentSection from '@/features/comments/CommentSection'
import { User, Challenge, Comment } from '@/payload-types'
import { OptimisticCommentsProvider } from '@/features/comments/OptimisticCommentsContext'
import { CommentErrorBoundary } from '@/features/comments/ErrorBoundary'
import { Empty } from '@/components/ui'

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
            <h2 className="text-md font-medium">
              Comments {challenge.comments.length > 0 && `(${challenge.comments.length})`}
            </h2>
            <CommentForm user={user} challenge={challenge} />
            {challenge.comments.length > 0 ? (
              <CommentSection challenge={challenge} currentUser={user} />
            ) : (
              <div className="mt-4">
                <Empty
                  title="No comments yet"
                  description="Be the first to comment on this challenge!"
                  iconName="message-circle"
                />
              </div>
            )}
          </div>
        </div>
      </OptimisticCommentsProvider>
    </CommentErrorBoundary>
  )
}
