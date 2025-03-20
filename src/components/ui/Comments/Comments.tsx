'use client'

import Avatar from '@/components/ui/Avatar'
import { User, Comment, Challenge } from '@/payload-types'
import { useState } from 'react'
import CommentReplyForm from '@/features/comments/CommentReplyForm'
import { CommentActions } from '@/features/comments/CommentActions'

export function CommentBlock({
  comment,
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

  const regularBorder = hasChild
  const sideBorder = parentHasSiblings && (hasChild || hasParent) && !isLastChildOfParent
  const noBorder = isLastChildOfParent && !hasChild

  // (hasParent && parentHasSiblings) && !hasChild && !isLastChildOfParent
  return (
    <>
      <div key={comment.id} className="flex flex-col">
        {!noBorder && sideBorder && (
          <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-300" />
        )}
        <div className="flex items-center mt-4">
          <div className="mr-3">
            <Avatar user={user} size="thumbnail" />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-base font-semibold text-gray-800 capitalize">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-400">• 4d ago</div>
            {/* <div className="text-xs">
              {`${hasParent ? 'has parent' : 'no parent'}`}
              <br />
              {`${hasChild ? 'has child' : 'no child'}`}
              <br />
              {`${isLastChildOfParent ? 'is last child of parent' : 'is not last child of parent'}`}
              <br />
              {`${parentHasSiblings ? 'parent has siblings' : 'parent has no siblings'}`}
            </div> */}
          </div>
        </div>
        <div className="relative flex items-stretch">
          <div className="px-4 mr-3 self-stretch">
            {!noBorder && regularBorder && <div className="w-0.5 bg-gray-300 h-full" />}
          </div>
          <div className="flex-col">
            <div className="text-base text-gray-800">{comment.content}</div>
            <CommentActions
              setOpenReply={setOpenReply}
              openReply={openReply}
              comment={comment}
              user={user}
            />
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
