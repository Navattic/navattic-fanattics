'use client'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Tooltip } from '@/components/ui/Tooltip'
import { Home } from 'lucide-react'

import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

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
              <span className="flex items-center text-sm font-medium">
                {/* <span className="pr-2 text-gray-500">Balance</span> */}
                <div className="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-0.5">
                  <Icon name="coins" className="size-4 text-blue-400" />
                  <span className="text-blue-500">{userPoints} points</span>
                </div>
                {/* <Badge colorScheme="brand" size="md" iconLeft="coins">
                  {userPoints} points
                </Badge> */}
              </span>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
