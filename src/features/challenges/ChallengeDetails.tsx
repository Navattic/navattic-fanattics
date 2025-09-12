'use client'

import { Challenge, User } from '@/payload-types'
// import { PaginatedDocs } from 'payload'
// import { Comment } from '@/payload-types'
import { useState, useEffect } from 'react'
import { Badge, Icon } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { RichText } from '@payloadcms/richtext-lexical/react'

export const ChallengeDetails = ({
  challenge,
  sessionUser,
  // commentsResult,
}: {
  challenge: Challenge
  sessionUser: User
  // commentsResult: PaginatedDocs<Comment>
}) => {
  // Filter user's ledger entries from the populated data
  const userChallengeCompletedData =
    challenge.ledger?.filter(
      (ledger) => typeof ledger === 'object' && ledger.user_id === sessionUser?.id,
    ) || []

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const deadline = new Date(challenge.deadline).getTime()
      const difference = deadline - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        return { days, hours, minutes, seconds }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    // Set initial time
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [challenge.deadline])
  return (
    <div className="w-full">
      <div className="grid h-[35vh] place-items-center space-y-4 bg-gradient-to-t from-white to-blue-50 p-14 pb-0">
        <div className="flex items-start justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge size="md" colorScheme="brand">
                Challenge #1
              </Badge>
              {userChallengeCompletedData.length > 0 && (
                <Badge colorScheme="green">
                  <Icon name="award" size="sm" className="mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="max-w-xl text-center text-2xl font-medium text-balance">
              {challenge.title}
            </h1>
            {challenge.description && (
              <h6 className="text-center text-base text-balance text-gray-700">
                {challenge.description}
              </h6>
            )}
            <span className="text-xs text-gray-500">
              Published {formatDate(challenge.createdAt, { abbreviateMonth: true })}
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-6 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="inset-shadow flex flex-col items-center justify-center gap-3 rounded-lg border border-blue-200 bg-white px-6 pt-3 pb-4">
            <span className="text-sm text-gray-500">Earn</span>
            <div className="flex items-center justify-center gap-2">
              <Icon name="coins" size="sm" />
              <span className="text-base font-semibold text-gray-700">
                {challenge.points} points
              </span>
            </div>
          </div>

          <div className="inset-shadow rounded-lg border border-blue-500 bg-white p-5 text-gray-600">
            <div className="space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Icon name="clock" size="sm" />
                Challenge ends in:
              </div>
              <div className="mx-auto flex items-center justify-center gap-4">
                {[
                  { label: 'days', value: timeLeft.days },
                  { label: 'hrs', value: timeLeft.hours },
                  { label: 'mins', value: timeLeft.minutes },
                  { label: 'secs', value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-md font-semibold text-gray-800">
                      {item.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs opacity-70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="inset-shadow flex flex-col items-center justify-center gap-3 rounded-lg border border-blue-200 bg-white px-6 pt-3 pb-4">
            <span className="text-sm text-gray-500">Deadline</span>
            <div className="flex items-center justify-center gap-2">
              <Icon name="clock" size="sm" />
              <span className="text-base font-semibold text-gray-700">
                {formatDate(challenge.deadline, { abbreviateMonth: true, includeYear: false })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto my-10 max-w-3xl border-t border-b border-gray-100 py-10 pb-4">
        <div className="pb-4 text-lg font-medium text-gray-800">Challenge details</div>
        <div className="text-base text-gray-800">
          <RichText data={challenge.content} className="payload-rich-text" />
        </div>
      </div>
    </div>
  )
}
