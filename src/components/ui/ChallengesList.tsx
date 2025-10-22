'use client'

import { Challenge, Ledger } from '@/payload-types'
import { Badge, Icon } from '@/components/ui'
import { formatTimeRemaining } from '@/utils/formatTimeRemaining'
import Link from 'next/link'

export const ChallengesList = ({
  challengesData,
  userLedgerEntries,
  commentCountMap,
  userTimezone,
  isExpired = false,
}: {
  challengesData: Challenge[]
  userLedgerEntries: Ledger[]
  commentCountMap: Record<string, number>
  userTimezone?: string
  isExpired?: boolean
}) => {
  return (
    <div className="flex flex-col gap-4">
      {challengesData?.map((challenge) => {
        const isCompleted = userLedgerEntries.some((ledger) => {
          return typeof ledger.challenge_id === 'object' && ledger.challenge_id?.id === challenge.id
        })

        const commentCount = commentCountMap?.[String(challenge.id)] || 0

        return (
          <Link
            key={challenge.id}
            href={`/challenges/${challenge.slug}`}
            className={`inset-shadow space-y-3 rounded-3xl border border-gray-100 px-7 py-6 transition-all duration-200 hover:border-gray-300 [:last-child]:mb-10 ${
              isExpired
                ? 'bg-gradient-to-b from-gray-50/90 to-gray-50/70 opacity-75'
                : 'bg-gradient-to-b from-white/90 to-white/70 hover:bg-white'
            }`}
          >
            <div className="mb-2 space-y-3">
              <div className="flex items-center gap-3">
                <Badge size="sm" colorScheme={isExpired ? 'gray' : 'brand'}>
                  Win {challenge.points} points
                  <Icon name="coins" size="xs" className="ml-1" />
                </Badge>
                {isCompleted && (
                  <Badge size="sm" colorScheme="green">
                    <Icon name="award" size="sm" className="mr-1" />
                    Completed
                  </Badge>
                )}
                {isExpired && !isCompleted && (
                  <Badge size="sm" colorScheme="red">
                    <Icon name="clock" size="xs" className="mr-1" />
                    Expired
                  </Badge>
                )}
              </div>
              <h3 className={`text-lg font-medium ${isExpired ? 'text-gray-600' : ''}`}>
                {challenge.title}
              </h3>
            </div>
            <p
              className={`max-w-prose text-sm text-balance ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {challenge.description}
            </p>
            <div className="mt-5 flex gap-3">
              <div className="inset-shadow flex items-center gap-[6px] rounded-full bg-gray-50 px-3 py-0.5 pl-2.5">
                <Icon name="message-square" size="sm" className="text-gray-400" />
                <span className="text-sm text-gray-500">{commentCount}</span>
              </div>
              <div className="inset-shadow flex items-center gap-[6px] rounded-full bg-gray-50 px-3 py-0.5 pl-2.5">
                <Icon name="calendar-clock" size="sm" className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {formatTimeRemaining(challenge.deadline, userTimezone)}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
