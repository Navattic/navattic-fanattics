import type { CollectionConfig } from 'payload'
import { formatSlug } from '../utils/formatSlug'
import { resend } from '@/lib/resendClient'

export const DiscussionPosts: CollectionConfig = {
  slug: 'discussionPosts',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Data',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 300,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (auto-generated)',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ operation, value, data, ...args }) => {
            if (operation === 'create') {
              return formatSlug('title')({ operation, value, data, ...args })
            }
            return value
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published', 'archived'],
      defaultValue: 'published',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'lastActivity',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ operation }) => {
            if (operation === 'create') {
              return new Date()
            }
          },
        ],
      },
    },
    {
      name: 'discussionComments',
      type: 'join',
      collection: 'comments',
      on: 'discussionPost',
      hasMany: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // Set lastActivity when post is created or updated
        if (operation === 'create' || operation === 'update') {
          data.lastActivity = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Only send notification for new discussion post creation
        if (operation === 'create') {
          try {
            // Check if author is already populated or just an ID
            let author
            if (typeof doc.author === 'object' && doc.author.id) {
              // Author is already populated
              author = doc.author
            } else {
              // Author is just an ID, fetch the full object
              author = await req.payload.findByID({
                collection: 'users',
                id: doc.author,
              })
            }

            const { data, error } = await resend.emails.send({
              from:
                process.env.NODE_ENV === 'production'
                  ? 'Fanattics Portal <team@mail.navattic.com>'
                  : 'Fanattics Portal <noreply@mail.navattic.dev>',
              to: ['fanattic@navattic.com'],
              subject: 'New Discussion Post - Fanattics Portal',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    New Discussion Post
                  </h2>
                  
                  <p>A new discussion post has been created in the Fanattics Portal:</p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Post Details</h3>
                    <p><strong>Title:</strong> ${doc.title}</p>
                    <p><strong>Author:</strong> ${author.firstName || ''} ${author.lastName || ''} (${author.email})</p>
                    <p><strong>Company:</strong> ${author.company?.name || 'Not specified'}</p>
                    <p><strong>Status:</strong> ${doc.status}</p>
                    <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Slug:</strong> ${doc.slug}</p>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    This notification was automatically sent when a new discussion post was created in the Fanattics Portal.
                  </p>
                </div>
              `,
            })

            if (error) {
              console.error('Error sending new discussion post notification email:', error)
            } else {
              console.log('New discussion post notification email sent successfully:', data)
            }
          } catch (error) {
            console.error('Failed to send new discussion post notification email:', error)
          }
        }
      },
    ],
  },
}
