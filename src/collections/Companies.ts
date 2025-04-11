import type { CollectionConfig } from 'payload'

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: {
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
      name: 'logoSrc',
      type: 'text',
      required: false,
      admin: {
        description:
          'Retrieve the logo from Brandfetch.com. Ideally, this would be replaced with a custom React component that would query the Brandfetch API for the logo, but this is a quick solve for the MVP',
      },
    },
  ],
}
