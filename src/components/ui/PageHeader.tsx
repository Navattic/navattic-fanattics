'use client'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Tooltip } from '@/components/ui/Tooltip'
import { Home } from 'lucide-react'

import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import Link from 'next/link'

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
          <div className="text-sm font-medium text-gray-800">
            <Tooltip
              content={
                <>
                  Points are earned by completing challenges and can be spent on rewards in the gift
                  shop!
                  <br />
                  <br />
                  Click{' '}
                  <Link href="/gift-shop" className="text-blue-300 underline">
                    here
                  </Link>{' '}
                  to access the gift shop, or{' '}
                  <Link href="/challenges" className="text-blue-300 underline">
                    here
                  </Link>{' '}
                  to view the challenges.
                </>
              }
              side="bottom"
            >
              <span className="text-sm font-medium text-gray-800">
                <span className="pr-2 text-gray-500">Current Balance:</span>
                <Icon name="coins" className="mr-1 size-3 text-gray-700" />
                {userPoints} points
              </span>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
