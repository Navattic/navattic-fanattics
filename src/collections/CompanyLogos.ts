import type { CollectionConfig } from 'payload'

export const CompanyLogos: CollectionConfig = {
  slug: 'company-logos',
  admin: {
    group: 'Data',
  },
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
      name: 'defaultUrl',
      type: 'text',
      required: false,
      admin: {
        description: 'Default logo URL (e.g. from Brandfetch or Navattic logo API)',
      },
    },
    {
      name: 'uploadedLogo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Custom uploaded logo (optional)',
      },
    },
  ],
}
