# Navattic Portal

Fanatic Portal built with Payload CMS, Next.js, and TypeScript.

## Attributes

- **Database**: PostgreSQL (Supabase)
- **Storage Adapter**: Vercel Blob Storage

## Local Development

### Mirroring Production Database

To set up your local database with a complete copy of production data:

1. **Set environment variables** in `.env.local`:

```bash
SOURCE_DATABASE_URI=postgresql://user:password@host:port/database
DEST_DATABASE_URI=postgresql://user:password@host:port/database
```

2. **Run the mirror script**:

```bash
yarn mirror:prod
```

The script will:

- Drop all existing tables in your local database
- Run Payload migrations to create the schema
- Copy all data from production to local
- Handle relationships and foreign key constraints automatically

**Note**: The script replaces all data in your local database each time you run it. Media files stored in Vercel Blob are not copied - only metadata is seeded.
