'use client'

import { Button, Icon } from '@/components/ui'
import { Comment, User } from '@/payload-types'
import { toggleLike } from './actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/shadcn/ui/dropdown-menu'
import { useState } from 'react'

interface CommentActionsProps {
  setOpenReply: (open: boolean) => void
  openReply: boolean
  comment: Comment
  user: User | null
  setIsEditing: (isEditing: boolean) => void
}

export function CommentActions({
  setOpenReply,
  openReply,
  comment: initialComment,
  user,
  setIsEditing,
}: CommentActionsProps) {
  const [comment, setComment] = useState(initialComment)

  const isLiked = user
    ? (comment.likedBy as User[])?.some((likedUser) => likedUser.id === user.id)
    : false

  const handleLike = async () => {
    if (!user) return

    const currentLikes = comment.likes || 0
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1
    const newLikedBy = isLiked
      ? (comment.likedBy as User[]).filter((u) => u.id !== user.id)
      : [...((comment.likedBy as User[]) || []), user]

    // Optimistic update
    setComment((prev) => ({
      ...prev,
      likes: newLikes,
      likedBy: newLikedBy,
    }))

    try {
      await toggleLike({
        commentId: comment.id,
        userId: user.id,
      })
    } catch (error) {
      console.error('Error handling like:', error)
      // Revert to the original state on error
      setComment(initialComment)
    }
  }

  const isCurrentUserComment = user?.id === (comment.user as User)?.id

  return (
    <div className="flex gap-1 my-3">
      <Button variant="ghost" size="sm" onClick={handleLike}>
        <Icon
          name={isLiked ? 'thumbs-up-filled' : 'thumbs-up'}
          size="sm"
          className="-translate-y-px"
        />
        <span className="min-w-5">{comment.likes === 0 ? 'Like' : comment.likes}</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpenReply(!openReply)}>
        <Icon name="reply" size="sm" className="-translate-y-[2px]" />
        Reply
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Icon name="ellipsis" size="sm" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => console.log('Award points')}>
            <Icon name="coins" size="sm" className="mr-1 text-gray-500" />
            Award Points
          </DropdownMenuItem>
          {!isCurrentUserComment && (
            <DropdownMenuItem onClick={() => console.log('Report comment')}>
              <Icon name="flag" size="sm" className="mr-1" />
              Report Comment
            </DropdownMenuItem>
          )}
          {isCurrentUserComment && (
            <>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Icon name="pencil" size="sm" className="mr-1 text-gray-500" />
                Edit Comment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => console.log('Delete comment')}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Icon name="trash" size="sm" className="mr-1 text-red-500" />
                Delete Comment
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
