'use client'

import { User, Comment, Challenge } from '@/payload-types'
import { useState } from 'react'
import CommentReplyForm from '@/features/comments/CommentReplyForm'
import { CommentActions } from '@/features/comments/CommentActions'
import { formatPostDate } from '@/utils/formatDate'
import { CommentEditForm } from '@/features/comments/CommentEditForm'
import { softDeleteComment } from '@/features/comments/actions'
import { Icon, Avatar } from '@/components/ui'
import { OpenProfileDrawer } from '../UserProfilePreviewModal/OpenProfileDrawer'
import { OptimisticComment } from '@/features/comments/OptimisticCommentsContext'

// Type guard to check if comment is optimistic
function isOptimisticComment(comment: Comment | OptimisticComment): comment is OptimisticComment {
  return 'isOptimistic' in comment && comment.isOptimistic === true
}

export function CommentBlock({
  comment: initialComment,
  currentUser,
  challenge,
  hasChild,
  isLastChildOfParent,
  hasParent,
  parentHasSiblings,
}: {
  comment: Comment | OptimisticComment
  currentUser: User
  challenge: Challenge
  hasChild: boolean
  isLastChildOfParent: boolean
  hasParent: boolean
  parentHasSiblings: boolean
}) {
  const [openReply, setOpenReply] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [comment, setComment] = useState(initialComment)

  const handleCommentDelete = async () => {
    try {
      const updatedComment = await softDeleteComment(comment.id as number)
      setComment(updatedComment)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const regularBorder = hasChild
  const sideBorder = parentHasSiblings && (hasChild || hasParent) && !isLastChildOfParent
  const noBorder = isLastChildOfParent && !hasChild

  // Don't show actions for optimistic comments
  const showActions = !isOptimisticComment(comment)

  const commentAuthor = comment.user as User

  return (
    <>
      <div key={comment.id} className="flex flex-col">
        {!noBorder && sideBorder && (
          <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-300" />
        )}
        <div className="mt-[22px] flex items-center">
          <div className="mr-3">
            {comment.deleted ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-100">
                <Icon name="user" size="md" className="text-gray-600" />
              </div>
            ) : (
              <Avatar user={commentAuthor} size="md" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {comment.deleted ? (
              <div className="text-base font-medium text-gray-600">[removed]</div>
            ) : commentAuthor ? (
              <OpenProfileDrawer
                user={commentAuthor}
                className="cursor-pointer text-base font-semibold text-gray-800 capitalize hover:underline"
              >
                {commentAuthor.firstName} {commentAuthor.lastName}
              </OpenProfileDrawer>
            ) : (
              <div className="text-base font-medium text-gray-600">[User not found]</div>
            )}
            <div className="text-sm text-gray-400">
              •
              <span className="ml-2 inline-flex text-gray-500">
                {isOptimisticComment(comment) ? (
                  <div className="inline-flex items-center gap-1">
                    posting <Icon name="spinner" size="sm" />
                  </div>
                ) : (
                  formatPostDate(comment.createdAt)
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="relative flex items-stretch">
          <div className="mr-3 self-stretch px-4">
            {!noBorder && regularBorder && <div className="h-full w-0.5 bg-gray-300" />}
          </div>
          <div className="w-full flex-col">
            {isEditing && !isOptimisticComment(comment) ? (
              <CommentEditForm
                commentId={comment.id as number}
                initialContent={comment.content}
                onCancel={() => setIsEditing(false)}
                onSuccess={(updatedComment) => {
                  setComment(updatedComment)
                  setIsEditing(false)
                }}
              />
            ) : comment.deleted ? (
              <div className="py-2 text-base text-gray-500">[comment deleted]</div>
            ) : (
              <div className="text-base text-gray-800">{comment.content}</div>
            )}
            {!comment.deleted && showActions && (
              <CommentActions
                setOpenReply={setOpenReply}
                openReply={openReply}
                comment={comment}
                user={currentUser}
                setIsEditing={setIsEditing}
                onDelete={handleCommentDelete}
              />
            )}
          </div>
        </div>
      </div>
      {openReply && showActions && (
        <CommentReplyForm
          parentComment={comment}
          user={currentUser}
          challenge={challenge}
          setOpenReply={setOpenReply}
          hasReplies={hasChild}
        />
      )}
    </>
  )
}
