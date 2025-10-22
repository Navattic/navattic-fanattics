'use client'

import CommentForm from '@/features/comments/CommentForm'
import CommentSection from '@/features/comments/CommentSection'
import { User, Challenge, Comment, DiscussionPost } from '@/payload-types'
import { OptimisticCommentsProvider } from '@/features/comments/OptimisticCommentsContext'
import { CommentErrorBoundary } from '@/features/comments/ErrorBoundary'
import { Empty } from '@/components/ui'

interface UserStats {
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

export const Comments = ({
  user,
  challenge,
  discussionPost,
  userStatsMap,
}: {
  user: User
  challenge?: Challenge & { comments: Comment[] }
  discussionPost?: DiscussionPost & { comments: Comment[] }
  userStatsMap?: Map<number, UserStats>
}) => {
  const entity = challenge || discussionPost
  const entityType = challenge ? 'challenge' : 'discussion'
  return (
    <CommentErrorBoundary>
      <OptimisticCommentsProvider>
        <div className="w-full py-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-md font-medium">
              Comments{' '}
              {entity?.comments && entity.comments.length > 0 && `(${entity.comments.length})`}
            </h2>
            <CommentForm user={user} challenge={challenge} discussionPost={discussionPost} />
            {entity?.comments && entity.comments.length > 0 ? (
              <CommentSection
                challenge={challenge}
                discussionPost={discussionPost}
                currentUser={user}
                userStatsMap={userStatsMap}
              />
            ) : (
              <div className="mt-8">
                <Empty
                  title="No comments yet"
                  description={`Be the first to comment on this ${entityType}!`}
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
