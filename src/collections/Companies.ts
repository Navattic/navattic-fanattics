import type { CollectionConfig } from 'payload'

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: {
    group: 'Data',
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    update: () => true,
    delete: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the company',
      },
    },
    {
      name: 'website',
      type: 'text',
      required: false,
      admin: {
        description: 'Company website URL',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      admin: {
        description: 'Who added the company',
      },
    },
    {
      name: 'logoSrc',
      type: 'relationship',
      relationTo: 'company-logos',
      required: false,
      admin: {
        description: 'Company logo from Brandfetch or other sources',
      },
    },
  ],
}
