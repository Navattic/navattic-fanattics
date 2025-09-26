// Helper function to format time remaining - timezone-aware
export function formatTimeRemaining(deadlineStr: string, userTimezone?: string): string {
  const now = new Date()
  const deadline = new Date(deadlineStr)

  // Start with standard UTC calculation
  let diffMs = deadline.getTime() - now.getTime()

  if (userTimezone && userTimezone !== 'UTC') {
    try {
      // Helper to get offset in minutes from UTC
      const getOffsetInMinutes = (timezone: string) => {
        const now = new Date()
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
        const targetDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
        return (targetDate.getTime() - utcDate.getTime()) / (1000 * 60)
      }

      const offsetMinutes = getOffsetInMinutes(userTimezone)
      const offsetMs = offsetMinutes * 60 * 1000

      // Apply the offset to the difference
      diffMs = diffMs + offsetMs
    } catch (error) {
      console.warn('Error calculating timezone offset for time remaining:', error)
      // Fall back to UTC calculation
    }
  }

  if (diffMs < 0) {
    return 'Expired'
  }

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} left`
  } else if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} left`
  } else {
    return `${diffSecs} ${diffSecs === 1 ? 'second' : 'seconds'} left`
  }
}

// Utility for timezone-aware deadline display
export function formatDeadlineInTimezone(deadlineStr: string, userTimezone?: string): string {
  const deadline = new Date(deadlineStr)

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: userTimezone || 'UTC',
  }

  return deadline.toLocaleString('en-US', formatOptions)
}
