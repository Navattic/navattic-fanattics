// Helper function to format time remaining
export function formatTimeRemaining(deadlineStr: string): string {
  const now = new Date()
  const deadline = new Date(deadlineStr)
  const diffMs = deadline.getTime() - now.getTime()

  // If deadline has passed
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