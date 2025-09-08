import type { GlobalConfig } from 'payload'
import { IconNames } from '@/components/ui/icons/generated/icon-names'

export const Guide: GlobalConfig = {
  slug: 'guide',
  label: 'Rules & Guide',
  admin: {
    group: 'Collections',
  },
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
          name: 'icon',
          type: 'select',
          required: true,
          options: IconNames.map((name) => ({
            label: name.charAt(0) + name.slice(1).replace(/-/g, ' '),
            value: name,
          })),
          defaultValue: 'info',
        },
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
