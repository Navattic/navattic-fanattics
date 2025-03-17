import { User } from '@/payload-types'
import { getPayload } from 'payload'
import config from '@/payload.config'

const payload = await getPayload({ config })

/**
 * Calculates the total points for a user based on their activities
 */
async function calculateUserPoints({ user }: { user: User }): Promise<number> {
  const ledger = await payload.find({
    collection: 'ledger',
    where: {
      user_id: {
        equals: user.id,
      },
    },
  })

  return ledger.docs.reduce((total, entry) => total + entry.amount, 0)
}

export { calculateUserPoints }
