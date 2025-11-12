/**
 * Mirror Production Database Script
 *
 * Completely replaces the local database with a production mirror by:
 * 1. Dropping all tables in destination database
 * 2. Running Payload migrations to recreate schema
 * 3. Copying all data from production to local
 *
 * Usage:
 *   SOURCE_DATABASE_URI="postgresql://..." DEST_DATABASE_URI="postgresql://..." yarn mirror:prod
 *
 * Or with .env file:
 *   dotenv -e .env.local -e .env -- tsx scripts/mirror-prod-database.ts
 *
 * Environment Variables (REQUIRED - no fallbacks):
 *   SOURCE_DATABASE_URI - Source database connection string (REQUIRED, no fallback)
 *   DEST_DATABASE_URI - Destination database connection string (REQUIRED, no fallback)
 *   SEED_LIMIT - Optional limit on number of rows per table (default: unlimited)
 *   SKIP_VERIFICATION_TOKENS - Set to 'true' to skip verification tokens (default: false)
 *
 * WARNING: This script will COMPLETELY REPLACE the destination database.
 * All existing data in the destination will be lost.
 */

import {
  createReadOnlyPool,
  createWritePool,
  verifyDatabaseIsolation,
  getTableName,
  maskUri,
  verifyDestIsNotSource,
  getTableColumns,
  getPrimaryKeyColumn,
  type ReadOnlyPool,
} from './db-utils'
import { type Pool } from 'pg'
import { buildConfig } from 'payload'
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
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
} from '../src/collections'
import { migrations } from '../src/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Collections to seed (in dependency order to respect foreign keys)
// Order: collections with no dependencies first, then those that depend on them
const COLLECTIONS = [
  // No dependencies
  'media',
  'avatars',
  'company-logos',
  'verification-tokens',
  // Depends on: company-logos, users (but users depends on companies - circular)
  // We'll seed users first with company=null, then companies, then update users
  'users', // company can be null initially
  'companies', // depends on: author (users), logo_src (company-logos)
  // Depends on: users
  'challenges',
  'events',
  'products',
  'discussion-posts',
  // Depends on: users, challenges, discussion-posts
  'comments',
  // Depends on: users
  'ledger',
  // Depends on: users, products
  'gift-shop-transactions',
] as const

// Map to track old ID -> new ID for each collection
type IdMapping = Map<number | string, number | string>
const idMappings = new Map<string, IdMapping>()

// Relationship field mappings: collection -> array of relationship field names
// Use database column names (which may have _id suffix)
const RELATIONSHIP_FIELDS: Record<string, string[]> = {
  users: ['company_id', 'avatar_id'],
  comments: ['user_id', 'challenge_id', 'discussion_post_id', 'parent_id'],
  'discussion-posts': ['user_id'],
  challenges: [],
  events: [],
  products: [],
  ledger: ['user_id_id'],
  'gift-shop-transactions': ['user_id', 'product_id'],
  companies: ['author_id', 'logo_src_id'],
  'company-logos': [],
  'verification-tokens': [],
  media: [],
  avatars: [],
}

// Unique constraint fields for duplicate detection
const UNIQUE_FIELDS: Record<string, string[]> = {
  users: ['email'],
  companies: ['name'],
  'discussion-posts': ['slug'],
  challenges: ['slug'],
  events: ['slug'],
  products: ['slug'],
}

/**
 * Infers target collection from relationship field name
 */
function inferTargetCollection(fieldName: string, _sourceCollection: string): string | undefined {
  // Remove _id suffix if present to get the base field name
  const baseFieldName = fieldName.replace(/_id$/, '')

  const fieldToCollection: Record<string, string> = {
    user: 'users',
    users: 'users',
    company: 'companies',
    companies: 'companies',
    challenge: 'challenges',
    challenges: 'challenges',
    event: 'events',
    events: 'events',
    product: 'products',
    products: 'products',
    discussion_post: 'discussion-posts',
    discussionpost: 'discussion-posts',
    discussionPosts: 'discussion-posts',
    parent: 'comments',
    author: 'users',
    logo_src: 'company-logos',
    logosrc: 'company-logos',
    avatar: 'avatars',
    user_id: 'users',
  }

  // Try exact match first, then normalized (without underscores), then base name
  return (
    fieldToCollection[fieldName] ||
    fieldToCollection[baseFieldName] ||
    fieldToCollection[baseFieldName.toLowerCase().replace(/_/g, '')]
  )
}

/**
 * Maps relationship field values using ID mappings
 */
