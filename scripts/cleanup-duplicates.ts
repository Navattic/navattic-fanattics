/**
 * Cleanup Duplicates Script
 *
 * Safely removes duplicate entries created by the seed script.
 *
 * Usage:
 *   DRY_RUN=true DATABASE_URI="postgresql://..." tsx scripts/cleanup-duplicates.ts
 *
 * Environment Variables:
 *   DATABASE_URI - Database connection string (REQUIRED)
 *   DRY_RUN - Set to 'true' to preview changes without deleting (default: true)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function cleanupCompanyDuplicates(payload: any, dryRun: boolean) {
  console.log('🔍 Finding duplicate companies...\n')

  // Get all companies
  const allCompanies = await payload.find({
    collection: 'companies',
    limit: 10000,
    sort: 'createdAt',
  })

  console.log(`   Found ${allCompanies.docs.length} total companies`)

  // Group by name (case-insensitive)
  const companiesByName = new Map<string, any[]>()
  for (const company of allCompanies.docs) {
    const key = company.name.toLowerCase().trim()
    if (!companiesByName.has(key)) {
      companiesByName.set(key, [])
    }
    companiesByName.get(key)!.push(company)
  }

  // Find duplicates
  const duplicatesToDelete: any[] = []
  let duplicatesFound = 0

  for (const [name, companies] of companiesByName.entries()) {
    if (companies.length > 1) {
      duplicatesFound += companies.length - 1
      // Sort by createdAt, keep the oldest
      companies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      const keep = companies[0]
      const duplicates = companies.slice(1)

      console.log(`\n   📋 Duplicate found: "${name}"`)
      console.log(`      Keeping: ID ${keep.id} (created: ${keep.createdAt})`)

      for (const dup of duplicates) {
        console.log(`      Will delete: ID ${dup.id} (created: ${dup.createdAt})`)
        duplicatesToDelete.push(dup)
      }
    }
  }

  console.log(`\n   📊 Summary: ${duplicatesFound} duplicate companies found`)

  if (duplicatesToDelete.length === 0) {
    console.log('   ✅ No duplicates to clean up\n')
    return
  }

  if (dryRun) {
    console.log(`\n   🔒 DRY RUN MODE: Would delete ${duplicatesToDelete.length} companies`)
    console.log('   Run with DRY_RUN=false to actually delete\n')
    return
  }

  // Actually delete
  console.log(`\n   🗑️  Deleting ${duplicatesToDelete.length} duplicate companies...`)
  let deleted = 0
  let errors = 0

  for (const dup of duplicatesToDelete) {
    try {
      // Check if this company is referenced by any users
      const usersWithCompany = await payload.find({
        collection: 'users',
        where: {
          company: {
            equals: dup.id,
          },
        },
        limit: 1,
      })

      if (usersWithCompany.docs.length > 0) {
        console.log(`      ⚠️  Skipping ID ${dup.id}: referenced by users`)
        continue
      }

      await payload.delete({
        collection: 'companies',
        id: dup.id,
      })
      deleted++
    } catch (error: any) {
      console.error(`      ❌ Error deleting ID ${dup.id}:`, error.message)
      errors++
    }
  }

  console.log(`\n   ✅ Deleted: ${deleted}, Errors: ${errors}\n`)
}

async function cleanupCompanyLogoDuplicates(payload: any, dryRun: boolean) {
  console.log('🔍 Finding duplicate company logos...\n')

  // Get all company logos
  const allLogos = await payload.find({
    collection: 'company-logos',
    limit: 10000,
    sort: 'createdAt',
  })

  console.log(`   Found ${allLogos.docs.length} total company logos`)

  // Group by defaultUrl (if available) or alt text
  const logosByKey = new Map<string, any[]>()
  for (const logo of allLogos.docs) {
    const key = logo.defaultUrl || logo.alt || `logo-${logo.id}`
    if (!logosByKey.has(key)) {
      logosByKey.set(key, [])
    }
    logosByKey.get(key)!.push(logo)
  }

  // Find duplicates
  const duplicatesToDelete: any[] = []
  let duplicatesFound = 0

  for (const [key, logos] of logosByKey.entries()) {
    if (logos.length > 1) {
      duplicatesFound += logos.length - 1
      // Sort by createdAt, keep the oldest
      logos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      const keep = logos[0]
      const duplicates = logos.slice(1)

      console.log(`\n   📋 Duplicate found: "${key}"`)
      console.log(`      Keeping: ID ${keep.id} (created: ${keep.createdAt})`)

      for (const dup of duplicates) {
        console.log(`      Will delete: ID ${dup.id} (created: ${dup.createdAt})`)
        duplicatesToDelete.push(dup)
      }
    }
  }

  console.log(`\n   📊 Summary: ${duplicatesFound} duplicate logos found`)

  if (duplicatesToDelete.length === 0) {
    console.log('   ✅ No duplicates to clean up\n')
    return
  }

  if (dryRun) {
    console.log(`\n   🔒 DRY RUN MODE: Would delete ${duplicatesToDelete.length} logos`)
    console.log('   Run with DRY_RUN=false to actually delete\n')
    return
  }

  // Actually delete
  console.log(`\n   🗑️  Deleting ${duplicatesToDelete.length} duplicate logos...`)
  let deleted = 0
  let errors = 0

  for (const dup of duplicatesToDelete) {
    try {
      // Check if this logo is referenced by any companies
      const companiesWithLogo = await payload.find({
        collection: 'companies',
        where: {
          logoSrc: {
            equals: dup.id,
          },
        },
        limit: 1,
      })

      if (companiesWithLogo.docs.length > 0) {
        console.log(`      ⚠️  Skipping ID ${dup.id}: referenced by companies`)
        continue
      }

      await payload.delete({
        collection: 'company-logos',
        id: dup.id,
      })
      deleted++
    } catch (error: any) {
      console.error(`      ❌ Error deleting ID ${dup.id}:`, error.message)
      errors++
    }
  }

  console.log(`\n   ✅ Deleted: ${deleted}, Errors: ${errors}\n`)
}

async function main() {
  const databaseUri = process.env.DATABASE_URI
  const dryRun = process.env.DRY_RUN !== 'false' // Default to true for safety

  if (!databaseUri) {
    console.error('❌ DATABASE_URI must be set')
    process.exit(1)
  }

  console.log('🧹 Starting duplicate cleanup...\n')
  console.log(`   Database: ${databaseUri.replace(/:([^:@]+)@/, ':****@')}`)
  console.log(`   Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (will delete)'}\n`)

  // Temporarily set DATABASE_URI
  const originalUri = process.env.DATABASE_URI
  process.env.DATABASE_URI = databaseUri

  try {
    const payload = await getPayload({ config })

    await cleanupCompanyDuplicates(payload, dryRun)
    await cleanupCompanyLogoDuplicates(payload, dryRun)

    console.log('🎉 Cleanup completed!')
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    process.env.DATABASE_URI = originalUri
  }
}

main()
