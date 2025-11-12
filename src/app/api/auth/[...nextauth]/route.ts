import NextAuth from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getInitializationError } from '@/lib/payloadClient'

// Check if Payload initialization failed and log it
const initError = getInitializationError()
if (initError) {
  console.error('[NextAuth Route] Payload initialization error detected:', initError)
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