function mapRelationshipIds(
  row: Record<string, any>,
  collectionSlug: string,
  idMappings: Map<string, IdMapping>,
): Record<string, any> {
  const mappedRow = { ...row }
  const relationshipFields = RELATIONSHIP_FIELDS[collectionSlug] || []

  for (const field of relationshipFields) {
    if (mappedRow[field] !== null && mappedRow[field] !== undefined) {
      // Find which collection this relationship points to
      const targetCollection = inferTargetCollection(field, collectionSlug)
      if (targetCollection) {
        const mapping = idMappings.get(targetCollection)
        const oldId = mappedRow[field]
        if (mapping && oldId) {
          const newId = mapping.get(oldId)
          if (newId !== undefined) {
            mappedRow[field] = newId
          } else {
            // Relationship points to non-existent record
            // Set to null - caller will check if this is allowed
            mappedRow[field] = null
          }
        } else if (oldId) {
          // Target collection hasn't been seeded yet or no mapping exists
          // Set to null - caller will check if this is allowed
          mappedRow[field] = null
        }
      }
    }
  }

  return mappedRow
}

/**
 * Drops all tables in the destination database
 * This completely clears the database for a fresh start
 */
async function dropAllTables(destPool: Pool, destUri: string): Promise<void> {
  console.log('🗑️  Dropping all tables in destination database...')

  // SAFETY CHECK: Verify destination is not source
  verifyDestIsNotSource(destPool, destUri)

  try {
    // Get all table names in the public schema
    const tablesResult = await destPool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `)

    const tableNames = tablesResult.rows.map((row) => row.tablename)

    if (tableNames.length === 0) {
      console.log('   ✓ No tables to drop (database is already empty)\n')
      return
    }

    console.log(`   Found ${tableNames.length} tables to drop`)

    // Drop all tables with CASCADE to handle dependencies
    // This will also drop types, constraints, etc.
    await destPool.query(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        -- Drop all tables
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
        
        -- Drop all custom types (enums)
        FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e')
        LOOP
          EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;
    `)

    // Verify all tables are dropped
    const verifyResult = await destPool.query(`
      SELECT COUNT(*) as count 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `)

    const remainingTables = parseInt(verifyResult.rows[0]?.count || '0', 10)

    if (remainingTables > 0) {
      throw new Error(`Failed to drop all tables. ${remainingTables} tables still exist.`)
    }

    console.log(`   ✅ Successfully dropped all ${tableNames.length} tables\n`)
  } catch (error: any) {
    console.error(`   ❌ Error dropping tables: ${error.message}`)
    throw error
  }
}

/**
 * Creates Payload config with a specific database URI
 */
