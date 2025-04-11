import { CollectionConfig, FieldHook, PayloadRequest } from 'payload'

const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-/]+/g, '')
    .toLowerCase()

type FallbackValue = string | ((data: any, originalDoc: any) => string)

interface SlugDocument {
  id: string
  slug: string
}

type WhereField = { [key: string]: any }

export const formatSlug =
  (fallbacks: FallbackValue | FallbackValue[]): FieldHook =>
  async ({ value, originalDoc, data, req, collection }) => {
    // If direct value provided, use it
    const fallbackArray = Array.isArray(fallbacks) ? fallbacks : [fallbacks]

    const baseSlug =
      typeof value === 'string'
        ? format(value)
        : format(
            fallbackArray
              .map((fallback) =>
                typeof fallback === 'function'
                  ? fallback(data || {}, originalDoc || {})
                  : data?.[fallback] || originalDoc?.[fallback],
              )
              .filter(Boolean)
              .join(' '),
          )

    if (!baseSlug) return ''

    if (!collection?.slug) return baseSlug

    type DocType = { slug: string }

    // Check for existing slugs
    const existing = await req.payload.find({
      collection: collection.slug,
      where: {
        slug: { like: `${baseSlug}%` },
        ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
      } as WhereField,
      limit: 1,
      sort: '-slug',
    })

    // Return base slug if no duplicates exist
    if (!existing?.docs?.length) return baseSlug

    // Get the highest number and increment
    const doc = existing.docs[0] as DocType
    const lastSlug = doc?.slug || ''
    const lastNumber = parseInt(lastSlug.split('-').pop() || '0', 10)
    return `${baseSlug}-${isNaN(lastNumber) ? 1 : lastNumber + 1}`
  }
