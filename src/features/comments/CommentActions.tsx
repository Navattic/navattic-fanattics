'use client'

import { Button, Icon } from '@/components/ui'
import { Comment, User } from '@/payload-types'
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
import OptimisticLikeCounter from './OptimisticLikeCounter'

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

  const isCurrentUserComment = user?.id === (comment.user as User)?.id

  return (
    <div className="my-3 flex gap-1">
      <OptimisticLikeCounter comment={comment} currentUser={user as User} />
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
          {/* {user?.roles?.includes('admin') && (
            <DropdownMenuItem
              onClick={() => console.log('Award points')}
              className="!h-8 rounded-lg px-3 py-0 pr-2.5 hover:bg-gray-100"
            >
              <Icon name="coins" size="sm" className="mr-1 text-gray-500" />
              Award Points
            </DropdownMenuItem>
          )} */}
          {/* {!isCurrentUserComment && (
            <DropdownMenuItem
              onClick={() => console.log('Report comment')}
              className="!h-8 rounded-lg px-3 py-0 pr-2.5 hover:bg-gray-100"
            >
              <Icon name="flag" size="sm" className="mr-1" />
              Report Comment
            </DropdownMenuItem>
          )} */}
          {isCurrentUserComment && (
            <>
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                className="!h-8 rounded-lg px-3 py-0 pr-2.5 hover:bg-gray-100"
              >
                <Icon name="pencil" size="sm" className="mr-1 text-gray-500" />
                Edit Comment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="!h-8 rounded-t-sm rounded-b-lg px-3 py-0 pr-2.5 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                  >
                    <Icon name="trash" size="sm" className="mr-1 text-red-500" />
                    Delete Comment
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="text-base text-gray-800">Delete Comment</DialogTitle>
                    <DialogDescription className="text-base text-balance">
                      Are you sure you want to delete this comment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button size="md" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button size="md" variant="solid" colorScheme="red" onClick={onDelete}>
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
