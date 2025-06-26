import { User } from '@/payload-types'
import { payload } from '@/lib/payloadClient'

/**
 * Calculates the total number of comments a user has made
 */
async function calculateUserNumComments({ user }: { user: User }): Promise<number> {
  // Validate user ID before querying
  if (!user?.id || isNaN(Number(user.id))) {
    console.error('Invalid user ID provided:', user?.id)
    return 0 // Return 0 comments for invalid users
  }

  try {
    const comments = await payload.find({
      collection: 'comments',
      where: {
        user: {
          equals: user.id,
        },
      },
    })

    return comments.docs.length
  } catch (error) {
    console.error('Error fetching user comments:', error)
    return 0 // Return 0 comments on error
  }
}

export { calculateUserNumComments }
