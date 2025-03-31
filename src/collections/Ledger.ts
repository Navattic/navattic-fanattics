import type { CollectionConfig } from 'payload'

export const Ledger: CollectionConfig = {
  slug: 'ledger',
  labels: {
    singular: 'Ledger entry',
    plural: 'Ledger entries',
  },
  admin: {
    useAsTitle: 'user_id',
  },
  access: {
    read: () => true, // You may want to restrict this based on your requirements
  },
  fields: [
    {
      name: 'user_id',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who earned, lost or redeemed points',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      admin: {
        description: 'Number of points awarded (positive) or deducted (negative)',
      },
    },
    {
      name: 'reason',
      type: 'text',
      required: true,
      admin: {
        description: 'Description of why the transaction occurred',
      },
    },
    {
      name: 'challenge_id',
      type: 'relationship',
      relationTo: 'challenges',
      admin: {
        description: 'Related challenge, if applicable',
      },
    },
  ],
}

