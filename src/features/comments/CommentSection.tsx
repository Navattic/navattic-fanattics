import { User, Challenge, Comment } from '@/payload-types'
import { payload } from '@/lib/payloadClient'
import { CommentBlock } from '@/components/ui/Comments/Comments'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'
import { CommentSkeleton } from '@/components/ui/Skeletons/CommentSkeleton'

function CommentTree({
  comment,
  user,
  challenge,
  repliesMap,
  onCommentUpdate,
}: {
  comment: Comment
  user: User
  challenge: Challenge
  repliesMap: Record<string, Comment[]>
  onCommentUpdate: (updatedComment: Comment) => void
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
        onCommentUpdate={onCommentUpdate}
        comment={comment}
        user={user}
        challenge={challenge}
        hasChild={hasChild}
        hasParent={hasParent}
        isLastChildOfParent={isLastChildOfParent}
        parentHasSiblings={parentHasSiblings}
      />
      {replies.map((reply) => {
        const replyUser = reply.user as User
        return (
          <div className={cn('relative flex pl-4')} key={reply.id}>
            <div className="border-b-2 border-l-2 rounded-bl-2xl border-gray-200 h-9 w-[20px]"></div>
            <CommentTree
              onCommentUpdate={onCommentUpdate}
              key={reply.id}
              comment={reply}
              user={replyUser}
              challenge={challenge}
              repliesMap={repliesMap}
            />
          </div>
        )
      })}
    </div>
  )
}

const CommentSection = async ({
  challenge,
  onCommentUpdate,
}: {
  challenge: Challenge
  onCommentUpdate: (updatedComment: Comment) => void
}) => {
  // Query for top-level comments only
  const topLevelComments = (
    await payload.find({
      collection: 'comments',
      where: {
        challenge: { equals: challenge.id },
        parent: { equals: null },
      },
      limit: 100,
    })
  ).docs

  // Query for all replies in the challenge
  const allReplies = (
    await payload.find({
      collection: 'comments',
      where: {
        challenge: { equals: challenge.id },
        parent: { exists: true },
      },
      limit: 1000, // Higher limit for replies since they're often numerous
    })
  ).docs

  // Build replies map from the replies query
  const repliesMap = allReplies.reduce(
    (acc, comment) => {
      if (comment.parent && typeof comment.parent === 'object') {
        const parentId = comment.parent.id
        acc[parentId] = acc[parentId] || []
        acc[parentId].push(comment)
      }
      return acc
    },
    {} as Record<string, Comment[]>,
  )

  return (
    <div>
      {topLevelComments.map((comment: Comment) => {
        const user = comment.user as User
        return (
          <Suspense key={comment.id} fallback={<CommentSkeleton />}>
            <CommentTree
              onCommentUpdate={onCommentUpdate}
              comment={comment}
              user={user}
              challenge={challenge}
              repliesMap={repliesMap}
            />
          </Suspense>
        )
      })}
    </div>
  )
}

export default CommentSection
