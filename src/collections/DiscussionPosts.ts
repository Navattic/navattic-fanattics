import type { CollectionConfig } from 'payload'
import { formatSlug } from '../utils/formatSlug'

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
  },
}
