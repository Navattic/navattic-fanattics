'use client'

import { Button, Icon } from '@/components/ui'
import { useState } from 'react'
import { adjustLikes } from './actions'
import { Comment, User } from '@/payload-types'

// Extend Comment type to include optimistic flag
interface ExtendedComment extends Comment {
  isOptimistic?: boolean
}

function OptimisticLikeCounter({
  comment,
  currentUser,
}: {
  comment: ExtendedComment
  currentUser: User
}) {
  const { likedBy, likes, user } = comment

  const isLikedByCurrentUser =
    Array.isArray(likedBy) &&
    likedBy.some((item) =>
      typeof item === 'object' ? item.id === currentUser.id : item === currentUser.id,
    )

  // Use local state for optimistic updates
  const [optimisticState, setOptimisticState] = useState({
    likes: likes || 0,
    isLiked: isLikedByCurrentUser,
  })
  const [isPending, setIsPending] = useState(false)

  const handleLikeToggle = async () => {
    // Don't allow liking optimistic comments
    if (isPending || comment.isOptimistic) return

    const action = optimisticState.isLiked ? 'unlike' : 'like'
    const amount = action === 'like' ? 1 : -1

    // Optimistic update
    setOptimisticState((prev) => ({
      likes: action === 'like' ? prev.likes + 1 : prev.likes - 1,
      isLiked: action === 'like',
    }))
    setIsPending(true)

    try {
      const result = await adjustLikes({ amount, user: user as User, comment: comment as Comment })

      // Update with server response
      setOptimisticState({
        likes: result.likes,
        isLiked: result.isLiked,
      })
    } catch (error) {
      console.error('Error adjusting likes:', error)
      // Revert optimistic update on error
      setOptimisticState({
        likes: likes || 0,
        isLiked: isLikedByCurrentUser,
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLikeToggle}
      disabled={isPending || comment.isOptimistic}
    >
      <Icon
        name={optimisticState.isLiked ? 'thumbs-up-filled' : 'thumbs-up'}
        size="sm"
        className="-translate-y-px"
      />
      <span className="min-w-5">
        {optimisticState.likes === 0 ? 'Like' : optimisticState.likes}
      </span>
    </Button>
  )
}

export default OptimisticLikeCounter
