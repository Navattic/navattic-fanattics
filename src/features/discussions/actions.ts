'use server'

import { payload } from '@/lib/payloadClient'
import { User } from '@/payload-types'

export async function createDiscussionPost({
  title,
  content,
  author,
}: {
  title: string
  content: any
  author: User
}) {
  try {
    const result = await payload.create({
      collection: 'discussionPosts',
      data: {
        title,
        content,
        author: author.id,
        status: 'published',
      },
    })

    return result
  } catch (error) {
    console.error('Error creating discussion post:', error)
    throw new Error('Failed to create discussion post')
  }
}
