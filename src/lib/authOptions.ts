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
    verifyRequest: '/login?verify=true',
    error: '/login', // Redirect errors back to login page
    newUser: '/auth-redirect',
  },
  providers: [
    EmailProvider({
      server: null,
      from: 'noreply@mail.navattic.dev',
      async sendVerificationRequest({ identifier: email, url }) {
        const payload = await getPayload({ config })
        const { host } = new URL(url)

        // Add email parameter to the URL
        const urlWithEmail = `${url}${url.includes('?') ? '&' : '?'}email=${encodeURIComponent(email)}`

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
                </head>

              <body style="background-color:#FCFCFD;padding:30px 0 50px 0;font-family:&quot;Helvetica Neue&quot;,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:560px;margin:0 auto;padding:40px 50px;background:#fff;border:1px solid #d8e2e7;border-radius:13px">
                  <tbody>
                    <tr style="width:100%">
                      <td>
                        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="display:flex">
                          <tbody>
                            <tr>
                              <td>
                              <td data-id="__react-email-column"><img src="https://app.navattic.com/email/navattic-logo.png" style="display:block;outline:none;border:none;text-decoration:none;width:100px;height:18px" /></td>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-top:30px">
                  <tbody>
                    <tr>
                      <td>
                        <h2 style="color:rgb(31,41,55);margin:0 auto;font-size:24px;line-height:1.4;font-weight:600;margin-bottom:20px">Sign in to the Fanattic Portal!</h2>
                        <p style="font-size:16px;line-height:160%;margin-top:16px;margin-bottom:16px">Click the button below to sign in to your account. If you didn&#x27;t request this, you can safely ignore this email.</p>
                        <a href='${urlWithEmail}' style="display:inline-block;text-align:center;text-decoration-line:none;font-weight:500;line-height:1.25rem;cursor:pointer;padding-top:0.5rem;padding-bottom:0.5rem;font-size:0.875rem;border-radius:0.5rem;padding-left:0.75rem;padding-right:0.75rem;background-color:rgb(31,41,55);color:rgb(255,255,255);border-width:1px;border-style:solid;border-color:rgb(6,7,8);text-decoration:none;max-width:100%;mso-padding-alt:0px;padding:8px 12px 8px 12px" target="_blank">Sign in here
                        </a>

                        <p style="font-size:16px;line-height:160%;margin-top:48px;margin-bottom:16px">If you have any questions, please reach out to <a href="mailto:natalie.marcotullio@navattic.com" rel="noreferrer" style="color:rgb(29 64 175);text-decoration-line:none;line-height:160%" target="_blank">natalie.marcotullio@navattic.com</a></p>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </td>
                </tr>
                </tbody>
                </table>
              </body>
            </html>
          `,
        })
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
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

            // Throw a specific error instead of returning false
            if (attemptedMethod === 'google') {
              throw new Error('use_email')
            } else {
              throw new Error('use_google')
            }
          }
          return true
        }

        return true
      } catch (error) {
        console.error('Error in SignIn Callback:', error)
        // Re-throw the specific error if it's a login method mismatch
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
        let emailParam = urlObj.searchParams.get('email')

        // If no email in URL params, try to get it from the token
        if (!emailParam && url.includes('callback') && url.includes('token')) {
          const token = urlObj.searchParams.get('token')
          const identifier = urlObj.searchParams.get('identifier')
          if (identifier) {
            emailParam = identifier
          }
        }

        // For callback URLs (when user clicks email link), redirect to register
        if (url.includes('callback') && url.includes('token')) {
          return `${baseUrl}/register`
        }

        // Handle error redirects - redirect back to login with error parameter
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
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as User).roles
      }
      return token
    },
  },
}
