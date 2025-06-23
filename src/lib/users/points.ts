import { User } from '@/payload-types'
import { payload } from '@/lib/payloadClient'

/**
 * Calculates the total points for a user based on their activities
 */
async function calculateUserPoints({ user }: { user: User }): Promise<number> {
  // Validate user ID before querying
  if (!user?.id || isNaN(Number(user.id))) {
    console.warn('Invalid user ID provided:', user?.id)
    return 0 // Return 0 points for invalid users
  }

  try {
    const ledger = await payload.find({
      collection: 'ledger',
      where: {
        user_id: {
          equals: user.id,
        },
      },
    })

    return ledger.docs.reduce((total, entry) => total + (entry.amount || 0), 0)
  } catch (error) {
    console.error('Error fetching user points:', error)
    return 0 // Return 0 points on error
  }
}

export { calculateUserPoints }
