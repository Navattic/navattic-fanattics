import { JWT, NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { getPayload, User } from 'payload'
import config from '@/payload.config'
import { v4 } from 'uuid'
import { Adapter, AdapterUser } from 'next-auth/adapters'

function PayloadAdapter(): Adapter {
  return {
    async createUser(data: AdapterUser & { account?: { provider: string } }) {
      const payload = await getPayload({ config })
      const user = await payload.create({
        collection: 'users',
        data: {
          email: data.email,
          firstName: data.name?.split(' ')[0] || '',
          lastName: data.name?.split(' ')[1] || '',
          roles: ['user'],
          loginMethod: data.account?.provider === 'google' ? 'google' : 'email',
          password: v4(),
          timezone: 'UTC',
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
      } catch (_error) {
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
    verifyRequest: '/login?verify=true',
    error: '/login', // Redirect errors back to login page
    newUser: '/auth-redirect',
  },
  providers: [
    EmailProvider({
      server: null,
      from: 'noreply@mail.navattic.dev',
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          const delay = process.env.NODE_ENV === 'production' ? 100 : 10 // race condition fix
          await new Promise((resolve) => setTimeout(resolve, delay))

          const payload = await getPayload({ config })

          const { host } = new URL(url)
          const urlWithEmail = `${url}${url.includes('?') ? '&' : '?'}email=${encodeURIComponent(email)}`

          const startTime = Date.now()
          await payload.sendEmail({
            to: email,
            from: 'noreply@mail.navattic.dev',
            subject: `Sign in to ${host}`,
            html: `
              <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html dir="ltr" lang="en">
                <head>
                  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
                  <meta name="x-apple-disable-message-reformatting" />
                  <title>Sign in to Fanattic Portal</title>
                </head>
                <body style="background-color:#FCFCFD;padding:30px 0 50px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
                  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:560px;margin:0 auto;padding:40px 50px;background:#fff;border:1px solid #d8e2e7;border-radius:13px">
                    <tbody>
                      <tr style="width:100%">
                        <td>
                          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                            <tbody>
                              <tr>
                                <td style="padding-bottom:30px">
                                  <img src="https://app.navattic.com/email/navattic-logo.png" alt="Navattic" style="display:block;outline:none;border:none;text-decoration:none;width:100px;height:18px" />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          
                          <h2 style="color:rgb(31,41,55);margin:0 0 20px 0;font-size:24px;line-height:1.4;font-weight:600">
                            Welcome to Fanattic Portal
                          </h2>
                          
                          <p style="font-size:16px;line-height:160%;margin:16px 0;color:#374151">
                            Click the secure link below to sign in to your Fanattic Portal account. This link will expire in 24 hours for your security.
                          </p>
                          
                          <div style="margin:32px 0">
                            <a href='${urlWithEmail}' 
                              style="display:inline-block;background-color:#1f2937;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:500;font-size:16px;border:none">
                              Sign in to Fanattic Portal
                            </a>
                          </div>
                          
                          <p style="font-size:14px;line-height:160%;margin:32px 0 16px 0;color:#6b7280">
                            If you didn't request this sign-in link, you can safely ignore this email. 
                            No account changes will be made.
                          </p>
                          
                          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0" />
                          
                          <p style="font-size:14px;line-height:160%;margin:16px 0;color:#6b7280">
                            Need help? Contact us at 
                            <a href="mailto:fanattic@navattic.com" style="color:#2563eb;text-decoration:none">
                              fanattic@navattic.com
                            </a>
                          </p>
                          
                          <p style="font-size:12px;color:#9ca3af;margin:16px 0 0 0">
                            This email was sent by Navattic, Inc. | Fanattic Portal
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </body>
              </html>
            `,
          })
        } catch (error) {
          console.error('[Auth] Failed to send magic link:', error)
          if (process.env.NODE_ENV === 'production') {
            console.error('[Auth] Production error details:', {
              name: error instanceof Error ? error.name : 'Unknown',
              message: error instanceof Error ? error.message : String(error),
            })
          }
          throw new Error('Failed to send verification email')
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture, // Extract profile picture
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const { email } = user
      if (!email) return false

      const payload = await getPayload({ config })
      try {
        const existingUser = await payload.find({
          collection: 'users',
          where: { email: { equals: email } },
        })

        if (existingUser.docs.length > 0) {
          const currentUser = existingUser.docs[0]
          const attemptedMethod = account?.provider === 'google' ? 'google' : 'email'

          if (currentUser.loginMethod !== attemptedMethod) {
            console.error(
              `User attempted to sign in with ${attemptedMethod} but account uses ${currentUser.loginMethod}`,
            )

            // Throw specific error that NextAuth will pass through
            const error = attemptedMethod === 'google' ? 'use_email' : 'use_google'
            throw new Error(error)
          }
          return true
        }

        return true
      } catch (error) {
        console.error('Error in SignIn Callback:', error)
        // Re-throw specific login method mismatch errors
        if (
          error instanceof Error &&
          (error.message === 'use_email' || error.message === 'use_google')
        ) {
          throw error
        }
        return false
      }
    },
    async redirect({ url, baseUrl }) {
      // If the URL is already pointing to /register, don't interfere
      if (url.includes('/register')) {
        return url
      }

      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

      try {
        const urlObj = new URL(fullUrl)

        // For callback URLs (when user clicks email link)
        if (url.includes('callback') && url.includes('token')) {
          // Instead of always going to /register, go to /auth-redirect
          // Let auth-redirect decide based on onboarding status
          return `${baseUrl}/auth-redirect`
        }

        // Handle error redirects
        if (url.includes('/api/auth/error')) {
          const errorParam = urlObj.searchParams.get('error')
          if (errorParam === 'use_email') {
            return `${baseUrl}/login?error=use_email`
          } else if (errorParam === 'use_google') {
            return `${baseUrl}/login?error=use_google`
          }
          return `${baseUrl}/login?error=generic`
        }

        return url.startsWith(baseUrl) ? url : baseUrl
      } catch (error) {
        console.error('Redirect error:', error)
        return baseUrl
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.roles = (user as User).roles
        token.name = user.name
        token.email = user.email
        token.image = user.image
      } else if (token.sub && !token.roles) {
        // If we have a user ID but no user data, fetch it from the database
        // This happens on subsequent sign-ins (like magic link clicks)
        try {
          const payload = await getPayload({ config })
          const dbUser = await payload.findByID({
            collection: 'users',
            id: token.sub,
          })

          if (dbUser) {
            token.roles = dbUser.roles
            token.name = `${dbUser.firstName} ${dbUser.lastName}`
            token.email = dbUser.email
            token.image = (typeof dbUser.avatar === 'object' && dbUser.avatar?.url) || token.image
          }
        } catch (error) {
          console.error('[Auth] Error fetching user data from database:', error)
        }
      }

      // Store the provider information
      if (account?.provider) {
        token.provider = account.provider
      }

      // Extract image from Google id_token if available
      if (account?.provider === 'google' && account.id_token) {
        try {
          const payload = JSON.parse(
            Buffer.from(account.id_token.split('.')[1], 'base64').toString(),
          )
          if (payload.picture) {
            // Get higher quality image by replacing s96-c with s192-c or s400-c
            const highQualityImage = payload.picture.replace('s96-c', 's192-c')
            token.image = highQualityImage
          }
        } catch (error) {
          console.error('[Auth] Error parsing id_token:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      // Pass the token data to the session
      if (token) {
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.image as string
        session.user.roles = token.roles as string[]
        session.user.provider = token.provider as JWT['provider']
      }
      return session
    },
  },
}
