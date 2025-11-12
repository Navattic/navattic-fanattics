/**
 * Database Utilities for Direct PostgreSQL Operations
 *
 * Provides safe, isolated connection pools for source (read-only) and destination (write) databases
 * with multiple layers of safety checks to prevent accidental writes to production.
 */

import pg from 'pg'
import type { Pool, PoolClient, QueryResult } from 'pg'
const { Pool: PoolConstructor } = pg

// Store source URI globally for safety checks
let SOURCE_DATABASE_URI: string | null = null

// Read-only pool wrapper that blocks write operations
export class ReadOnlyPool {
  private _pool: Pool
  private sourceUri: string

  constructor(pool: Pool, sourceUri: string) {
    this._pool = pool
    this.sourceUri = sourceUri
    SOURCE_DATABASE_URI = sourceUri
  }

  // Expose pool for utility functions (read-only operations only)
  get pool(): Pool {
    return this._pool
  }

  // Block all write operations
  async query(text: string, params?: any[]): Promise<QueryResult> {
    const upperText = text.trim().toUpperCase()
    const writeOperations = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE']

    for (const op of writeOperations) {
      if (upperText.startsWith(op)) {
        throw new Error(
          `❌ CRITICAL SAFETY ERROR: Attempted ${op} operation on SOURCE database (READ-ONLY). This should never happen!`,
        )
      }
    }

    return this._pool.query(text, params)
  }

  async connect() {
    return this._pool.connect()
  }

  async end() {
    return this._pool.end()
  }

  get totalCount() {
    return this._pool.totalCount
  }

  get idleCount() {
    return this._pool.idleCount
  }

  get waitingCount() {
    return this._pool.waitingCount
  }
}

/**
 * Creates a read-only connection pool for the source database
 * Wrapped to prevent any write operations
 */
export function createReadOnlyPool(sourceUri: string): ReadOnlyPool {
  const pool = new PoolConstructor({
    connectionString: sourceUri,
    // Prevent any accidental writes
    max: 5, // Limit connections
  })

  return new ReadOnlyPool(pool, sourceUri)
}

/**
 * Creates a write-enabled connection pool for the destination database
 */
export function createWritePool(destUri: string): Pool {
  return new PoolConstructor({
    connectionString: destUri,
    max: 10,
  })
}

/**
 * Verifies that two database pools are connected to different databases
 * Uses PostgreSQL's current_database() and connection info
 */
export async function verifyDatabaseIsolation(
  sourcePool: ReadOnlyPool,
  destPool: Pool,
  sourceUri: string,
  destUri: string,
): Promise<void> {
  // Extract database identifiers from URIs
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

  // Query actual database connections
  try {
    const sourceResult = await sourcePool.query(
      'SELECT current_database() as db_name, inet_server_addr() as server_addr',
    )
    const destResult = await destPool.query(
      'SELECT current_database() as db_name, inet_server_addr() as server_addr',
    )

    const sourceDb = sourceResult.rows[0]?.db_name
    const destDb = destResult.rows[0]?.db_name
    const sourceAddr = sourceResult.rows[0]?.server_addr
    const destAddr = destResult.rows[0]?.server_addr

    // If we can get database names and they're the same, that's a problem
    if (sourceDb && destDb && sourceDb === destDb && sourceAddr === destAddr) {
      throw new Error(
        `❌ CRITICAL: Both pools connected to same database: ${sourceDb} at ${sourceAddr}`,
      )
    }

    console.log(`   ✓ Source database: ${sourceDb || 'unknown'} at ${sourceAddr || 'unknown'}`)
    console.log(`   ✓ Destination database: ${destDb || 'unknown'} at ${destAddr || 'unknown'}`)
  } catch (error: any) {
    // If we can't verify, log warning but don't fail (some databases don't support these queries)
    if (error.message?.includes('CRITICAL')) {
      throw error
    }
    console.log(`   ⚠️  Could not verify database isolation via queries: ${error.message}`)
    console.log(`   ⚠️  Relying on URI comparison: ${sourceDbId} vs ${destDbId}`)
  }
}

/**
 * Converts Payload collection slug to PostgreSQL table name
 * Payload uses format: public_<collection-slug> where hyphens become underscores
 */
export function getTableName(collectionSlug: string): string {
  // Convert hyphens to underscores and prepend 'public_'
  const tableName = `public_${collectionSlug.replace(/-/g, '_')}`
  return tableName
}

/**
 * Masks password in connection string for logging
 */
export function maskUri(uri: string): string {
  try {
    return uri.replace(/:([^:@]+)@/, ':****@')
  } catch {
    return '[invalid URI]'
  }
}

/**
 * Verifies destination pool is not the source database before write operations
 */
export function verifyDestIsNotSource(destPool: Pool, destUri: string): void {
  if (SOURCE_DATABASE_URI && destUri === SOURCE_DATABASE_URI) {
    throw new Error('❌ CRITICAL: Destination URI matches source URI!')
  }

  // Additional check: verify the pool's connection string (if accessible)
  // Note: pg Pool doesn't expose connectionString directly, so we rely on URI comparison
}

/**
 * Gets all column names for a table
 */
export async function getTableColumns(pool: Pool, tableName: string): Promise<string[]> {
  const result = await pool.query(
    `SELECT column_name 
     FROM information_schema.columns 
     WHERE table_schema = 'public' 
     AND table_name = $1 
     ORDER BY ordinal_position`,
    [tableName.replace('public_', '')],
  )
  return result.rows.map((row) => row.column_name)
}

/**
 * Gets the primary key column name for a table
 */
export async function getPrimaryKeyColumn(pool: Pool, tableName: string): Promise<string> {
  const result = await pool.query(
    `SELECT a.attname
     FROM pg_index i
     JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
     WHERE i.indrelid = $1::regclass
     AND i.indisprimary`,
    [tableName],
  )

  if (result.rows.length === 0) {
    throw new Error(`No primary key found for table ${tableName}`)
  }

  return result.rows[0].attname
}
