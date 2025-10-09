import { User, Challenge, Comment, DiscussionPost } from '@/payload-types'
import { CommentBlock } from '@/components/ui/Comments/Comments'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'
import { CommentSkeleton } from '@/components/ui/Skeletons/CommentSkeleton'
import { useOptimisticComments, OptimisticComment } from './OptimisticCommentsContext'

interface UserStats {
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

function CommentTree({
  comment,
  currentUser,
  challenge,
  discussionPost,
  repliesMap,
  userStatsMap,
}: {
  comment: Comment | OptimisticComment
  currentUser: User
  challenge?: Challenge
  discussionPost?: DiscussionPost
  repliesMap: Record<string, (Comment | OptimisticComment)[]>
  userStatsMap?: Map<number, UserStats>
}) {
  const replies = repliesMap[comment.id] || []
  const hasChild = replies.length > 0
  // Check if this comment is the last in its parent's replies list
  const parentId = (comment.parent as Comment)?.id
  const parentReplies = parentId ? repliesMap[parentId] || [] : []
  // Only consider last reply if it doesn't have its own replies
  const isLastChildOfParent = parentReplies[parentReplies.length - 1]?.id === comment.id

  const hasParent = comment.parent !== null
  const parentHasSiblings = parentReplies.length > 1
  return (
    <div className="w-full">
      <CommentBlock
        comment={comment}
        currentUser={currentUser}
        challenge={challenge}
        discussionPost={discussionPost}
        hasChild={hasChild}
        hasParent={hasParent}
        isLastChildOfParent={isLastChildOfParent}
        parentHasSiblings={parentHasSiblings}
        userStatsMap={userStatsMap}
      />
      {replies.map((reply) => {
        return (
          <div className={cn('relative flex pl-4')} key={reply.id}>
            <div className="h-9 w-[20px] rounded-bl-2xl border-b-2 border-l-2 border-gray-200"></div>
            <CommentTree
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              challenge={challenge}
              discussionPost={discussionPost}
              repliesMap={repliesMap}
              userStatsMap={userStatsMap}
            />
          </div>
        )
      })}
    </div>
  )
}

const CommentSection = ({
  challenge,
  discussionPost,
  currentUser,
  userStatsMap,
}: {
  challenge?: Challenge & { comments: Comment[] }
  discussionPost?: DiscussionPost & { comments: Comment[] }
  currentUser: User
  userStatsMap?: Map<number, UserStats>
}) => {
  const entity = challenge || discussionPost
  const { optimisticComments, realComments } = useOptimisticComments()

  // Merge real comments with optimistic comments
  // Include both entity.comments and realComments from context
  const allComments: (Comment | OptimisticComment)[] = [
    ...optimisticComments, // Optimistic comments first
    ...realComments, // Real comments from context
    ...(entity?.comments.filter((comment) => comment.status === 'approved' && !comment.deleted) || []),
  ]

  // Remove duplicates (in case a comment exists in both realComments and challenge.comments)
  const uniqueComments = allComments.filter(
    (comment, index, self) => index === self.findIndex((c) => c.id === comment.id),
  )

  // Then separate them in memory
  const topLevelComments = uniqueComments.filter((comment) => !comment.parent)
  const replies = uniqueComments.filter((comment) => comment.parent)

  // Build replies map from the replies query
  const repliesMap = replies.reduce(
    (acc, comment) => {
      if (comment.parent && typeof comment.parent === 'object') {
        const parentId = comment.parent.id
        acc[parentId] = acc[parentId] || []
        acc[parentId].push(comment)
      }
      return acc
    },
    {} as Record<string, (Comment | OptimisticComment)[]>,
  )

  return (
    <div>
      {topLevelComments.map((comment) => {
        return (
          <Suspense key={comment.id} fallback={<CommentSkeleton />}>
            <CommentTree
              comment={comment}
              currentUser={currentUser}
              challenge={challenge}
              discussionPost={discussionPost}
              repliesMap={repliesMap}
              userStatsMap={userStatsMap}
            />
          </Suspense>
        )
      })}
    </div>
  )
}

export default CommentSection
