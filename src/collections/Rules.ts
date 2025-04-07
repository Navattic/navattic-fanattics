import type { CollectionConfig } from 'payload'

export const Rules: CollectionConfig = {
  slug: 'rules-and-guidelines',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
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
