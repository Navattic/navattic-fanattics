import type { GlobalConfig } from 'payload'

export const Guide: GlobalConfig = {
  slug: 'guide',
  label: 'Rules & Guide',
  access: {
    read: () => true,
    update: () => true,
  },
  fields: [
    {
      label: 'Introduction',
      name: 'introduction',
      type: 'richText',
      required: true,
    },
    {
      name: 'additionalInfo',
      labels: {
        singular: 'Additional Information',
        plural: 'Additional Information',
      },
      type: 'array',
      required: false,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        { name: 'description', type: 'text', required: true },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },
  ],
}
