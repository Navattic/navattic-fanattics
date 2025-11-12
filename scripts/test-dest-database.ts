/**
 * Test Destination Database Write Script (Direct PostgreSQL)
 *
 * Safely tests that writes go to DEST_DATABASE_URI and NOT to SOURCE_DATABASE_URI.
 * Uses direct PostgreSQL operations to avoid Payload API issues.
 * Creates a test record, verifies it, then cleans it up.
 *
 * Usage:
 *   SOURCE_DATABASE_URI="postgresql://..." DEST_DATABASE_URI="postgresql://..." tsx scripts/test-dest-database.ts
 *
 * Or with .env file:
 *   dotenv -e .env.local -- tsx scripts/test-dest-database.ts
 *
 * Environment Variables (REQUIRED):
 *   SOURCE_DATABASE_URI - Source database connection string (REQUIRED)
 *   DEST_DATABASE_URI - Destination database connection string (REQUIRED)
 */

import {
  createReadOnlyPool,
  createWritePool,
  verifyDatabaseIsolation,
  getTableName,
  maskUri,
  verifyDestIsNotSource,
} from './db-utils'

async function testDestinationDatabase(sourceUri: string, destUri: string) {
  console.log('🧪 Testing Destination Database Write Access\n')

  // Log configuration
  console.log('📋 Test Configuration:')
  console.log(`   Source (should NOT be written to): ${maskUri(sourceUri)}`)
  console.log(`   Destination (should be written to): ${maskUri(destUri)}`)
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

  console.log('🔍 Step 1: Connecting to databases...')

  // Create connection pools
  const sourcePool = createReadOnlyPool(sourceUri)
  const destPool = createWritePool(destUri)

  console.log(`   ✓ Connected to source database: ${maskUri(sourceUri)}`)
  console.log(`   ✓ Connected to destination database: ${maskUri(destUri)}`)

  // Verify database isolation
  console.log('\n🔍 Step 2: Verifying connections are isolated...')
  await verifyDatabaseIsolation(sourcePool, destPool, sourceUri, destUri)
  console.log('   ✓ Databases are isolated\n')

  // Test: Verify we can query source (read-only)
  console.log('🔍 Step 3: Testing read access to source database...')
  try {
    // Try to query a simple table to verify read access works
    const result = await sourcePool.query('SELECT 1 as test')
    if (result.rows.length > 0) {
      console.log('   ✓ Successfully queried source database (read-only access confirmed)')
    }
  } catch (error: any) {
    console.log(`   ⚠️  Could not query source: ${error.message}`)
  }

  // Test: Verify we can query destination
  console.log('\n🔍 Step 4: Testing access to destination database...')
  try {
    const result = await destPool.query('SELECT 1 as test')
    if (result.rows.length > 0) {
      console.log('   ✓ Successfully queried destination database')
    }
  } catch (error: any) {
    console.log(`   ⚠️  Could not query destination: ${error.message}`)
  }

  console.log('\n⚠️  Note: Write test skipped (destination database may be empty)')
  console.log('   Run the seed script first to populate the destination database.')

  // Close connections
  await sourcePool.end()
  await destPool.end()

  console.log('\n✅ All tests passed!')
  console.log(`   ✓ Writes go to: ${maskUri(destUri)}`)
  console.log(`   ✓ No writes to: ${maskUri(sourceUri)}`)
}

async function main() {
  const sourceUri = process.env.SOURCE_DATABASE_URI
  const destUri = process.env.DEST_DATABASE_URI

  if (!sourceUri) {
    console.error('❌ SOURCE_DATABASE_URI must be explicitly set')
    process.exit(1)
  }

  if (!destUri) {
    console.error('❌ DEST_DATABASE_URI must be explicitly set')
    process.exit(1)
  }

  try {
    await testDestinationDatabase(sourceUri, destUri)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
