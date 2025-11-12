// storage-adapter-import-placeholder
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { postgresAdapter } from '@payloadcms/db-postgres'
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

// Only enable in production or when explicitly using Supabase connection
const isProduction = process.env.NODE_ENV === 'production'
const connectionString = isProduction
  ? process.env.DATABASE_URI || ''
  : process.env.DEST_DATABASE_URI || ''

const isSupabaseConnection = connectionString.includes('supabase.co')
const shouldEnableCloudPlugin = isProduction || isSupabaseConnection

console.log('[Payload Config] Payload Cloud plugin enabled:', shouldEnableCloudPlugin)

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
  // Use standard postgres adapter in development to avoid Supabase real-time WebSocket issues
  // vercelPostgresAdapter auto-detects Supabase and tries to connect to real-time endpoints
  // which fails when certificates are expired. The standard adapter doesn't have this issue.
  db:
    !isProduction && isSupabaseConnection
      ? postgresAdapter({
          pool: {
            connectionString,
          },
        })
      : vercelPostgresAdapter({
          pool: {
            // Use DATABASE_URI in production, DEST_DATABASE_URI in development
            connectionString,
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
    // Only enable Payload Cloud plugin in production or when using Supabase
    // This prevents WebSocket connection attempts to expired Supabase instances in local dev
    ...(shouldEnableCloudPlugin ? [payloadCloudPlugin()] : []),
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
