import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { getPayload, User } from 'payload'
import config from '@/payload.config'
import { v4 } from 'uuid'
import { Adapter, AdapterUser } from 'next-auth/adapters'

// TODO: change email address to .com for prod

// Add this custom adapter before the authOptions
function PayloadAdapter(): Adapter {
  return {
    async createUser(data: AdapterUser) {
      const payload = await getPayload({ config })
      const user = await payload.create({
        collection: 'users',
        data: {
          email: data.email,
          firstName: data.name?.split(' ')[0] || 'Unknown',
          lastName: data.name?.split(' ')[1] || 'User',
          roles: ['user'],
          loginMethod: 'email',
          password: v4(),
        },
      })
      return {
        id: String(user.id), // Convert to string
        email: user.email,
        emailVerified: null,
        name: `${user.firstName} ${user.lastName}`,
      }
    },
    async getUser(id: string) {
      const payload = await getPayload({ config })
      const user = await payload.findByID({ collection: 'users', id })
      return user
        ? {
            id: String(user.id),
            email: user.email,
            emailVerified: null,
            name: `${user.firstName} ${user.lastName}`,
          }
        : null
    },
    async getUserByEmail(email: string) {
      const payload = await getPayload({ config })
      const [user] = (
        await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
        })
      ).docs
      return user
        ? {
            id: String(user.id),
            email: user.email,
            emailVerified: null,
            name: `${user.firstName} ${user.lastName}`,
          }
        : null
    },
    async createVerificationToken(params: { identifier: string; token: string; expires: Date }) {
      const payload = await getPayload({ config })
      const token = await payload.create({
        collection: 'verification-tokens',
        data: {
          ...params,
          expires: params.expires.toISOString(),
        },
      })
      return {
        identifier: token.identifier,
        token: token.token,
        expires: new Date(token.expires),
      }
    },
    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const payload = await getPayload({ config })
      try {
        const [verificationToken] = (
          await payload.find({
            collection: 'verification-tokens',
            where: {
              identifier: { equals: identifier },
              token: { equals: token },
            },
          })
        ).docs

        if (!verificationToken) return null

        await payload.delete({
          collection: 'verification-tokens',
          id: verificationToken.id,
        })

        return {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
          expires: new Date(verificationToken.expires),
        }
      } catch (error) {
        return null
      }
    },
    // Required but not used with JWT strategy
    async getUserByAccount() {
      return null
    },
    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
      return {
        id: user.id,
        email: user.email ?? '',
        emailVerified: null,
        name: user.name ?? '',
      }
    },
    async deleteUser() {
      return undefined
    },
    async linkAccount() {
      return undefined
    },
    async unlinkAccount() {
      return undefined
    },
    async createSession(session) {
      return {
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      }
    },
    async getSessionAndUser() {
      return null
    },
    async updateSession() {
      return undefined
    },
    async deleteSession() {
      return undefined
    },
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PayloadAdapter(),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?verify=true', // Page shown after email is sent
  },
  providers: [
    EmailProvider({
      server: null,
      from: 'noreply@mail.navattic.dev',
      async sendVerificationRequest({ identifier: email, url }) {
        const payload = await getPayload({ config })
        const { host } = new URL(url)

        await payload.sendEmail({
          to: email,
          from: 'noreply@mail.navattic.dev',
          subject: `Sign in to ${host}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <title>Sign in to ${host}</title>
                <style>
                  .container { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                  }
                  .button {
                    background-color: #0070f3;
                    border-radius: 5px;
                    color: white;
                    display: inline-block;
                    padding: 12px 24px;
                    text-decoration: none;
                    text-align: center;
                    margin: 20px 0;
                  }
                  .footer {
                    color: #666;
                    font-size: 12px;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Sign in to ${host}</h1>
                  <p>Click the button below to sign in to your account:</p>
                  <a href="${url}" class="button">Sign in</a>
                  <p>If you didn't request this email, you can safely ignore it.</p>
                  <div class="footer">
                    <p>This link will expire in 24 hours.</p>
                    <p>If the button above doesn't work, you can copy and paste this URL into your browser:</p>
                    <p>${url}</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        })
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
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
              loginMethod: (account?.provider === 'google' ? 'google' : 'email') as
                | 'google'
                | 'email',
              password: v4(),
            },
          })
        }

        return true
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
