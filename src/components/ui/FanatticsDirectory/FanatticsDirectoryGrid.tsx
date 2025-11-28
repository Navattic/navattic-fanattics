'use client'

import type { User, Company } from '@/payload-types'
import { Avatar, Icon, Button } from '@/components/ui'
import { OpenProfileDrawer } from '../UserProfilePreviewModal/OpenProfileDrawer'
import { parseLocation } from '@/utils/parseLocation'

interface UserStats {
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

interface UserWithStats {
  user: User
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

interface FanatticsDirectoryGridProps {
  users: UserWithStats[]
}

export function FanatticsDirectoryGrid({ users }: FanatticsDirectoryGridProps) {
  if (users.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {users.map((userWithStats) => {
        const company = userWithStats.user.company as Company | undefined
        const parsedLocation = parseLocation(userWithStats.user.location)
        const bioPreview = userWithStats.user.bio
          ? userWithStats.user.bio.length > 120
            ? `${userWithStats.user.bio.substring(0, 120)}...`
            : userWithStats.user.bio
          : null

        const stats: UserStats = {
          points: userWithStats.points,
          challengesCompleted: userWithStats.challengesCompleted,
          itemsRedeemed: userWithStats.itemsRedeemed,
          commentsWritten: userWithStats.commentsWritten,
        }

        return (
          <OpenProfileDrawer
            key={userWithStats.user.id}
            user={userWithStats.user}
            stats={stats}
            className="group"
          >
            <div className="inset-shadow flex h-full cursor-pointer flex-col rounded-2xl bg-white p-5 shadow-xs ring-1 ring-gray-800/5 transition-all hover:shadow-md">
              <div className="flex h-full flex-col justify-between">
                <div className="flex flex-col gap-4">
                  {/* Avatar and Name */}
                  <div className="flex items-start gap-3">
                    <Avatar user={userWithStats.user} size="lg" />
                    <div className="flex flex-1 flex-col gap-1">
                      <h3 className="text-base font-semibold text-gray-800 capitalize">
                        {userWithStats.user.firstName} {userWithStats.user.lastName}
                      </h3>
                      {company?.name && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Icon name="building" className="size-3.5 text-gray-400" />
                          <span>{company.name}</span>
                        </div>
                      )}
                      {parsedLocation && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Icon name="map-pin" className="size-3.5 text-gray-400" />
                          <span>{parsedLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {bioPreview && <p className="line-clamp-3 text-sm text-gray-500 text-balance">{bioPreview}</p>}
                </div>

                <div className="pt-4">
                  {/* LinkedIn CTA */}
                  {userWithStats.user.linkedinUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(
                          userWithStats.user.linkedinUrl || '',
                          '_blank',
                          'noopener,noreferrer',
                        )
                      }}
                      className="w-full justify-center gap-2"
                    >
                      LinkedIn profile
                      <Icon name="arrow-up-right" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </OpenProfileDrawer>
        )
      })}
    </div>
  )
}
