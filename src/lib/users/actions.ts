'use server'

import { calculateUserPoints } from './points'
import type { User } from '@/payload-types'
import { payload } from '@/lib/payloadClient'

export async function getUserPoints(user: User) {
  return calculateUserPoints({ user })
}

export async function getTotalPointsEarned(user: User) {
  if (!user?.id || isNaN(Number(user.id))) {
    console.warn('Invalid user ID provided:', user?.id)
    return 0
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

    // Only sum up positive entries
    return ledger.docs
      .filter((entry) => entry.amount > 0)
      .reduce((total, entry) => total + (entry.amount || 0), 0)
  } catch (error) {
    console.error('Error fetching user points:', error)
    return 0
  }
}
