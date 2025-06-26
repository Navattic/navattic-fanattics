'use client'

import type { User } from '@/payload-types'
import { createContext, useContext, useState } from 'react'

interface UserStats {
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

interface DrawerContextType {
  open: boolean
  setOpen: (open: boolean) => void
  user: User | null
  setUser: (user: User | null, stats?: UserStats) => void
  stats: UserStats | null
}

const DrawerContext = createContext<DrawerContextType>({
  open: false,
  setOpen: (_: boolean) => {},
  user: null,
  setUser: (_: any) => {},
  stats: null,
})

export const UserProfilePreviewModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)

  const handleSetUser = (user: User | null, stats?: UserStats) => {
    setUser(user)
    setStats(stats || null)
  }

  return (
    <DrawerContext.Provider value={{ open, setOpen, user, setUser: handleSetUser, stats }}>
      {children}
    </DrawerContext.Provider>
  )
}

export const useProfileDrawer = () => useContext(DrawerContext)
