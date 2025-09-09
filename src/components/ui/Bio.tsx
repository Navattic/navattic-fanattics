import React from 'react'
import { Icon, Link } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { User } from '@/payload-types'

export const Bio = ({ user }: { user: User }) => {
  return (
    <div className="inset-shadow space-y-3 rounded-2xl border border-gray-100 bg-white p-5">
      {user.bio && <div className="mb-5 text-sm text-gray-700">{user.bio}</div>}
      {user.location && (
        <div className="flex items-center gap-4 text-gray-500">
          <Icon name="map-pin" className="size-4 text-gray-400" />
          <div className="text-sm">{user.location}</div>
        </div>
      )}
      {user.company && typeof user.company !== 'number' && (
        <div className="flex items-center gap-4 text-gray-500">
          <Icon name="building" className="size-4 text-gray-400" />
          {user.company.website ? (
            <Link href={user.company.website} className="text-sm">
              {user.company.name}
            </Link>
          ) : (
            <div className="text-sm">{user.company.name}</div>
          )}
        </div>
      )}
      <div className="flex items-center gap-4 text-gray-500">
        <Icon name="calendar" className="size-4 text-gray-400" />
        <div className="text-sm">Joined {formatDate(user.createdAt)}</div>
      </div>
    </div>
  )
}
