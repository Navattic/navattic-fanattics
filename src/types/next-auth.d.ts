import 'next-auth'

declare module 'next-auth' {
  export interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      roles?: string[]
      provider?: 'google' | 'email'
    }
    isNewUser?: boolean
  }

  export interface JWT {
    isNewUser?: boolean
    roles?: string[]
    provider?: 'google' | 'email'
  }
}
