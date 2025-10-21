import type { CollectionConfig } from 'payload'
import { resend } from '@/lib/resendClient'

export const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    group: 'Data',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Update child comments to remove parent reference
        await req.payload.update({
          collection: 'comments',
          where: {
            parent: {
              equals: id,
            },
          },
          data: {
            parent: null, // TODO: verify that this doesn't break the parent-child relationship and that comments still render if the parent user is deleted
          },
        })
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Only send notification for new comment creation
        if (operation === 'create') {
          // Update lastActivity for discussion posts when a comment is added
          if (doc.discussionPost) {
            try {
              const payload = await import('@/lib/payloadClient').then((m) => m.payload)
              await payload.update({
                collection: 'discussionPosts',
                id:
                  typeof doc.discussionPost === 'object'
                    ? doc.discussionPost.id
                    : doc.discussionPost,
                data: {
                  lastActivity: new Date().toISOString(),
                },
              })
            } catch (error) {
              console.error('Failed to update discussion post lastActivity:', error)
            }
          }
          try {
            // Check if relationships are already populated or just IDs
            let user, challenge, parentComment

            if (typeof doc.user === 'object' && doc.user !== null) {
              // User is already populated
              user = doc.user
            } else {
              // User is just an ID, fetch the full user
              const payload = await import('@/lib/payloadClient').then((m) => m.payload)
              user = await payload.findByID({
                collection: 'users',
                id: doc.user,
                depth: 1,
              })
            }

            // Handle both challenges and discussion posts
            let challengeData, discussionPostData

            if (doc.challenge) {
              if (typeof doc.challenge === 'object' && doc.challenge !== null) {
                // Challenge is already populated
                challengeData = doc.challenge
              } else {
                // Challenge is just an ID, fetch the full challenge
                const payload = await import('@/lib/payloadClient').then((m) => m.payload)
                challengeData = await payload.findByID({
                  collection: 'challenges',
                  id: doc.challenge,
                  depth: 1,
                })
              }
            }

            if (doc.discussionPost) {
              if (typeof doc.discussionPost === 'object' && doc.discussionPost !== null) {
                // Discussion post is already populated
                discussionPostData = doc.discussionPost
              } else {
                // Discussion post is just an ID, fetch the full post
                const payload = await import('@/lib/payloadClient').then((m) => m.payload)
                discussionPostData = await payload.findByID({
                  collection: 'discussionPosts',
                  id: doc.discussionPost,
                  depth: 1,
                })
              }
            }

            // If there's a parent comment, fetch it
            if (doc.parent) {
              if (typeof doc.parent === 'object' && doc.parent !== null) {
                // Parent comment is already populated
                parentComment = doc.parent
              } else {
                // Parent comment is just an ID, fetch the full comment
                const payload = await import('@/lib/payloadClient').then((m) => m.payload)
                parentComment = await payload.findByID({
                  collection: 'comments',
                  id: doc.parent,
                  depth: 1,
                })
              }
            }

            const { data, error } = await resend.emails.send({
              from:
                process.env.NODE_ENV === 'production'
                  ? 'Fanattics Portal <team@mail.navattic.com>'
                  : 'Fanattics Portal <noreply@mail.navattic.dev>',
              to: ['fanattic@navattic.com'],
              subject: 'New Comment Posted - Fanattics Portal',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    New Comment Posted
                  </h2>
                  
                  <p>A new comment has been posted on the Fanattics Portal:</p>
                  
                  <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Commenter Information</h3>
                    <p><strong>Name:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Title:</strong> ${user.title || 'Not specified'}</p>
                    <p><strong>Company:</strong> ${user.company || 'Not specified'}</p>
                    <p><strong>Location:</strong> ${user.location || 'Not specified'}</p>
                  </div>

                  ${
                    challengeData
                      ? `
                  <div style="background-color: #f0f8e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Challenge Information</h3>
                    <p><strong>Challenge:</strong> ${challengeData.title}</p>
                    <p><strong>Description:</strong> ${challengeData.description}</p>
                    <p><strong>Points:</strong> ${challengeData.points}</p>
                    <p><strong>Deadline:</strong> ${new Date(challengeData.deadline).toLocaleDateString()}</p>
                  </div>
                  `
                      : ''
                  }

                  ${
                    discussionPostData
                      ? `
                  <div style="background-color: #f0f8e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Discussion Post Information</h3>
                    <p><strong>Post Title:</strong> ${discussionPostData.title}</p>
                    <p><strong>Author:</strong> ${discussionPostData.author?.firstName || ''} ${discussionPostData.author?.lastName || ''}</p>
                    <p><strong>Created:</strong> ${new Date(discussionPostData.createdAt).toLocaleDateString()}</p>
                  </div>
                  `
                      : ''
                  }

                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Comment Details</h3>
                    <p><strong>Comment ID:</strong> ${doc.id}</p>
                    <p><strong>Status:</strong> ${doc.status}</p>
                    <p><strong>Posted:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Type:</strong> ${doc.parent ? 'Reply' : 'Top-level Comment'}</p>
                  </div>

                  <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Comment Content</h3>
                    <div style="background-color: white; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
                      ${doc.content}
                    </div>
                  </div>

                  ${
                    parentComment
                      ? `
                  <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Parent Comment</h3>
                    <p><strong>Parent Comment ID:</strong> ${parentComment.id}</p>
                    <p><strong>Parent Commenter:</strong> ${parentComment.user?.firstName || ''} ${parentComment.user?.lastName || ''}</p>
                    <div style="background-color: white; padding: 15px; border-left: 4px solid #dc3545; margin: 10px 0;">
                      ${parentComment.content}
                    </div>
                  </div>
                  `
                      : ''
                  }

                  <p style="color: #666; font-size: 14px;">
                    This notification was automatically sent when a new comment was posted on the Fanattics Portal.
                  </p>
                </div>
              `,
            })

            if (error) {
              console.error('Error sending comment notification email:', error)
            }
          } catch (error) {
            console.error('Failed to send comment notification email:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hooks: {
        beforeChange: [
          async ({ value, req }) => {
            // If the user is being deleted, mark their comments as deleted
            if (!value && req.user?.id) {
              await req.payload.update({
                collection: 'comments',
                where: {
                  user: {
                    equals: req.user.id,
                  },
                },
                data: {
                  deleted: true,
                  content: "[User's account was deleted]",
                },
              })
            }
            return value
          },
        ],
      },
    },
    {
      name: 'challenge',
      type: 'relationship',
      relationTo: 'challenges',
      required: false,
    },
    {
      name: 'discussionPost',
      type: 'relationship',
      relationTo: 'discussionPosts',
      required: false,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'comments',
      required: false,
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'approved',
    },
    {
      name: 'deleted',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'likes',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'likedBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      defaultValue: [],
    },
    {
      name: 'flaggedReports',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
