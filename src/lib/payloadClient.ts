import { getPayload } from 'payload'
import config from '@payload-config'

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null

try {
  payloadInstance = await getPayload({ config })
} catch (error) {
  // Log error but don't crash - let the app handle null payload gracefully
  console.error('[PayloadClient] Failed to initialize Payload:', error)
}

export const payload = payloadInstance
