'use client'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PageHeader = ({
  title,
  userPoints,
  noUser,
}: {
  title?: string
  userPoints: number
  noUser?: boolean
}) => {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-10 w-full border-b border-gray-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-3">
        {pathname === '/' ? (
          title ? (
            <span className="text-sm font-medium text-gray-800 capitalize" aria-current="page">
              {title}
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-800 capitalize" aria-current="page">
              <Home className="mr-1 h-4 w-4" />
            </span>
          )
        ) : (
          <Breadcrumbs title={title} />
        )}
        {!noUser && (
          <div className="text-sm font-medium text-gray-800">Current Balance: {userPoints}</div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
