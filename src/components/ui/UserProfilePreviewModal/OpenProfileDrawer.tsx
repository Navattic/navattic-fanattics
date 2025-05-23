'use client'

import type { User } from '@/payload-types'
import { useProfileDrawer } from './UserProfilePreviewModalContext'

interface OpenProfileDrawerProps<T = any> {
  children: React.ReactNode
  user: User
  className?: string
}

export default function OpenProfileDrawer<T>({
  children,
  user,
  className,
}: OpenProfileDrawerProps<T>) {
  const { setOpen, setUser } = useProfileDrawer()

  const handleClick = () => {
    if (user) setUser(user)
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
