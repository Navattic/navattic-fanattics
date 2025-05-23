// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import {
  Users,
  Media,
  Challenges,
  Ledger,
  Comments,
  Avatars,
  Companies,
  Events,
  Guide,
  CompanyLogos,
  Products,
  GiftShopTransactions,
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
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  cors: ['*', 'http://localhost:3000'],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  email: resendAdapter({
    defaultFromAddress: 'noreply@mail.navattic.dev', // change to .dev for prod
    defaultFromName: 'Payload CMS',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
