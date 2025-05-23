import type { CollectionConfig } from 'payload'

export const Avatars: CollectionConfig = {
  slug: 'avatars',
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
  ],
  upload: {
    staticDir: 'media/avatars',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
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
    pasteURL: {
      allowList: [
        {
          hostname: 'lh3.googleusercontent.com',
          pathname: '/a/*',
          protocol: 'https',
        },
      ],
    },
  },
}
