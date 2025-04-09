import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      roles?: string[]
    }
    isNewUser?: boolean
  }

  interface JWT {
    isNewUser?: boolean
    roles?: string[]
  }
}
