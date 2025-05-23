'use client'

import type { User } from '@/payload-types'
import { createContext, useContext, useState } from 'react'

interface DrawerContextType<T = any> {
  open: boolean
  setOpen: (open: boolean) => void
  user: User | null
  setUser: (user: User | null) => void
}

const DrawerContext = createContext<DrawerContextType>({
  open: false,
  setOpen: (_: boolean) => {},
  user: null,
  setUser: (_: any) => {},
})

export const UserProfilePreviewModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  return (
    <DrawerContext.Provider value={{ open, setOpen, user, setUser }}>
      {children}
    </DrawerContext.Provider>
  )
}

export const useProfileDrawer = () => useContext(DrawerContext)