function createConfigWithDatabaseUri(databaseUri: string, instanceId: string) {
  // Determine if we should enable Payload Cloud plugin
  // Only enable in production or when explicitly using Supabase connection
  // Disable in migration scripts to avoid WebSocket connection issues
  const isProduction = process.env.NODE_ENV === 'production'
  const isSupabaseConnection = databaseUri.includes('supabase.co')
  const shouldEnableCloudPlugin = isProduction || isSupabaseConnection

  return buildConfig({
    admin: {
      user: Users.slug,
      importMap: {
        baseDir: path.resolve(dirname, '..', 'src'),
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
    secret: `${process.env.PAYLOAD_SECRET || ''}-${instanceId}-${databaseUri.substring(0, 20)}`,
    cors: ['*', 'http://localhost:3000', 'https://fanattics.navattic.com'],
    typescript: {
      outputFile: path.resolve(dirname, '..', 'src', 'payload-types.ts'),
    },
    db: vercelPostgresAdapter({
      pool: {
        connectionString: databaseUri,
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
      // This prevents WebSocket connection attempts to expired Supabase instances
      ...(shouldEnableCloudPlugin ? [payloadCloudPlugin()] : []),
      vercelBlobStorage({
        enabled: true,
        collections: {
          media: true,
          avatars: true,
        },
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }),
    ],
  })
}

/**
 * Runs Payload migrations programmatically
 * Avoids initializing Payload to prevent WebSocket connection issues
 */
async function runMigrations(destUri: string): Promise<void> {
  console.log('🔄 Running Payload migrations...')

  // Use a direct pool connection for migrations table operations
  const migrationsPool = createWritePool(destUri)

  // Create a separate pool for drizzle (migrations need drizzle instance)
  const drizzlePool = createWritePool(destUri)

  try {
    // Create Payload config with destination database
    const config = createConfigWithDatabaseUri(destUri, 'migration-runner')

    // Initialize Payload to get access to the adapter's drizzle instance
    // According to docs: payload.db.drizzle gives us the drizzle instance
    // We'll catch WebSocket errors and continue
    let payloadInstance: any = null
    let drizzleDb: any = null

    try {
      const { getPayload } = await import('payload')
      payloadInstance = await getPayload({ config })
      // Access drizzle from the adapter as per Payload docs
      drizzleDb = payloadInstance.db.drizzle
    } catch (error: any) {
      // If Payload initialization fails due to WebSocket, try to access adapter directly
      if (error.message?.includes('certificate') || error.message?.includes('WebSocket')) {
        console.log('   ⚠️  Payload WebSocket error caught, trying alternative approach...')
        // The adapter might still be accessible even if WebSocket fails
        // Try to get it from the config
        const adapter = (config as any).db
        if (adapter && adapter.drizzle) {
          drizzleDb = adapter.drizzle
        } else {
          // Fallback: create drizzle instance manually
          const { drizzle } = await import('drizzle-orm/node-postgres')
          drizzleDb = drizzle(drizzlePool)
        }
      } else {
        throw error
      }
    }

    // Create the db object that migrations expect
    // It needs an execute method that works with Payload's sql template
    // Use the adapter's execute method directly to avoid WebSocket issues
    const db = {
      execute: async (query: any) => {
        // Try using the adapter's execute method if available
        // This should handle Payload's sql template without WebSocket issues
        if (payloadInstance && payloadInstance.db && payloadInstance.db.execute) {
          try {
            return await payloadInstance.db.execute(query)
          } catch (adapterError: any) {
            // If adapter execute also fails, try drizzle with proper toQuery
            console.log(`   ⚠️  Adapter execute failed: ${adapterError.message}`)
          }
        }

        // Fallback: Use drizzle's toQuery method to get SQL string, then execute via pool
        try {
          // The toQuery method needs the drizzle instance as context
          const queryResult = query.toQuery(drizzleDb)
          const sqlString = queryResult.sql
          const params = queryResult.params || []

          // Execute directly through pool (no WebSocket)
          await drizzlePool.query(sqlString, params)
          return { rows: [], rowCount: 0 }
        } catch (toQueryError: any) {
          // If toQuery fails, try to extract SQL manually
          console.log(`   ⚠️  toQuery failed: ${toQueryError.message}`)

          // Try to get SQL from query object properties
          let sqlString = ''
          if (query.queryChunks) {
            sqlString = query.queryChunks.join('')
          } else if (query.chunks) {
            sqlString = query.chunks
              .map((chunk: any) => {
                if (typeof chunk === 'string') {
                  return chunk
                } else if (chunk && typeof chunk === 'object') {
                  // Handle parameterized chunks
                  return chunk.placeholder || ''
                }
                return ''
              })
              .join('')
          } else {
            console.log('   ⚠️  Query object keys:', Object.keys(query))
            throw new Error(`Cannot extract SQL from query object: ${toQueryError.message}`)
          }

          // Execute the SQL directly through pool
          const statements = sqlString.split(';').filter((s) => s.trim().length > 0)
          for (const statement of statements) {
            const trimmed = statement.trim()
            if (trimmed) {
              await drizzlePool.query(trimmed)
            }
          }

          return { rows: [], rowCount: 0 }
        }
      },
    } as any

    // Create payload object for migrations
    const payload =
      payloadInstance ||
      ({
        db: db,
        config: config,
      } as any)

    // Ensure migrations table exists
    try {
      await migrationsPool.query(`
        CREATE TABLE IF NOT EXISTS public_payload_migrations (
          id serial PRIMARY KEY NOT NULL,
          name varchar,
          batch integer,
          created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
          updated_at timestamp(3) with time zone DEFAULT now() NOT NULL
        )
      `)
    } catch (error: any) {
      // Table might already exist, which is fine
      if (!error.message?.includes('already exists')) {
        throw error
      }
    }

    // Run each migration from src/migrations/index.ts
    console.log(`   Found ${migrations.length} migration(s) to run`)

    for (const migration of migrations) {
      console.log(`   Running migration: ${migration.name}...`)

      // Check if migration has already been run
      const checkResult = await migrationsPool.query(
        'SELECT id FROM public_payload_migrations WHERE name = $1',
        [migration.name],
      )

      if (checkResult.rows.length > 0) {
        console.log(`   ⚠️  Migration ${migration.name} already exists, skipping...`)
        continue
      }

      // Call the migration's up function
      // Use the db object we created above which has proper error handling
      await migration.up({
        db, // Use the db object with proper execute method that handles certificate errors
        payload,
        req: {} as any, // Minimal req object for migrations
      })

      // Verify tables were created by checking for at least one table
      const verifyTables = await migrationsPool.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'public_%'
      `)
      const tableCount = parseInt(verifyTables.rows[0]?.count || '0', 10)

      if (tableCount === 0) {
        throw new Error(
          `Migration ${migration.name} completed but no tables were created. This suggests the SQL was not executed.`,
        )
      }

      // Record the migration in the migrations table
      await migrationsPool.query(
        'INSERT INTO public_payload_migrations (name, batch, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
        [migration.name, 1],
      )

      console.log(`   ✅ Migration ${migration.name} completed (${tableCount} tables created)`)
    }

    // Verify migrations were recorded
    const migrationsResult = await migrationsPool.query(
      'SELECT COUNT(*) as count FROM public_payload_migrations',
    )

    const migrationCount = parseInt(migrationsResult.rows[0]?.count || '0', 10)

    console.log(`   ✅ All migrations completed (${migrationCount} recorded in database)\n`)
  } catch (error: any) {
    console.error(`   ❌ Error running migrations: ${error.message}`)
    throw error
  } finally {
    await migrationsPool.end()
    await drizzlePool.end()
  }
}

/**
 * Seeds a collection using direct PostgreSQL operations
 */
async function seedCollectionDirect(
  sourcePool: ReadOnlyPool,
  destPool: Pool,
  collectionSlug: string,
  sourceUri: string,
  destUri: string,
  limit?: number,
): Promise<{ created: number; skipped: number }> {
  console.log(`📦 Seeding collection: ${collectionSlug}...`)

  // SAFETY CHECK: Verify destination is not source
  verifyDestIsNotSource(destPool, destUri)

  const tableName = getTableName(collectionSlug)
  // Tables are created without public_ prefix, so remove it for SQL queries
  const actualTableName = tableName.replace('public_', '')

  // Check if table exists in source
  try {
    const tableCheck = await sourcePool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [actualTableName],
    )

    if (!tableCheck.rows[0]?.exists) {
      console.log(`   ⚠️  Table ${actualTableName} does not exist in source database\n`)
      return { created: 0, skipped: 0 }
    }
  } catch (error: any) {
    console.log(`   ⚠️  Could not check table existence: ${error.message}\n`)
    return { created: 0, skipped: 0 }
  }

  // Get all columns from source table
  let sourceColumns: string[]
  try {
    sourceColumns = await getTableColumns(sourcePool.pool, tableName)
  } catch (error: any) {
    console.log(`   ⚠️  Could not get columns: ${error.message}\n`)
    return { created: 0, skipped: 0 }
  }

  // Get primary key
  let primaryKey: string
  try {
    primaryKey = await getPrimaryKeyColumn(destPool, actualTableName)
  } catch (error: any) {
    console.log(`   ⚠️  Could not get primary key: ${error.message}\n`)
    return { created: 0, skipped: 0 }
  }

  // Query source data
  const limitClause = limit ? `LIMIT ${limit}` : ''
  const sourceQuery = `SELECT * FROM ${actualTableName} ORDER BY ${primaryKey} ${limitClause}`

  let sourceRows: any[]
  try {
    const result = await sourcePool.query(sourceQuery)
    sourceRows = result.rows
  } catch (error: any) {
    console.log(`   ⚠️  Could not query source: ${error.message}\n`)
    return { created: 0, skipped: 0 }
  }

  if (sourceRows.length === 0) {
    console.log(`   ⚠️  No rows found in ${tableName}\n`)
    return { created: 0, skipped: 0 }
  }

  console.log(`   Found ${sourceRows.length} rows`)

  // Initialize ID mapping for this collection
  const idMapping: IdMapping = new Map()
  idMappings.set(collectionSlug, idMapping)

  // Get columns to insert (exclude id, created_at, updated_at - let DB generate)
  const insertColumns = sourceColumns.filter(
    (col) => !['id', 'created_at', 'updated_at'].includes(col),
  )

  // Check for existing records by unique fields
  const uniqueFields = UNIQUE_FIELDS[collectionSlug] || []
  let created = 0
  let skipped = 0

  for (const row of sourceRows) {
    try {
      const sourceId = row[primaryKey]

      // Check if record already exists (by unique fields)
      let existingId: number | string | null = null

      if (uniqueFields.length > 0) {
        // Build query to check for existing record
        const whereConditions = uniqueFields
          .map((field, idx) => {
            const value = row[field]
            if (value === null || value === undefined) return null
            return `${field} = $${idx + 1}`
          })
          .filter(Boolean)

        if (whereConditions.length > 0) {
          const values = uniqueFields
            .map((field) => row[field])
            .filter((v) => v !== null && v !== undefined)

          const checkQuery = `SELECT ${primaryKey} FROM ${actualTableName} WHERE ${whereConditions.join(' AND ')} LIMIT 1`
          const checkResult = await destPool.query(checkQuery, values)

          if (checkResult.rows.length > 0) {
            existingId = checkResult.rows[0][primaryKey]
            if (existingId !== null) {
              idMapping.set(sourceId, existingId)
            }
            skipped++
            continue
          }
        }
      }

      // Map relationship IDs
      const mappedRow = mapRelationshipIds(row, collectionSlug, idMappings)

      // Check if any required foreign keys became null (skip row if so)
      const relationshipFields = RELATIONSHIP_FIELDS[collectionSlug] || []
      for (const field of relationshipFields) {
        // If the original value was NOT NULL but the mapped value IS NULL, skip this row
        if (row[field] !== null && row[field] !== undefined && mappedRow[field] === null) {
          // This foreign key couldn't be mapped and was required, skip the row
          skipped++
          continue
        }
      }

      // Prepare data for insert (exclude id, timestamps)
      const insertValues: any[] = []
      const placeholders: string[] = []

      insertColumns.forEach((col, idx) => {
        insertValues.push(mappedRow[col])
        placeholders.push(`$${idx + 1}`)
      })

      // SAFETY CHECK: Before every write, verify destination
      verifyDestIsNotSource(destPool, destUri)

      // Insert into destination
      const insertQuery = `INSERT INTO ${actualTableName} (${insertColumns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING ${primaryKey}`

      const insertResult = await destPool.query(insertQuery, insertValues)
      const newId = insertResult.rows[0][primaryKey]

      // Map old ID to new ID
      idMapping.set(sourceId, newId)
      created++
    } catch (error: any) {
      // Skip if duplicate, unique constraint violation, or foreign key violation
      if (
        error.code === '23505' || // Unique violation
        error.code === '23503' || // Foreign key violation
        error.message?.includes('duplicate') ||
        error.message?.includes('unique') ||
        error.message?.includes('foreign key') ||
        error.message?.includes('violates not-null constraint')
      ) {
        skipped++
      } else {
        console.error(`   ❌ Error inserting row:`, error.message)
        // Don't throw - continue with next row
        skipped++
      }
    }
  }

  console.log(`   ✅ Created: ${created}, Skipped: ${skipped}\n`)
  return { created, skipped }
}

/**
 * Seeds all _rels tables (relationship/junction tables)
 */
async function seedRelsTables(
  sourcePool: ReadOnlyPool,
  destPool: Pool,
  sourceUri: string,
  destUri: string,
  idMappings: Map<string, IdMapping>,
): Promise<void> {
  console.log('🔗 Seeding relationship tables (_rels)...')

  // SAFETY CHECK
  verifyDestIsNotSource(destPool, destUri)

  try {
    // Find all _rels tables in source database
    const relsTablesResult = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%_rels'
      ORDER BY table_name
    `)

    if (relsTablesResult.rows.length === 0) {
      console.log('   ⚠️  No _rels tables found in source database\n')
      return
    }

    const relsTables = relsTablesResult.rows.map((row) => row.table_name)
    console.log(`   Found ${relsTables.length} _rels table(s): ${relsTables.join(', ')}`)

    let totalCreated = 0
    let totalSkipped = 0

    for (const tableName of relsTables) {
      try {
        // Get table structure
        const columnsResult = await sourcePool.query(
          `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
        `,
          [tableName],
        )

        const columns = columnsResult.rows.map((row) => row.column_name)
        const idColumns = columns.filter((col) => col.endsWith('_id') && col !== 'parent_id')

        // Query all rows from source
        const sourceRows = await sourcePool.query(`SELECT * FROM ${tableName} ORDER BY id`)

        if (sourceRows.rows.length === 0) {
          console.log(`   ⚠️  ${tableName}: No rows found`)
          continue
        }

        console.log(`   📋 ${tableName}: Found ${sourceRows.rows.length} row(s)`)

        let created = 0
        let skipped = 0

        for (const row of sourceRows.rows) {
          try {
            // Map parent_id - need to infer which collection this belongs to
            // _rels tables are named like: {collection}_rels or payload_{something}_rels
            let parentCollection: string | undefined
            const tableNameWithoutRels = tableName.replace('_rels', '')

            // Try to match collection slug
            // Tables might be named with or without public_ prefix
            for (const collection of COLLECTIONS) {
              const collectionTableName = collection.replace(/-/g, '_')
              // Try without public_ prefix first (migrations create tables without it)
              if (tableNameWithoutRels === collectionTableName) {
                parentCollection = collection
                break
              }
              // Also try with public_ prefix
              if (tableNameWithoutRels === `public_${collectionTableName}`) {
                parentCollection = collection
                break
              }
            }

            // For Payload system tables, try payload_ prefix
            if (!parentCollection && tableNameWithoutRels.startsWith('payload_')) {
              // These are system tables, we'll handle them specially
              parentCollection = 'payload_system'
            }

            if (!parentCollection) {
              // Try to infer from the first id column that's not parent_id
              const firstIdCol = idColumns[0]
              if (firstIdCol) {
                // Extract collection name from column like "users_id" -> "users"
                const collectionName = firstIdCol.replace('_id', '')
                // Check if this matches any collection
                for (const collection of COLLECTIONS) {
                  if (collection.replace(/-/g, '_') === collectionName) {
                    parentCollection = collection
                    break
                  }
                }
              }
            }

            // Map parent_id if we found the collection
            let mappedParentId: number | string | null = null
            if (parentCollection && parentCollection !== 'payload_system') {
              const parentMapping = idMappings.get(parentCollection)
              if (parentMapping && row.parent_id !== null && row.parent_id !== undefined) {
                mappedParentId = parentMapping.get(row.parent_id) || null
                if (mappedParentId === null) {
                  // Parent record doesn't exist in destination, skip this relationship
                  skipped++
                  continue
                }
              } else if (row.parent_id !== null && row.parent_id !== undefined) {
                // Parent collection not seeded yet or no mapping, skip
                skipped++
                continue
              }
            } else {
              // For payload system tables or unknown collections, try to use original ID
              // or skip if we can't map it
              mappedParentId = row.parent_id
            }

            // Map all related ID columns
            const mappedRow: Record<string, any> = {
              ...row,
              parent_id: mappedParentId,
            }

            for (const idCol of idColumns) {
              if (row[idCol] === null || row[idCol] === undefined) {
                continue
              }

              // Extract collection name from column (e.g., "users_id" -> "users")
              const collectionName = idCol.replace('_id', '')
              let targetCollection: string | undefined

              // Find matching collection
              for (const collection of COLLECTIONS) {
                if (collection.replace(/-/g, '_') === collectionName) {
                  targetCollection = collection
                  break
                }
              }

              if (targetCollection) {
                const targetMapping = idMappings.get(targetCollection)
                if (targetMapping) {
                  const mappedId = targetMapping.get(row[idCol])
                  if (mappedId !== undefined) {
                    mappedRow[idCol] = mappedId
                  } else {
                    // Related record doesn't exist, set to null
                    mappedRow[idCol] = null
                  }
                } else {
                  // Collection not seeded yet, set to null
                  mappedRow[idCol] = null
                }
              }
            }

            // Check if all required IDs are mapped (skip if critical IDs are null)
            // For _rels tables, parent_id is usually required
            if (mappedRow.parent_id === null && row.parent_id !== null) {
              skipped++
              continue
            }

            // Prepare insert (exclude id, let DB generate)
            // Quote column names that are reserved keywords (e.g., "order")
            const quoteColumn = (col: string) => {
              const reservedKeywords = ['order', 'user', 'group', 'select', 'table', 'where']
              return reservedKeywords.includes(col.toLowerCase()) ? `"${col}"` : col
            }
            const insertColumns = columns.filter((col) => col !== 'id')
            const quotedColumns = insertColumns.map(quoteColumn)
            const insertValues = insertColumns.map((col) => mappedRow[col])
            const placeholders = insertColumns.map((_, idx) => `$${idx + 1}`)

            // SAFETY CHECK
            verifyDestIsNotSource(destPool, destUri)

            // Insert into destination
            const insertQuery = `INSERT INTO ${tableName} (${quotedColumns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING id`
            await destPool.query(insertQuery, insertValues)
            created++
          } catch (error: any) {
            // Skip if duplicate or constraint violation
            if (
              error.code === '23505' || // Unique violation
              error.message?.includes('duplicate') ||
              error.message?.includes('unique') ||
              error.message?.includes('foreign key')
            ) {
              skipped++
            } else {
              console.error(`   ❌ Error inserting row in ${tableName}:`, error.message)
              skipped++
            }
          }
        }

        console.log(`   ✅ ${tableName}: Created ${created}, Skipped ${skipped}`)
        totalCreated += created
        totalSkipped += skipped
      } catch (error: any) {
        console.error(`   ❌ Error processing ${tableName}:`, error.message)
        // Continue with next table
      }
    }

    console.log(
      `   ✅ Relationship tables: Total created ${totalCreated}, Skipped ${totalSkipped}\n`,
    )
  } catch (error: any) {
    console.error(`   ❌ Error seeding _rels tables: ${error.message}\n`)
    // Don't throw - _rels tables are important but not critical for basic functionality
  }
}

/**
 * Seeds globals table (payload_globals)
 */
async function seedGlobals(
  sourcePool: ReadOnlyPool,
  destPool: Pool,
  sourceUri: string,
  destUri: string,
): Promise<void> {
  console.log('🌍 Seeding globals...')

  // SAFETY CHECK
  verifyDestIsNotSource(destPool, destUri)

  try {
    // Payload stores globals in payload_globals or public_payload_globals table
    // Try both table names
    let result
    try {
      result = await sourcePool.query('SELECT * FROM payload_globals WHERE key = $1', ['guide'])
    } catch {
      result = await sourcePool.query('SELECT * FROM public_payload_globals WHERE key = $1', [
        'guide',
      ])
    }

    if (result.rows.length === 0) {
      console.log('   ⚠️  Global "guide" not found\n')
      return
    }

    const globalData = result.rows[0]

    // Check which table exists in destination and if record exists
    let existing: any
    let destTableName = 'payload_globals'

    try {
      existing = await destPool.query('SELECT key FROM payload_globals WHERE key = $1', ['guide'])
      destTableName = 'payload_globals'
    } catch {
      try {
        existing = await destPool.query('SELECT key FROM public_payload_globals WHERE key = $1', [
          'guide',
        ])
        destTableName = 'public_payload_globals'
      } catch {
        // Neither table exists, try to determine which one exists or create one
        // Check which table exists in the database
        try {
          const tableCheck = await destPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('payload_globals', 'public_payload_globals')
            LIMIT 1
          `)
          if (tableCheck.rows.length > 0) {
            destTableName = tableCheck.rows[0].table_name
          } else {
            // Neither table exists, create payload_globals
            await destPool.query(`
              CREATE TABLE IF NOT EXISTS payload_globals (
                id serial PRIMARY KEY,
                key varchar NOT NULL UNIQUE,
                value jsonb,
                created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
                updated_at timestamp(3) with time zone DEFAULT now() NOT NULL
              )
            `)
            destTableName = 'payload_globals'
          }
        } catch {
          // If creating payload_globals fails, try public_payload_globals
          try {
            await destPool.query(`
              CREATE TABLE IF NOT EXISTS public_payload_globals (
                id serial PRIMARY KEY,
                key varchar NOT NULL UNIQUE,
                value jsonb,
                created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
                updated_at timestamp(3) with time zone DEFAULT now() NOT NULL
              )
            `)
            destTableName = 'public_payload_globals'
          } catch {
            // If both fail, just use payload_globals as default
            destTableName = 'payload_globals'
          }
        }
        existing = { rows: [] }
      }
    }

    if (existing.rows.length > 0) {
      // Update existing
      await destPool.query(
        `UPDATE ${destTableName} SET value = $1, updated_at = NOW() WHERE key = $2`,
        [globalData.value, 'guide'],
      )
      console.log('   ✅ Updated global "guide"\n')
    } else {
      // Insert new - try the determined table name, fallback to the other
      try {
        await destPool.query(
          `INSERT INTO ${destTableName} (key, value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`,
          ['guide', globalData.value],
        )
      } catch {
        const altTableName =
          destTableName === 'payload_globals' ? 'public_payload_globals' : 'payload_globals'
        await destPool.query(
          `INSERT INTO ${altTableName} (key, value, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`,
          ['guide', globalData.value],
        )
      }
      console.log('   ✅ Created global "guide"\n')
    }
  } catch (error: any) {
    console.error(`   ❌ Error seeding globals: ${error.message}\n`)
    // Don't throw - globals are optional
  }
}

/**
 * Main function to mirror production database
 */
async function mirrorProductionDatabase({
  sourceUri,
  destUri,
  limit,
  skipVerificationTokens,
}: {
  sourceUri: string
  destUri: string
  limit?: number
  skipVerificationTokens: boolean
}) {
  console.log('🪞 Starting production database mirror...\n')

  // Log configuration
  console.log('📋 Database Configuration:')
  console.log(`   Source (READ ONLY): ${maskUri(sourceUri)}`)
  console.log(`   Destination (WRITE): ${maskUri(destUri)}`)
  console.log('')

  // CRITICAL VALIDATION: URIs must be different
  if (sourceUri === destUri) {
    throw new Error('❌ CRITICAL: Source and destination URIs cannot be the same!')
  }

  // Extract database identifiers
  const extractDbId = (uri: string) => {
    const match = uri.match(/@([^:]+):\d+\//)
    return match ? match[1] : 'unknown'
  }

  const sourceDbId = extractDbId(sourceUri)
  const destDbId = extractDbId(destUri)

  if (sourceDbId === destDbId && sourceDbId !== 'unknown') {
    throw new Error(
      `❌ CRITICAL: Source and destination appear to be the same database (${sourceDbId})!`,
    )
  }

  // SAFETY CHECK: Require explicit confirmation if source looks like production
  const isLikelyProduction = sourceUri.includes('prod') || sourceUri.includes('production')
  if (isLikelyProduction) {
    console.log('⚠️  WARNING: Source URI appears to be production!')
    console.log('   Make absolutely sure DEST_DATABASE_URI is your dev database.\n')
  }

  // Create connection pools
  console.log('🔌 Creating database connections...')
  const sourcePool = createReadOnlyPool(sourceUri)
  const destPool = createWritePool(destUri)

  // Add error listeners to prevent unhandled error events during cleanup
  sourcePool.pool.on('error', (err: any) => {
    // Ignore shutdown/termination errors
    if (
      err.code !== 'XX000' &&
      !err.message?.includes('shutdown') &&
      !err.message?.includes('termination')
    ) {
      console.error('Source pool error:', err.message)
    }
  })
  destPool.on('error', (err: any) => {
    // Ignore shutdown/termination errors
    if (
      err.code !== 'XX000' &&
      !err.message?.includes('shutdown') &&
      !err.message?.includes('termination')
    ) {
      console.error('Dest pool error:', err.message)
    }
  })

  try {
    // Verify database isolation
    console.log('🔍 Verifying database isolation...')
    await verifyDatabaseIsolation(sourcePool, destPool, sourceUri, destUri)
    console.log('   ✅ Databases are isolated\n')

    // Final safety check
    console.log('🔒 Final Safety Checks:')
    console.log(`   ✓ Source URI: ${maskUri(sourceUri)}`)
    console.log(`   ✓ Dest URI: ${maskUri(destUri)}`)
    console.log(`   ✓ Source is read-only wrapper`)
    console.log(`   ✓ Dest pool created with write access`)
    console.log('')

    // Step 1: Drop all tables in destination
    await dropAllTables(destPool, destUri)

    // Step 2: Run migrations to create schema
    await runMigrations(destUri)

    // Step 3: Copy all data from production
    console.log('📥 Copying data from production...\n')

    const collectionsToSeed = skipVerificationTokens
      ? COLLECTIONS.filter((c) => c !== 'verification-tokens')
      : COLLECTIONS

    for (const collectionSlug of collectionsToSeed) {
      await seedCollectionDirect(sourcePool, destPool, collectionSlug, sourceUri, destUri, limit)
    }

    // Seed relationship tables (_rels) after all collections are seeded
    await seedRelsTables(sourcePool, destPool, sourceUri, destUri, idMappings)

    // Seed globals
    await seedGlobals(sourcePool, destPool, sourceUri, destUri)

    console.log('🎉 Production database mirror completed!')
    console.log(`   ✓ All writes were to: ${maskUri(destUri)}`)
    console.log(`   ✓ No writes to source: ${maskUri(sourceUri)}`)
  } catch (error) {
    console.error('Fatal error:', error)
    throw error
  } finally {
    // Close connections gracefully, ignoring shutdown/termination errors
    try {
      await sourcePool.end()
    } catch (error: any) {
      // Ignore shutdown/termination errors during cleanup
      if (
        !error.message?.includes('shutdown') &&
        !error.message?.includes('termination') &&
        error.code !== 'XX000'
      ) {
        console.error('Error closing source pool:', error.message)
      }
    }
    try {
      await destPool.end()
    } catch (error: any) {
      // Ignore shutdown/termination errors during cleanup
      if (
        !error.message?.includes('shutdown') &&
        !error.message?.includes('termination') &&
        error.code !== 'XX000'
      ) {
        console.error('Error closing dest pool:', error.message)
      }
    }
  }
}

// Main execution
async function main() {
  const sourceUri = process.env.SOURCE_DATABASE_URI
  const destUri = process.env.DEST_DATABASE_URI

  if (!sourceUri) {
    console.error('❌ SOURCE_DATABASE_URI must be explicitly set')
    console.error('   This script requires explicit source and destination URIs for safety.')
    process.exit(1)
  }

  if (!destUri) {
    console.error('❌ DEST_DATABASE_URI must be explicitly set')
    console.error('   This script requires explicit source and destination URIs for safety.')
    process.exit(1)
  }

  const limit = process.env.SEED_LIMIT ? parseInt(process.env.SEED_LIMIT, 10) : undefined
  const skipVerificationTokens = process.env.SKIP_VERIFICATION_TOKENS === 'true'

  if (limit && (isNaN(limit) || limit < 1)) {
    console.error('❌ SEED_LIMIT must be a positive number')
    process.exit(1)
  }

  try {
    await mirrorProductionDatabase({
      sourceUri,
      destUri,
      limit,
      skipVerificationTokens,
    })
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
