import { formatSlug } from '@/utils/formatSlug'
import type { CollectionConfig } from 'payload'
import { v4 as uuidv4 } from 'uuid'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 28800,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
    },
    verify: false,
  },
  access: {
    create: () => true, // allow anyone to create a user
    read: ({ req: { user } }) => {
      return (
        user?.roles?.includes('admin') || {
          id: {
            equals: user?.id,
          },
        }
      )
    },
    update: ({ req: { user } }) => {
      return (
        user?.roles?.includes('admin') || {
          id: {
            equals: user?.id,
          },
        }
      )
    },
    delete: ({ req: { user } }) => (user?.roles?.includes('admin') ? true : false),
    admin: ({ req: { user } }) => (user?.roles?.includes('admin') ? true : false),
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (!data.user_id) {
          data.user_id = uuidv4()
        }
        return data
      },
    ],
  },
  fields: [
    // Email added by default
    { name: 'firstName', type: 'text' },
    { name: 'lastName', type: 'text' },
    { name: 'title', type: 'text', admin: { description: 'e.g. CEO, CTO, etc.' } },
    { name: 'email', type: 'email', defaultValue: undefined },
    { name: 'bio', type: 'text' },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      required: false,
      label: 'Company',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'avatars',
      required: false,
      admin: {
        description: 'Upload a profile image (recommended size: 256x256px)',
        position: 'sidebar',
      },
    },
    {
      name: 'loginMethod',
      type: 'select',
      required: true,
      defaultValue: 'email',
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Email', value: 'email' },
      ],
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      defaultValue: ['user'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'slug',
      label: 'Slug (auto-generated)',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [formatSlug(['firstName', 'lastName'])],
      },
    },
    {
      name: 'user_id',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hidden: true,
      defaultValue: undefined,
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (!value) {
              return uuidv4()
            }
            return value
          },
        ],
      },
    },
  ],
}
