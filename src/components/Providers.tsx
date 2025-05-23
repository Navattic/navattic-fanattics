'use client'

import { SessionProvider } from 'next-auth/react'
import React, { ReactNode, createContext, useContext } from 'react'
import { SidebarProvider } from '@/components/shadcn/ui/sidebar'
import { UserProfilePreviewModalProvider } from './ui/UserProfilePreviewModal/UserProfilePreviewModalContext'
import UserProfilePreviewModal from './ui/UserProfilePreviewModal/UserProfilePreviewModal'
import { User } from '@/payload-types'

// Create the UserContext
const UserContext = createContext<User | undefined>(undefined)

// Create the useUser hook
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface Props {
  children: ReactNode
  user: User
}

const Providers = ({ children, user }: Props) => {
  return (
    <SessionProvider>
      <UserContext.Provider value={user}>
        <SidebarProvider>
          <UserProfilePreviewModalProvider>
            {children}
            <UserProfilePreviewModal />
          </UserProfilePreviewModalProvider>
        </SidebarProvider>
      </UserContext.Provider>
    </SessionProvider>
  )
}

export default Providers
