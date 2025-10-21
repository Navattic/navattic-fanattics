// storage-adapter-import-placeholder
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { resendAdapter } from '@payloadcms/email-resend'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import sharp from 'sharp'
import {
  Users,
  Media,
  Challenges,
  Ledger,
  Comments,
  Avatars,
  Companies,
  DiscussionPosts,
  Events,
  Guide,
  CompanyLogos,
  Products,
  GiftShopTransactions,
  VerificationTokens,
} from './collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  globals: [Guide],
  collections: [
    Challenges,
    DiscussionPosts,
    Ledger,
    Events,
    Users,
    Comments,
    Media,
    Avatars,
    Companies,
    CompanyLogos,
    Products,
    GiftShopTransactions,
    VerificationTokens,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: ['*', 'http://localhost:3000', 'https://fanattics.navattic.com'],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  email: resendAdapter({
    defaultFromAddress:
      process.env.NODE_ENV === 'production'
        ? 'team@mail.navattic.com'
        : 'noreply@mail.navattic.dev',
    defaultFromName: 'Navattic Fanattics',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  plugins: [
    payloadCloudPlugin(),
    vercelBlobStorage({
      enabled: true, // Optional, defaults to true
      // Specify which collections should use Vercel Blob
      collections: {
        media: true,
        avatars: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
