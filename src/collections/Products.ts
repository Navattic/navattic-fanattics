import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'Products',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    update: () => true,
    delete: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the product',
      },
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      maxLength: 185,
      admin: {
        description: 'Product description (max 185 characters)',
      },
    },
    {
      name: 'shortDescription',
      type: 'text',
      required: true,
      maxLength: 55,
      admin: {
        description: 'Short description of the product for checkout (max 55 characters)',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        description: 'Price of the product in points (10 points = 1$)',
      },
    },
    {
      name: 'image',
      type: 'upload',
      required: true,
      relationTo: 'media',
      admin: {
        description: 'Ideally with a transparent background',
      },
    },
    {
      name: 'redeemedBy',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Users who have redeemed the product',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Check if the product is currently available',
      },
    },
  ],
}
