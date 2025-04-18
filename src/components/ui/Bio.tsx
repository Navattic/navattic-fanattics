import React from 'react'
import { Icon, Link } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { User } from '@/payload-types'

const Bio = ({ user }: { user: User }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 inset-shadow p-5 space-y-3">
      {user.bio && <div className="mb-5 text-sm text-gray-700">{user.bio}</div>}
      {user.location && (
        <div className="flex items-center gap-2 text-gray-600">
          <Icon name="map-pin" className="size-4 text-gray-500" />
          <div className="text-sm">{user.location}</div>
        </div>
      )}
      {user.company && typeof user.company !== 'number' && (
        <div className="flex items-center gap-2 text-gray-600">
          <Icon name="building" className="size-4 text-gray-500" />
          {user.company.website ? (
            <Link href={user.company.website} className="text-sm">
              {user.company.name}
            </Link>
          ) : (
            <div className="text-sm">{user.company.name}</div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 text-gray-600">
        <Icon name="calendar" className="size-4 text-gray-500" />
        <div className="text-sm">Joined {formatDate(user.createdAt)}</div>
      </div>
    </div>
  )
}

export default Bio
