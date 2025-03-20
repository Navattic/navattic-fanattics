import { User, Challenge, Comment } from '@/payload-types'
import { payload } from '@/lib/payloadClient'
import { CommentBlock } from '@/components/ui/Comments/Comments'
import { cn } from '@/lib/utils'

function CommentTree({
  comment,
  user,
  challenge,
  repliesMap,
}: {
  comment: Comment
  user: User
  challenge: Challenge
  repliesMap: Record<string, Comment[]>
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

const CommentSection = async ({ challenge }: { challenge: Challenge }) => {
  const comments = (
    await payload.find({
      collection: 'comments',
      where: {
        challenge: {
          equals: challenge.id,
        },
      },
    })
  ).docs

  const commentHasNoParent = comments.filter((comment: Comment) => comment.parent === null)

  // Create a map of comments by their parent ID for efficient reply lookup
  const repliesMap = comments.reduce(
    (acc, comment) => {
      if (comment.parent && typeof comment.parent === 'object') {
        const parentId = comment.parent.id
        if (!acc[parentId]) {
          acc[parentId] = []
        }
        acc[parentId].push(comment)
      }
      return acc
    },
    {} as Record<string, Comment[]>,
  )

  return (
    <div>
      {commentHasNoParent.map((comment: Comment) => {
        const user = comment.user as User
        return (
          <CommentTree
            key={comment.id}
            comment={comment}
            user={user}
            challenge={challenge}
            repliesMap={repliesMap}
          />
        )
      })}
    </div>
  )
}

export default CommentSection
