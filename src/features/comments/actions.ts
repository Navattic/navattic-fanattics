'use server'

import { payload } from '@/lib/payloadClient'
import { User, Challenge, Comment } from '@/payload-types'

export async function createComment({
  commentContent,
  user,
  challenge,
  parentComment,
}: {
  commentContent: string
  user: User
  challenge: Challenge
  parentComment?: Comment
}) {
  if (!commentContent.trim()) {
    throw new Error('Comment content cannot be empty')
  }

  try {
    await payload.create({
      collection: 'comments',
      data: {
        content: commentContent,
        user: user.id,
        challenge: challenge.id,
        parent: parentComment?.id || null,
      },
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    throw new Error('Failed to create comment')
  }
}
