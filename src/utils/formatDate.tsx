/**
 * Formats an ISO date string into a human-readable format
 * @param isoString - ISO date string (e.g. "2025-01-28T16:56:04.090Z")
 * @param options - Optional formatting options
 * @returns Formatted date string (e.g. "January 28th, 2025")
 */
export function formatDate(
  isoString: string,
  options: {
    includeDay?: boolean
    includeYear?: boolean
    includeTime?: boolean
    abbreviateMonth?: boolean
  } = {
    includeDay: true,
    includeYear: true,
    includeTime: false,
    abbreviateMonth: false,
  },
): string {
  if (!isoString) return ''

  try {
    const date = new Date(isoString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return ''
    }

    // Create a new options object by merging the default options with the provided options
    const mergedOptions = {
      includeDay: true,
      includeYear: true,
      includeTime: false,
      abbreviateMonth: false,
      ...options,
    }

    const month = date.toLocaleString('en-US', {
      month: mergedOptions.abbreviateMonth ? 'short' : 'long',
    })
    const day = date.getDate()
    const year = date.getFullYear()

    // Add ordinal suffix to day (1st, 2nd, 3rd, etc.)
    const getOrdinalSuffix = (day: number): string => {
      if (day > 3 && day < 21) return 'th'
      switch (day % 10) {
        case 1:
          return 'st'
        case 2:
          return 'nd'
        case 3:
          return 'rd'
        default:
          return 'th'
      }
    }

    const dayWithSuffix = mergedOptions.includeDay ? `${day}${getOrdinalSuffix(day)}` : ''
    const yearString = mergedOptions.includeYear ? `, ${year}` : ''
    const timeString = mergedOptions.includeTime
      ? ` at ${date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`
      : ''

    // Handle different formatting options
    if (mergedOptions.includeDay) {
      return `${month} ${dayWithSuffix}${yearString}${timeString}`
    } else {
      return `${month}${yearString}${timeString}`
    }
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

export function formatPostDate(isoString: string) {
  try {
    const date = new Date(isoString)
    const formatter = new Intl.RelativeTimeFormat('en', { style: 'short' })
    const diffInMs = Date.now() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    // Less than 1 minute
    if (diffInMinutes < 1) return 'just now'

    // Less than 1 hour
    if (diffInMinutes < 60) {
      return formatter.format(-diffInMinutes, 'minute')
    }

    // Less than 24 hours
    if (diffInHours < 24) {
      return formatter.format(-diffInHours, 'hour')
    }

    // Less than 1 month
    if (diffInDays < 30) {
      return formatter.format(-diffInDays, 'day')
    }

    // Less than 1 year
    if (diffInMonths < 12) {
      return formatter.format(-diffInMonths, 'month')
    }

    // More than 1 year
    return formatter.format(-diffInYears, 'year')
  } catch (e) {
    return ''
  }
}
