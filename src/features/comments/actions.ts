'use server'

import { payload } from '@/lib/payloadClient'
import { User, Challenge, Comment } from '@/payload-types'

export async function createComment({
  commentContent,
  user,
  challenge,
  parentComment,
}: {
  commentContent: string | undefined
  user: User
  challenge: Challenge
  parentComment?: Comment
}) {
  if (!commentContent) {
    throw new Error('Comment content is required')
  }

  const trimmedContent = commentContent.trim()
  if (!trimmedContent) {
    throw new Error('Comment content cannot be empty')
  }

  try {
    const result = await payload.create({
      collection: 'comments',
      data: {
        content: trimmedContent,
        user: user.id,
        challenge: challenge.id,
        parent: parentComment?.id || null,
      },
    })

    return result
  } catch (error) {
    console.error('Error creating comment:', error)
    throw new Error('Failed to create comment')
  }
}

export async function toggleLike({
  commentId,
  userId,
}: {
  commentId: number
  userId: number
}): Promise<{ likes: number; isLiked: boolean }> {
  try {
    const comment = await payload.findByID({
      collection: 'comments',
      id: commentId,
    })

    const isLiked = (comment.likedBy as User[])?.some((user) => user.id === userId) || false

    const updatedComment = await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        likes: isLiked ? (comment.likes || 0) - 1 : (comment.likes || 0) + 1,
        likedBy: isLiked
          ? (comment.likedBy as User[])?.filter((user) => user.id !== userId) || []
          : [...(comment.likedBy as User[]), userId],
      },
    })

    return {
      likes: updatedComment.likes || 0,
      isLiked: !isLiked,
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    throw new Error('Failed to toggle like')
  }
}

export async function getComments(challengeId: number): Promise<Comment[]> {
  try {
    const result = await payload.find({
      collection: 'comments',
      where: {
        challenge: { equals: challengeId },
        status: { equals: 'approved' },
      },
      depth: 2,
    })
    return result.docs
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw new Error('Failed to fetch comments')
  }
}
