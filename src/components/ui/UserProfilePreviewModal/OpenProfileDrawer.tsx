'use client'

import type { User } from '@/payload-types'
import { useProfileDrawer } from './UserProfilePreviewModalContext'

interface UserStats {
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

interface OpenProfileDrawerProps {
  children: React.ReactNode
  user: User
  stats?: UserStats
  className?: string
}

export default function OpenProfileDrawer({
  children,
  user,
  stats,
  className,
}: OpenProfileDrawerProps) {
  const { setOpen, setUser } = useProfileDrawer()

  const handleClick = () => {
    if (user) setUser(user, stats)
    setOpen(true)
  }

  return (
    <div
      role="button"
      aria-label="Open profile modal associated with this user"
      onClick={handleClick}
      className={className}
    >
      {children}
    </div>
  )
}
