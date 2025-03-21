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

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/shadcn/ui/dialog'

interface CommentActionsProps {
  setOpenReply: (open: boolean) => void
  openReply: boolean
  comment: Comment
  user: User | null
  setIsEditing: (isEditing: boolean) => void
  onDelete: () => void
}

export function CommentActions({
  setOpenReply,
  openReply,
  comment: initialComment,
  user,
  setIsEditing,
  onDelete,
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
        <DropdownMenuContent align="end" className="w-48 rounded-xl">
          {user?.roles?.includes('admin') && (
            <DropdownMenuItem
              onClick={() => console.log('Award points')}
              className="hover:bg-gray-100 rounded-lg !h-8 px-3 pr-2.5 py-0"
            >
              <Icon name="coins" size="sm" className="mr-1 text-gray-500" />
              Award Points
            </DropdownMenuItem>
          )}
          {!isCurrentUserComment && (
            <DropdownMenuItem
              onClick={() => console.log('Report comment')}
              className="hover:bg-gray-100 rounded-lg !h-8 px-3 pr-2.5 py-0"
            >
              <Icon name="flag" size="sm" className="mr-1" />
              Report Comment
            </DropdownMenuItem>
          )}
          {isCurrentUserComment && (
            <>
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                className="hover:bg-gray-100 rounded-lg !h-8 px-3 pr-2.5 py-0"
              >
                <Icon name="pencil" size="sm" className="mr-1 text-gray-500" />
                Edit Comment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50 rounded-t-sm rounded-b-lg !h-8 px-3 pr-2.5 py-0"
                  >
                    <Icon name="trash" size="sm" className="mr-1 text-red-500" />
                    Delete Comment
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className='rounded-xl'>
                  <DialogHeader>
                    <DialogTitle className="text-base text-gray-800">Delete Comment</DialogTitle>
                    <DialogDescription className="text-balance text-base">
                      Are you sure you want to delete this comment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button size='md' variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button size='md' variant="solid" colorScheme='red' onClick={onDelete}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
