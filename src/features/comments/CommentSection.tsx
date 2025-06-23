import { User, Challenge, Comment } from '@/payload-types'
import { CommentBlock } from '@/components/ui/Comments/Comments'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'
import { CommentSkeleton } from '@/components/ui/Skeletons/CommentSkeleton'

type OptimisticComment = Omit<Comment, 'id'> & { id: string }

function CommentTree({
  comment,
  user,
  challenge,
  repliesMap,
  onOptimisticComment,
  onRemoveOptimisticComment,
}: {
  comment: Comment | OptimisticComment
  user: User
  challenge: Challenge
  repliesMap: Record<string, (Comment | OptimisticComment)[]>
  onOptimisticComment?: (comment: OptimisticComment) => void
  onRemoveOptimisticComment?: (tempId: string) => void
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
        comment={comment as Comment}
        user={user}
        challenge={challenge}
        hasChild={hasChild}
        hasParent={hasParent}
        isLastChildOfParent={isLastChildOfParent}
        parentHasSiblings={parentHasSiblings}
        onOptimisticComment={onOptimisticComment}
        onRemoveOptimisticComment={onRemoveOptimisticComment}
      />
      {replies.map((reply) => {
        const replyUser = reply.user as User
        return (
          <div className={cn('relative flex pl-4')} key={reply.id}>
            <div className="h-9 w-[20px] rounded-bl-2xl border-b-2 border-l-2 border-gray-200"></div>
            <CommentTree
              key={reply.id}
              comment={reply}
              user={replyUser}
              challenge={challenge}
              repliesMap={repliesMap}
              onOptimisticComment={onOptimisticComment}
              onRemoveOptimisticComment={onRemoveOptimisticComment}
            />
          </div>
        )
      })}
    </div>
  )
}

const CommentSection = ({
  challenge,
  onOptimisticComment,
  onRemoveOptimisticComment,
}: {
  challenge: Challenge & { comments: (Comment | OptimisticComment)[] }
  onOptimisticComment?: (comment: OptimisticComment) => void
  onRemoveOptimisticComment?: (tempId: string) => void
}) => {
  const allComments = challenge.comments.filter(
    (comment) => comment.status === 'approved' && !comment.deleted,
  )

  // Then separate them in memory
  const topLevelComments = allComments.filter((comment) => !comment.parent)
  const replies = allComments.filter((comment) => comment.parent)

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
        const user = comment.user as User
        return (
          <Suspense key={comment.id} fallback={<CommentSkeleton />}>
            <CommentTree
              comment={comment}
              user={user}
              challenge={challenge}
              repliesMap={repliesMap}
              onOptimisticComment={onOptimisticComment}
              onRemoveOptimisticComment={onRemoveOptimisticComment}
            />
          </Suspense>
        )
      })}
    </div>
  )
}

export default CommentSection
