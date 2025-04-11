'use client'

import Avatar from '@/components/ui/Avatar'
import { User, Comment, Challenge } from '@/payload-types'
import { useState } from 'react'
import CommentReplyForm from '@/features/comments/CommentReplyForm'
import { CommentActions } from '@/features/comments/CommentActions'
import { formatPostDate } from '@/utils/formatDate'
import { CommentEditForm } from '@/features/comments/CommentEditForm'
import { softDeleteComment } from '@/features/comments/actions'
import { Icon } from '../Icon'

export function CommentBlock({
  comment: initialComment,
  user,
  challenge,
  isLastChildOfParent,
  hasChild,
  hasParent,
  parentHasSiblings,
}: {
  comment: Comment
  user: User
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
      const updatedComment = await softDeleteComment(comment.id)
      setComment(updatedComment)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const regularBorder = hasChild
  const sideBorder = parentHasSiblings && (hasChild || hasParent) && !isLastChildOfParent
  const noBorder = isLastChildOfParent && !hasChild
  return (
    <>
      <div key={comment.id} className="flex flex-col">
        {!noBorder && sideBorder && (
          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-300" />
        )}
        <div className="flex items-center mt-[22px]">
          <div className="mr-3">
            {comment.deleted ? (
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center">
                <Icon name="user" size="md" className="text-gray-600" />
              </div>
            ) : (
              <Avatar user={user} size="md" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {comment.deleted ? (
              <div className="text-base font-medium text-gray-600 capitalize">[removed]</div>
            ) : (
              <div className="text-base font-semibold text-gray-800 capitalize">
                {user.firstName} {user.lastName}
              </div>
            )}
            <div className="text-sm text-gray-400">• {formatPostDate(comment.createdAt)}</div>
          </div>
        </div>
        <div className="relative flex items-stretch">
          <div className="px-4 mr-3 self-stretch">
            {!noBorder && regularBorder && <div className="w-0.5 bg-gray-300 h-full" />}
          </div>
          <div className="flex-col w-full">
            {isEditing ? (
              <CommentEditForm
                commentId={comment.id}
                initialContent={comment.content}
                onCancel={() => setIsEditing(false)}
                onSuccess={(updatedComment) => {
                  setComment(updatedComment)
                  setIsEditing(false)
                }}
              />
            ) : comment.deleted ? (
              <div className="text-base text-gray-500 py-2">[comment deleted]</div>
            ) : (
              <div className="text-base text-gray-800">{comment.content}</div>
            )}
            {!comment.deleted && (
              <CommentActions
                setOpenReply={setOpenReply}
                openReply={openReply}
                comment={comment}
                user={user}
                setIsEditing={setIsEditing}
                onDelete={handleCommentDelete}
              />
            )}
          </div>
        </div>
      </div>
      {openReply && (
        <CommentReplyForm
          parentComment={comment}
          user={user}
          challenge={challenge}
          setOpenReply={setOpenReply}
          hasReplies={hasChild}
        />
      )}
    </>
  )
}
