import type { CollectionConfig } from 'payload'

export const VerificationTokens: CollectionConfig = {
  slug: 'verification-tokens',
  admin: {
    hidden: true, // Hide from admin UI
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => false,
    delete: () => true,
  },
  fields: [
    {
      name: 'identifier', // email address
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
  hooks: {
    beforeValidate: [
      // Clean up expired tokens
      async ({ req }) => {
        const payload = req.payload
        await payload.delete({
          collection: 'verification-tokens', // Match the slug with hyphen
          where: {
            expires: {
              less_than: new Date(),
            },
          },
        })
      },
    ],
  },
}
