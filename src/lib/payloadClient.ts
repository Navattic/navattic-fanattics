import { getPayload } from 'payload'
import config from '@payload-config'

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null
let initializationError: Error | null = null

try {
  payloadInstance = await getPayload({ config })
} catch (error) {
  console.error('[PayloadClient] Failed to initialize Payload:', error)
  if (error instanceof Error) {
    initializationError = error
    console.error('[PayloadClient] Error message:', error.message)
    console.error('[PayloadClient] Error stack:', error.stack)
  }
}

export const payload = payloadInstance

// Export a helper to check if Payload is initialized
export function isPayloadInitialized(): boolean {
  return payloadInstance !== null
}

// Export initialization error for debugging
export function getInitializationError(): Error | null {
  return initializationError
}
