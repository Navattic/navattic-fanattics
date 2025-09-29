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
    includeMonth?: boolean
    abbreviateMonth?: boolean
    timezone?: string
  } = {
    includeDay: true,
    includeYear: true,
    includeTime: false,
    includeMonth: true,
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

    const mergedOptions = {
      includeDay: true,
      includeYear: true,
      includeTime: false,
      includeMonth: true,
      abbreviateMonth: false,
      ...options,
    }

    // Build comprehensive Intl.DateTimeFormatOptions
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: mergedOptions.includeYear ? 'numeric' : undefined,
      month: mergedOptions.includeMonth
        ? mergedOptions.abbreviateMonth
          ? 'short'
          : 'long'
        : undefined,
      day: mergedOptions.includeDay ? 'numeric' : undefined,
      hour: mergedOptions.includeTime ? 'numeric' : undefined,
      minute: mergedOptions.includeTime ? '2-digit' : undefined,
      hour12: mergedOptions.includeTime ? true : undefined,
      timeZone: mergedOptions.timezone || undefined,
    }

    // Remove undefined properties
    Object.keys(formatOptions).forEach((key) => {
      if (formatOptions[key as keyof Intl.DateTimeFormatOptions] === undefined) {
        delete formatOptions[key as keyof Intl.DateTimeFormatOptions]
      }
    })

    // Use Intl.DateTimeFormat for consistent, timezone-aware formatting
    const formatter = new Intl.DateTimeFormat('en-US', formatOptions)
    let formattedDate = formatter.format(date)

    // Add ordinal suffixes for day if needed
    if (mergedOptions.includeDay && !mergedOptions.includeTime) {
      const dayMatch = formattedDate.match(/\b(\d{1,2})\b/)
      if (dayMatch) {
        const day = parseInt(dayMatch[1], 10)
        const ordinalSuffix = getOrdinalSuffix(day)
        formattedDate = formattedDate.replace(/\b(\d{1,2})\b/, `$1${ordinalSuffix}`)
      }
    }

    return formattedDate
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

// Helper function for ordinal suffixes
function getOrdinalSuffix(day: number): string {
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

// Helper function to convert timezone abbreviations to IANA timezone identifiers
export function getTimezoneFromAbbreviation(abbreviation: string): string {
  const timezoneMap: Record<string, string> = {
    CDT: 'America/Chicago', // Central Daylight Time
    CST: 'America/Chicago', // Central Standard Time
    EDT: 'America/New_York', // Eastern Daylight Time
    EST: 'America/New_York', // Eastern Standard Time
    PDT: 'America/Los_Angeles', // Pacific Daylight Time
    PST: 'America/Los_Angeles', // Pacific Standard Time
  }

  return timezoneMap[abbreviation] || 'UTC'
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
  } catch (error) {
    console.error('Error formatting post date:', error)
    return ''
  }
}
