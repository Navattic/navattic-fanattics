import type { CollectionConfig } from 'payload'

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
      required: true,
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
