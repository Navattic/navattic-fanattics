'use client'

import { Button, Icon } from '@/components/ui'
import { useOptimistic, startTransition } from 'react'
import { adjustLikes } from './actions'
import { Comment, User } from '@/payload-types'

function OptimisticLikeCounter({ comment, currentUser }: { comment: Comment; currentUser: User }) {
  const { likedBy, likes, user } = comment

  const isLikedByCurrentUser =
    Array.isArray(likedBy) && likedBy.some((user: User) => user.id === currentUser.id)

  const [optimisticState, addOptimisticUpdate] = useOptimistic(
    {
      likes: likes || 0,
      isLikedByCurrentUser,
    },
    (state, action: 'like' | 'unlike') => ({
      likes: action === 'like' ? state.likes + 1 : state.likes - 1,
      isLikedByCurrentUser: action === 'like',
    }),
  )

  const handleLikeToggle = async () => {
    const action = optimisticState.isLikedByCurrentUser ? 'unlike' : 'like'
    const amount = action === 'like' ? 1 : -1

    startTransition(() => {
      addOptimisticUpdate(action)
    })
    await adjustLikes({ amount, user: user as User, comment: comment as Comment })
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLikeToggle}>
      <Icon
        name={optimisticState.isLikedByCurrentUser ? 'thumbs-up-filled' : 'thumbs-up'}
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
