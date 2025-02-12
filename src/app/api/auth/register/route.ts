import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    return NextResponse.json({ message: 'User registered' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error registering user' }, { status: 500 })
  }
}

