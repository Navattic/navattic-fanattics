import type { CollectionConfig } from 'payload'

export const VerificationTokens: CollectionConfig = {
  slug: 'verification-tokens',
  admin: {
    hidden: true,
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => false,
    delete: () => true,
  },
  fields: [
    {
      name: 'identifier',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'expires',
      type: 'date',
      required: true,
      index: true,
    },
  ],
  // Remove the beforeValidate hook that runs cleanup on every request
  // Instead, run cleanup periodically via cron job or separate process
}
