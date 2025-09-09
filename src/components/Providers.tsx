'use client'

import { SessionProvider } from 'next-auth/react'
import React, { ReactNode, createContext, useContext } from 'react'
import { SidebarProvider } from '@/components/shadcn/ui/sidebar'
import { UserProfilePreviewModalProvider } from './ui/UserProfilePreviewModal/UserProfilePreviewModalContext'
import { UserProfilePreviewModal } from './ui/UserProfilePreviewModal/UserProfilePreviewModal'
import { User } from '@/payload-types'

// Create the UserContext with loading and error states
interface UserContextType {
  user: User | null
  isLoading: boolean
  error: string | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Create the useUser hook with better error handling
export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface Props {
  children: ReactNode
  user: User | null
  isLoading?: boolean
  error?: string | null
}

export const Providers = ({ children, user, isLoading = false, error = null }: Props) => {
  return (
    <SessionProvider>
      <UserContext.Provider value={{ user, isLoading, error }}>
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
