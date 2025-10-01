'use client'

import { Button, Icon } from '@/components/ui'
import { useState, useEffect, useCallback } from 'react'
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
  const { likedBy, likes } = comment

  // Use useCallback to memoize the function
  const checkIsLikedByCurrentUser = useCallback(
    (likedByArray: (User | string | number)[]) => {
      return (
        Array.isArray(likedByArray) &&
        likedByArray.some((item) =>
          typeof item === 'object' ? item.id === currentUser.id : item === currentUser.id,
        )
      )
    },
    [currentUser.id],
  )

  const isLikedByCurrentUser = checkIsLikedByCurrentUser(likedBy || [])

  // Use local state for optimistic updates
  const [optimisticState, setOptimisticState] = useState({
    likes: likes || 0,
    isLiked: isLikedByCurrentUser,
  })
  const [isPending, setIsPending] = useState(false)

  // Sync optimistic state with comment prop changes
  useEffect(() => {
    const newIsLiked = checkIsLikedByCurrentUser(likedBy || [])
    setOptimisticState({
      likes: likes || 0,
      isLiked: newIsLiked,
    })
  }, [likes, likedBy, currentUser.id, checkIsLikedByCurrentUser])

  const handleLikeToggle = async () => {
    // Don't allow liking optimistic comments
    if (isPending || comment.isOptimistic) return

    const currentLikes = optimisticState.likes
    const currentIsLiked = optimisticState.isLiked
    const action = currentIsLiked ? 'unlike' : 'like'
    const amount = action === 'like' ? 1 : -1

    // Optimistic update - be explicit about the new values
    const newLikes = Math.max(0, currentLikes + amount) // Prevent negative likes
    const newIsLiked = action === 'like'

    setOptimisticState({
      likes: newLikes,
      isLiked: newIsLiked,
    })
    setIsPending(true)

    try {
      const result = await adjustLikes({
        amount,
        user: currentUser,
        comment: comment as Comment,
      })

      // Update with server response
      setOptimisticState({
        likes: result.likes,
        isLiked: result.isLiked,
      })
    } catch (error) {
      console.error('Error adjusting likes:', error)
      // Revert to the state before the optimistic update
      setOptimisticState({
        likes: currentLikes,
        isLiked: currentIsLiked,
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
