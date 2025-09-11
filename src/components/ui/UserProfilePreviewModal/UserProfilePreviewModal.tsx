'use client'

import type { Company, Ledger } from '@/payload-types'
import { useProfileDrawer } from './UserProfilePreviewModalContext'
import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerClose,
} from '../../shadcn/ui/drawer'
import { UserEmail } from '../UserEmail'
import { Icon, Avatar } from '@/components/ui'
import { IconName } from '@/components/ui/Compass/Icon'
import { formatDate } from '@/utils/formatDate'
import { parseLocation } from '@/utils/parseLocation'

export const UserProfilePreviewModal = () => {
  const { open, setOpen, user, stats } = useProfileDrawer()

  const company = user?.company as Company | undefined

  // Calculate points from ledger entries if stats are not provided
  const totalPointsEarned =
    !stats && user?.ledgerEntries?.docs
      ? user.ledgerEntries.docs
          .filter(
            (entry): entry is Ledger =>
              typeof entry === 'object' && 'amount' in entry && entry.amount > 0,
          )
          .reduce((total: number, entry) => total + (entry.amount || 0), 0)
      : 0

  const StatisticData = [
    {
      icon: 'coins',
      label: 'Total points earned',
      value: stats?.points ?? totalPointsEarned,
    },
    {
      icon: 'biceps-flexed',
      label: 'Challenges completed',
      value: stats?.challengesCompleted ?? 0,
    },
    {
      icon: 'hand-coins',
      label: 'Items redeemed',
      value: stats?.itemsRedeemed ?? 0,
    },
    {
      icon: 'message-circle-reply',
      label: 'Comments written',
      value: stats?.commentsWritten ?? 0,
    },
  ]

  // Parse the location from the stored format
  const parsedLocation = parseLocation(user?.location)

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerContent
        className="fixed top-1/2 right-5 bottom-1/2 z-100 m-10 flex w-screen border-none bg-transparent outline-transparent md:max-w-[50vw]"
        // The gap between the edge of the screen and the drawer is 40px in this case.
        style={{ '--initial-transform': 'calc(100% + 20px)' } as React.CSSProperties}
      >
        <div className="flex w-full flex-col rounded-2xl bg-white p-5">
          <div className="relative flex w-full justify-between">
            <DrawerHeader className="relative w-full p-0">
              <DrawerTitle className="flex items-center gap-2">
                <Avatar user={user} size="lg" />
                <div className="flex flex-col gap-1">
                  <span className="capitalize">
                    {user?.firstName} {user?.lastName}
                  </span>
                  {user?.email && <UserEmail email={user.email} size="sm" />}
                </div>
              </DrawerTitle>
              <div className="mt-4 flex flex-col gap-4 text-sm text-gray-400">
                <div>
                  <div className="text-md mb-2 text-gray-800">About</div>
                  <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5">
                    {user?.bio && <div className="text-sm text-gray-700">{user.bio}</div>}
                    <div className="flex flex-col gap-2">
                      {parsedLocation && (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Icon name="map-pin" className="size-4 text-gray-400" />
                          <span>{parsedLocation}</span>
                        </div>
                      )}
                      {company?.name && (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Icon name="building" className="size-4 text-gray-400" />
                          <div className="flex flex-col">
                            <a
                              href={company.website || ''}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex text-sm text-blue-500"
                            >
                              {company.name}
                              <Icon name="arrow-up-right" className="ml-0.5 size-3 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[104%] group-hover:opacity-100" />
                            </a>
                          </div>
                        </div>
                      )}
                      {user?.linkedinUrl && (
                        <div className="flex items-center gap-3">
                          <Icon name="linkedin" className="size-4 text-gray-400" />
                          <a
                            href={user.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex text-sm text-blue-500"
                          >
                            LinkedIn Profile
                            <Icon name="arrow-up-right" className="ml-0.5 size-3 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[104%] group-hover:opacity-100" />
                          </a>
                        </div>
                      )}
                      {user?.interactiveDemoUrl && (
                        <div className="flex items-center gap-3">
                          <Icon name="navattic" className="size-4 text-gray-400" />
                          <a
                            href={user.interactiveDemoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex text-sm text-blue-500"
                          >
                            Favorite Interactive Demo
                            <Icon name="arrow-up-right" className="ml-0.5 size-3 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[104%] group-hover:opacity-100" />
                          </a>
                        </div>
                      )}
                      {user?.createdAt && (
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Icon name="calendar" className="size-4 text-gray-400" />
                          Joined {formatDate(user.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-md mb-2 text-gray-800">Statistics</div>
                  <div className="grid grid-cols-2 gap-2">
                    {StatisticData.map((statistic) => (
                      <div
                        key={statistic.label}
                        className="flex w-full flex-col rounded-lg border border-gray-100 bg-gray-50 p-4"
                      >
                        <div className="flex gap-2 text-gray-700">
                          <Icon size="lg" name={statistic.icon as IconName} />
                          <span className="text-lg font-bold">{statistic.value}</span>
                        </div>
                        <span className="mt-1 text-xs text-gray-500">{statistic.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DrawerHeader>
            <DrawerClose className="absolute top-[10px] right-3 cursor-pointer">
              <Icon name="x" className="size-5 text-gray-600" />
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
