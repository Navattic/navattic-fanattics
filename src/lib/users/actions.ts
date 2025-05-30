'use server'

import { calculateUserPoints } from './points'
import type { User } from '@/payload-types'

export async function getUserPoints(user: User) {
  return calculateUserPoints({ user })
} 