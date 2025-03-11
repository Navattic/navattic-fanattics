import type { CollectionConfig } from 'payload'

export const Comments: CollectionConfig = {
  slug: 'comments',
  fields: [
    {
      name: 'content',
      type: 'text',
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'challenge',
      type: 'relationship',
      relationTo: 'challenges',
    },
    // {
    //   name: 'parentComment',
    //   type: 'relationship',
    //   relationTo: 'comments',
    // },
    {
      name: 'createdAt',
      type: 'date',
    },
    {
      name: 'updatedAt',
      type: 'date',
    },
    {
      name: 'approved',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
