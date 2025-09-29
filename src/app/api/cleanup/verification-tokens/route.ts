import { NextRequest, NextResponse } from 'next/server'
import { payload } from '@/lib/payloadClient'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cleanup] Starting verification token cleanup...')
    const startTime = Date.now()

    // Delete expired verification tokens
    const result = await payload.delete({
      collection: 'verification-tokens',
      where: {
        expires: {
          less_than: new Date(),
        },
      },
    })

    const duration = Date.now() - startTime
    const deletedCount = result.docs?.length || 0

    console.log(`[Cleanup] Deleted ${deletedCount} expired verification tokens in ${duration}ms`)

    return NextResponse.json({
      success: true,
      deletedCount,
      duration,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cleanup] Error cleaning up verification tokens:', error)
    return NextResponse.json({ error: 'Failed to cleanup verification tokens' }, { status: 500 })
  }
}
