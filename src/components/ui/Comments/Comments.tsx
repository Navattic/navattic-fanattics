'use client'

import Avatar from '@/components/ui/Avatar'
import { Button, Icon } from '@/components/ui'
import { User, Comment, Challenge } from '@/payload-types'
import { useState } from 'react'
import CommentReplyForm from '@/features/comments/CommentReplyForm'

export function CommentWithNoParent({
  comment,
  user,
  challenge,
  hasReplies,
}: {
  comment: Comment
  user: User
  challenge: Challenge
  hasReplies: boolean
}) {
  const [openReply, setOpenReply] = useState(false)

  return (
    <>
      <div key={comment.id} className="flex flex-col">
        <div className="flex items-center mt-6">
          <div className="mr-3">
            <Avatar user={user} size="thumbnail" />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-800 capitalize">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-400">• 4d ago</div>
            <div className="text-sm text-gray-400">{hasReplies ? 'has replies' : 'no replies'}</div>
          </div>
        </div>
        <div className="relative flex items-stretch">
          <div className="px-4 mr-3 self-stretch">
            {hasReplies && <div className="w-0.5 bg-gray-300 h-full"></div>}
          </div>
          <div className="flex-col">
            <div className="text-sm text-gray-800">{comment.content}</div>
            <CommentActions setOpenReply={setOpenReply} openReply={openReply} />
          </div>
        </div>
      </div>
      {openReply && (
        <CommentReplyForm
          parentComment={comment}
          user={user}
          challenge={challenge}
          setOpenReply={setOpenReply}
          hasReplies={hasReplies}
        />
      )}
    </>
  )
}

export function CommentReply({
  comment,
  user,
  challenge,
}: {
  comment: Comment
  user: User
  challenge: Challenge
}) {
  const [openReply, setOpenReply] = useState(false)

  return (
    <>
      <div key={comment.id} className="flex flex-col">
        <div className="flex items-center mt-8">
          <div className="mr-3">
            <Avatar user={user} size="thumbnail" />
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-800 capitalize">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-400">• 4d ago</div>
          </div>
        </div>
        <div className="relative flex items-stretch">
          <div className="px-4 mr-3 self-stretch">
            <div className="w-0.5 bg-gray-300 h-full"></div>
          </div>
          <div className="flex-col">
            <div className="text-sm text-gray-800">{comment.content}</div>
            <CommentActions setOpenReply={setOpenReply} openReply={openReply} />
          </div>
        </div>
      </div>
      {openReply && (
        <CommentReplyForm
          parentComment={comment}
          user={user}
          challenge={challenge}
          setOpenReply={setOpenReply}
        />
      )}
    </>
  )
}

const CommentActions = ({
  setOpenReply,
  openReply,
}: {
  setOpenReply: (open: boolean) => void
  openReply: boolean
}) => {
  return (
    <div className="flex gap-1 my-3">
      <Button variant="ghost" size="sm">
        <Icon name="thumbs-up" size="sm" className="-translate-y-0.5" />
        Like
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpenReply(!openReply)}>
        <Icon name="reply" size="sm" className="-translate-y-[3px]" />
        Reply
      </Button>
      <Button variant="ghost" size="sm">
        <Icon name="ellipsis" size="sm" />
      </Button>
    </div>
  )
}
