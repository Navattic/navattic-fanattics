import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { v4 } from 'uuid' 


export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
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
      } catch (error) {
        console.error('Error in SignIn Callback:', error)
        return false
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as any).roles
      }

      return token
    },
  },
}
