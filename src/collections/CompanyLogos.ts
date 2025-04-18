import type { CollectionConfig } from 'payload'

export const CompanyLogos: CollectionConfig = {
  slug: 'company-logos',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
    {
      name: 'url',
      type: 'text',
      required: false,
      admin: {
        description: 'Direct URL to the logo (e.g. from Brandfetch)',
      },
    },
  ],
  upload: {
    staticDir: 'company-logos',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 48,
        height: 48,
      },
      {
        name: 'small',
        width: 96,
        height: 96,
      },
    ],
  },
}
