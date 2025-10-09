'use client'

import { DiscussionPost } from '@/payload-types'
import { Icon } from '@/components/ui'
import { formatTimeRemaining } from '@/utils/formatTimeRemaining'
import { formatDate } from '@/utils/formatDate'
import Link from 'next/link'

export const DiscussionsList = ({
  discussionsData,
  commentCountMap,
  userTimezone,
}: {
  discussionsData: DiscussionPost[]
  commentCountMap: Record<string, number>
  userTimezone?: string
}) => {
  return (
    <div className="flex flex-col gap-4">
      {discussionsData?.map((discussion) => {
        const commentCount = commentCountMap?.[String(discussion.id)] || 0
        const author = typeof discussion.author === 'object' ? discussion.author : null

        return (
          <Link
            key={discussion.id}
            href={`/discussions/${discussion.slug}`}
            className="group block rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {discussion.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Icon name="user" size="xs" />
                    <span>
                      {author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Icon name="calendar" size="xs" />
                    <span>
                      {formatDate(discussion.createdAt, {
                        abbreviateMonth: true,
                        includeYear: false,
                        timezone: userTimezone,
                      })}
                    </span>
                  </div>

                  {discussion.lastActivity && discussion.lastActivity !== discussion.createdAt && (
                    <div className="flex items-center gap-1">
                      <Icon name="clock" size="xs" />
                      <span>
                        Last activity {formatTimeRemaining(discussion.lastActivity, userTimezone)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Icon name="message-circle" size="sm" />
                  <span>{commentCount}</span>
                </div>
                
                <Icon 
                  name="chevron-right" 
                  size="sm" 
                  className="text-gray-400 group-hover:text-gray-600 transition-colors" 
                />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
