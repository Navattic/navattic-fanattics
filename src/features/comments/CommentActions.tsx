import { useState } from 'react'
import { Button, Icon } from '@/components/ui'
import { Comment, User } from '@/payload-types'
import { toggleLike } from './actions'

export function CommentActions({
  setOpenReply,
  openReply,
  comment: initialComment,
  user,
}: {
  setOpenReply: (open: boolean) => void
  openReply: boolean
  comment: Comment
  user: User | null
}) {
  const [comment, setComment] = useState(initialComment)
  const isLiked = user ? (comment.likedBy as User[])?.some((likedUser) => likedUser.id === user.id) : false

  const handleLike = async () => {
    if (!user) return
    try {
      const { likes, isLiked } = await toggleLike({
        commentId: comment.id,
        userId: user.id,
      })
      setComment((prev) => ({
        ...prev,
        likes,
        likedBy: isLiked
          ? [...(prev.likedBy as User[]), user]
          : (prev.likedBy as User[])?.filter((likedUser) => likedUser.id !== user.id) || [],
      }))
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

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
      <Button variant="ghost" size="sm">
        <Icon name="ellipsis" size="sm" />
      </Button>
    </div>
  )
}
