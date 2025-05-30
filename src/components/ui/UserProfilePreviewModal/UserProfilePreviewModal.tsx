'use client'

import type { Company, User } from '@/payload-types'
import { useProfileDrawer } from './UserProfilePreviewModalContext'
import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '../../shadcn/ui/drawer'
import Avatar from '../Avatar'
import UserEmail from '../UserEmail'
import { Icon } from '../Icon'
import { formatDate } from '@/utils/formatDate'

function UserProfilePreviewModal() {
  const { open, setOpen, user } = useProfileDrawer()

  const company = user?.company as Company | undefined

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
                <Avatar user={user} size="lg" showCompany={true} />
                <div className="flex flex-col">
                  {user?.firstName} {user?.lastName}
                  {user?.email && <UserEmail email={user.email} size="sm" />}
                </div>
              </DrawerTitle>
              <DrawerDescription className="mt-4 flex flex-col gap-4">
                <div>
                  <div className="text-md mb-2 text-gray-800">About</div>
                  <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5">
                    {user?.bio && <div className="text-sm text-gray-700">{user.bio}</div>}
                    <div className="flex flex-col gap-2">
                      {company?.name && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Icon name="map-pin" className="size-4 text-gray-400" />
                          {company.name}
                        </div>
                      )}
                      {company?.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Icon name="building" className="size-4 text-gray-400" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                      {user?.createdAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Icon name="calendar" className="size-4 text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-md mb-2 text-gray-800">Statistics</div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5">
                        <div className="text-sm text-gray-700">
                          Design engineer at Navattic. I made this thing!
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5">
                        <div className="text-sm text-gray-700">
                          Design engineer at Navattic. I made this thing!
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5">
                        <div className="text-sm text-gray-700">
                          Design engineer at Navattic. I made this thing!
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50 p-5">
                        <div className="text-sm text-gray-700">
                          Design engineer at Navattic. I made this thing!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DrawerDescription>
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

export default UserProfilePreviewModal
