import { FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-/]+/g, '')
    .toLowerCase()

export const formatSlug =
  (fallback: string | ((data: any, originalDoc: any) => string)): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === 'string') {
      return format(value)
    }

    if (typeof fallback === 'function') {
      const fallbackString = fallback(data || {}, originalDoc || {})
      if (fallbackString && typeof fallbackString === 'string') {
        return format(fallbackString)
      }
    } else {
      const fallbackData = data?.[fallback] || originalDoc?.[fallback]
      if (fallbackData && typeof fallbackData === 'string') {
        return format(fallbackData)
      }
    }

    return value
  }
