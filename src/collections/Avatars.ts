import type { CollectionConfig } from 'payload'

export const Avatars: CollectionConfig = {
  slug: 'avatars',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 48,
        height: 48,
      },
      {
        name: 'profile',
        width: 256,
        height: 256,
      },
    ],
  },
}
