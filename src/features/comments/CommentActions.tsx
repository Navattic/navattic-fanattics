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
import { useOptimistic, startTransition } from 'react'

interface CommentActionsProps {
  setOpenReply: (open: boolean) => void
  openReply: boolean
  comment: Comment
  user: User | null
  onCommentUpdate: (updatedComment: Comment) => void
  setIsEditing: (isEditing: boolean) => void
  isEditing: boolean
}

export function CommentActions({
  setOpenReply,
  openReply,
  comment,
  user,
  onCommentUpdate = () => {},
  setIsEditing,
  isEditing,
}: CommentActionsProps) {
  const [optimisticComment, addOptimistic] = useOptimistic(
    comment,
    (currentComment, updatedComment: Comment) => updatedComment,
  )

  const isLiked = user
    ? (optimisticComment.likedBy as User[])?.some((likedUser) => likedUser.id === user.id)
    : false

  const handleLike = async () => {
    if (!user) return

    startTransition(() => {
      const currentLikes = optimisticComment.likes || 0
      const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1
      const newLikedBy = isLiked
        ? (optimisticComment.likedBy as User[]).filter((u) => u.id !== user.id)
        : [...((optimisticComment.likedBy as User[]) || []), user]

      addOptimistic({
        ...optimisticComment,
        likes: newLikes,
        likedBy: newLikedBy,
      })
    })

    try {
      const { likes, isLiked } = await toggleLike({
        commentId: optimisticComment.id,
        userId: user.id,
      })

      const updatedComment = {
        ...optimisticComment,
        likes,
        likedBy: isLiked
          ? [...(optimisticComment.likedBy as User[]), user]
          : (optimisticComment.likedBy as User[]).filter((u) => u.id !== user.id),
      }

      onCommentUpdate(updatedComment)
    } catch (error) {
      console.error('Error handling like:', error)
      // Automatic rollback happens here via useOptimistic
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
        <span className="min-w-5">
          {optimisticComment.likes === 0 ? 'Like' : optimisticComment.likes}
        </span>
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
