import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const { key } = await request.json()

  try {
    revalidateTag(key)
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (error) {
    return NextResponse.json({ message: `Failed to revalidate: ${error}` }, { status: 500 })
  }
}
