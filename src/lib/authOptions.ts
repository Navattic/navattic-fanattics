import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getPayload, User } from 'payload'
import config from '@/payload.config'
import { v4 } from 'uuid'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login', // Use your custom sign-in page
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { email, name } = user

      if (!email) {
        return false
      }

      const payload = await getPayload({ config })

      try {
        const existingUser = await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
        })

        if (!existingUser.docs.length) {
          const [firstName, lastName] = name?.split(' ') || ['Unknown', 'User']

          await payload.create({
            collection: 'users',
            data: {
              email,
              firstName,
              lastName,
              roles: ['user'],
              loginMethod: 'google',
              password: v4(), // generate a random password for Google auth users
            },
          })
        }

        return true // Always return true to continue the flow
      } catch (error) {
        console.error('Error in SignIn Callback:', error)
        return false
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as User).roles
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect logic
      if (url.startsWith(baseUrl)) {
        // Redirect all successful logins to a middleware page, which will determine if they're a new user
        return `${baseUrl}/auth-redirect`
      }
      return url
    },
  },
}
