import { formatSlug } from '@/utils/formatSlug'
import type { CollectionConfig } from 'payload'
import { v4 as uuidv4 } from 'uuid'
import { resend } from '@/lib/resendClient'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Data',
  },
  auth: {
    tokenExpiration: 28800,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
    },
    verify: false,
  },
  access: {
    create: () => true, // allow anyone to create a user
    read: ({ req: { user } }) => {
      return (
        user?.roles?.includes('admin') || {
          id: {
            equals: user?.id,
          },
        }
      )
    },
    update: ({ req: { user } }) => {
      return (
        user?.roles?.includes('admin') || {
          id: {
            equals: user?.id,
          },
        }
      )
    },
    delete: ({ req: { user } }) => (user?.roles?.includes('admin') ? true : false),
    admin: ({ req: { user } }) => (user?.roles?.includes('admin') ? true : false),
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (!data.user_id) {
          data.user_id = uuidv4()
        }
        return data
      },
      // Add timezone validation hook
      async ({ data, operation }) => {
        if (operation === 'update' && data.timezone) {
          try {
            // Test the timezone
            Intl.DateTimeFormat(undefined, { timeZone: data.timezone })
          } catch (_error) {
            throw new Error(
              `Invalid timezone: ${data.timezone}. Please select a valid timezone from the dropdown.`,
            )
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Only send notification for new user creation
        if (operation === 'create') {
          try {
            const { data, error } = await resend.emails.send({
              from:
                process.env.NODE_ENV === 'production'
                  ? 'Fanattic Portal <team@mail.navattic.com>'
                  : 'Fanattic Portal <noreply@mail.navattic.dev>',
              to: ['fanattic@navattic.com'],
              subject: 'New User Registration - Fanattic Portal',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    New User Registration
                  </h2>
                  
                  <p>A new user has registered for the Fanattic Portal:</p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">User Details</h3>
                    <p><strong>Name:</strong> ${doc.firstName || ''} ${doc.lastName || ''}</p>
                    <p><strong>Email:</strong> ${doc.email}</p>
                    <p><strong>Title:</strong> ${doc.title || 'Not specified'}</p>
                    <p><strong>Company:</strong> ${doc.company || 'Not specified'}</p>
                    <p><strong>Location:</strong> ${doc.location || 'Not specified'}</p>
                    <p><strong>Login Method:</strong> ${doc.loginMethod}</p>
                    <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
                    ${doc.linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${doc.linkedinUrl}" target="_blank">${doc.linkedinUrl}</a></p>` : ''}
                    ${doc.interactiveDemoUrl ? `<p><strong>Interactive Demo:</strong> <a href="${doc.interactiveDemoUrl}" target="_blank">${doc.interactiveDemoUrl}</a></p>` : ''}
                    ${doc.bio ? `<p><strong>Bio:</strong> ${doc.bio}</p>` : ''}
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    This notification was automatically sent when a new user registered for the Fanattic Portal.
                  </p>
                </div>
              `,
            })

            if (error) {
              console.error('Error sending new user notification email:', error)
            } else {
              console.log('New user notification email sent successfully:', data)
            }
          } catch (error) {
            console.error('Failed to send new user notification email:', error)
          }
        }
      },
    ],
  },
  fields: [
    // Email added by default
    { name: 'firstName', type: 'text' },
    { name: 'lastName', type: 'text' },
    { name: 'title', type: 'text', admin: { description: 'e.g. CEO, CTO, etc.' } },
    { name: 'email', type: 'email', defaultValue: undefined },
    { name: 'location', type: 'text' },
    { name: 'linkedinUrl', type: 'text', label: 'LinkedIn profile URL' },
    { name: 'interactiveDemoUrl', type: 'text', label: 'Interactive demo URL' },
    { name: 'bio', type: 'text' },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      required: false,
      label: 'Company',
    },
    {
      name: 'avatar',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      relationTo: 'avatars',
      required: false,
    },
    {
      name: 'loginMethod',
      type: 'select',
      required: true,
      defaultValue: 'email',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Email', value: 'email' },
      ],
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      defaultValue: ['user'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'slug',
      label: 'Slug (auto-generated)',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug(['firstName', 'lastName'])],
      },
    },
    {
      name: 'user_id',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hidden: true,
      defaultValue: undefined,
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return uuidv4()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'ledgerEntries',
      type: 'join',
      collection: 'ledger',
      on: 'user_id',
      hasMany: true,
    },
    {
      name: 'userComments',
      type: 'join',
      collection: 'comments',
      on: 'user',
      hasMany: true,
    },
    {
      name: 'onboardingCompleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the user has completed the onboarding process',
      },
    },
    {
      name: 'timezone',
      type: 'text',
      required: true,
      defaultValue: 'UTC',
      admin: {
        description:
          "User's timezone (IANA format, e.g., 'America/New_York', 'Europe/London', 'UTC')",
        placeholder: 'e.g., America/New_York',
        components: {
          Field: '@/components/payload/autocomplete-timezone',
        },
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Timezone is required'

        try {
          Intl.DateTimeFormat(undefined, { timeZone: value })
          return true
        } catch {
          return 'Invalid timezone format. Use IANA format like "America/New_York" or "Europe/London"'
        }
      },
    },
  ],
}
