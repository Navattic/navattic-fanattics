'use server'

import { payload } from '@/lib/payloadClient'
import { User, Challenge, Comment, DiscussionPost } from '@/payload-types'
import { revalidateTag, revalidatePath } from 'next/cache'
import { extractTextFromLexicalContent } from '@/utils/commentContent'

export async function createComment({
  richContent,
  user,
  challenge,
  discussionPost,
  parentComment,
}: {
  richContent: any
  user: User
  challenge?: Challenge
  discussionPost?: DiscussionPost
  parentComment?: Comment
}) {
  if (!richContent) {
    throw new Error('Comment content is required')
  }

  // Extract text from Lexical content for validation
  const textContent = extractTextFromLexicalContent(richContent.root).trim()
  if (!textContent) {
    throw new Error('Comment content cannot be empty')
  }

  try {
    const result = await payload.create({
      collection: 'comments',
      data: {
        richContent: richContent,
        content: '',
        user: user.id,
        challenge: challenge?.id || null,
        discussionPost: discussionPost?.id || null,
        parent: parentComment?.id || null,
        status: 'approved',
      },
    })

    // Simple revalidation without delays
    revalidateTag('challenge-data')
    revalidateTag('discussion-data')

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

  const currentLikedBy = Array.isArray(comment.likedBy)
    ? (comment.likedBy as User[]).filter((u) => u && typeof u === 'object' && u.id)
    : []
  const isCurrentlyLiked = currentLikedBy.some((u) => u.id === user.id)
  const newLikes = Math.max(0, (comment.likes || 0) + amount) // Prevent negative likes

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

export async function updateComment({
  commentId,
  richContent,
}: {
  commentId: Comment['id']
  richContent: any
}): Promise<Comment> {
  if (!richContent) {
    throw new Error('Comment content is required')
  }

  // Extract text from Lexical content for validation
  const textContent = extractTextFromLexicalContent(richContent.root).trim()
  if (!textContent) {
    throw new Error('Comment content cannot be empty')
  }

  try {
    const result = await payload.update({
      collection: 'comments',
      id: commentId,
      data: {
        richContent: richContent,
        // Clear old content field when updating to richContent
        content: '',
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
