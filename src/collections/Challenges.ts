import type { CollectionConfig } from 'payload'
import { formatSlug } from '../utils/formatSlug'

export const Challenges: CollectionConfig = {
  slug: 'challenges',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      label: 'Challenge Description (keep this short and concise)',
      name: 'description',
      type: 'text',
      required: true,
    },
    {
      name: 'deadline',
      type: 'date',
      required: true,
    },
    {
      label: 'Points Awarded',
      name: 'points',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'content',
      type: 'richText',
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
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'ledger',
      type: 'relationship',
      relationTo: 'ledger',
      hasMany: true,
    },
  ],
}
