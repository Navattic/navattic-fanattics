'use client'

import { SessionProvider } from 'next-auth/react'
import React, { ReactNode } from 'react'
import { SidebarProvider } from '@/components/shadcn/ui/sidebar'
interface Props {
  children: ReactNode
}

const Providers = (props: Props) => {
  return (
    <SessionProvider>
      <SidebarProvider>{props.children}</SidebarProvider>
    </SessionProvider>
  )
}

export default Providers
