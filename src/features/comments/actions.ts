'use server'

import { payload } from '@/lib/payloadClient'
import { User, Challenge, Comment } from '@/payload-types'
import { revalidateTag } from 'next/cache'

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

    revalidateTag('challenge-data')
    return result
  } catch (error) {
    console.error('Error creating comment:', error)
    throw new Error('Failed to create comment')
  }
}

export const adjustLikes = async ({
  amount,
  comment,
  user,
}: {
  amount: number
  comment: Comment
  user: User
}): Promise<{ likes: number; isLiked: boolean }> => {
  if (!amount) {
    return {
      likes: comment.likes || 0,
      isLiked: (comment.likedBy as User[])?.some((u) => u.id === user.id) || false,
    }
  }

  const currentLikedBy = (comment.likedBy as User[]) || []
  const isCurrentlyLiked = currentLikedBy.some((u) => u.id === user.id)
  const newLikes = (comment.likes || 0) + amount

  let newLikedBy: User[]
  if (amount > 0 && !isCurrentlyLiked) {
    // Adding like - add user if not already there
    newLikedBy = [...currentLikedBy, user]
  } else if (amount < 0 && isCurrentlyLiked) {
    // Removing like - remove user
    newLikedBy = currentLikedBy.filter((u) => u.id !== user.id)
  } else {
    // No change needed
    newLikedBy = currentLikedBy
  }

  const updatedComment = await payload.update({
    collection: 'comments',
    id: comment.id,
    data: {
      likes: newLikes,
      likedBy: newLikedBy.map((u) => u.id), // Payload expects IDs
    },
  })

  // Fix: Use the same cache key as the challenge data
  revalidateTag('challenge-data')

  return {
    likes: updatedComment.likes || 0,
    isLiked: newLikedBy.some((u) => u.id === user.id),
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
      depth: 10,
    })
    return result.docs
  } catch (error) {
    console.error('Error fetching comments:', error)
    throw new Error('Failed to fetch comments')
  }
}

export async function updateComment({
  commentId,
  content,
}: {
  commentId: Comment['id']
  content: Comment['content']
}): Promise<Comment> {
  if (!content.trim()) {
    throw new Error('Comment content cannot be empty')
  }

  try {
    const result = await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        content: content.trim(),
      },
      depth: 1, // Ensure we get the full comment object with relationships
    })

    return result
  } catch (error) {
    console.error('Error updating comment:', error)
    throw new Error('Failed to update comment')
  }
}

export async function softDeleteComment(commentId: number): Promise<Comment> {
  try {
    const result = await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        deleted: true,
      },
      depth: 1, // Ensure we get the full comment object with relationships
    })

    return result
  } catch (error) {
    console.error('Error soft deleting comment:', error)
    throw new Error('Failed to delete comment')
  }
}
