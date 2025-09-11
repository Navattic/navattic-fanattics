'use client'

import { Challenge, User } from '@/payload-types'
import { PaginatedDocs } from 'payload'
import { Comment } from '@/payload-types'
import { useState, useEffect } from 'react'
import { Badge, Icon } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { formatTimeRemaining } from '@/utils/formatTimeRemaining'
import { RichText } from '@payloadcms/richtext-lexical/react'

export const ChallengeDetails = ({
  challenge,
  sessionUser,
  commentsResult,
}: {
  challenge: Challenge
  sessionUser: User
  commentsResult: PaginatedDocs<Comment>
}) => {
  // Filter user's ledger entries from the populated data
  const userChallengeCompletedData =
    challenge.ledger?.filter(
      (ledger) => typeof ledger === 'object' && ledger.user_id === sessionUser?.id,
    ) || []

  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 45,
    seconds: 30,
  })

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  return (
    <div className="w-full">
      <div className="grid h-[35vh] place-items-center space-y-4 border-b border-gray-200 bg-gradient-to-b from-white to-blue-50 p-14 pb-10">
        <div className="flex items-start justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge size="md" colorScheme="brand">
                30 day challenge
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
            <span className="text-sm text-gray-500">
              Published {formatDate(challenge.createdAt, { abbreviateMonth: true })}
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl space-y-6 py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="inset-shadow flex flex-col items-center justify-end gap-4 rounded-lg border border-gray-100 bg-gray-50 p-6 px-8 shadow-xs">
            <div className="flex items-center justify-center gap-2">
              <Icon name="coins" size="lg" />
              <span className="text-xl text-gray-700">{challenge.points}</span>
            </div>
            <span className="text-sm text-gray-500">Points upon completion</span>
          </div>
          <div className="inset-shadow flex flex-col items-center justify-end gap-4 rounded-lg border border-gray-100 bg-gray-50 p-6 px-8 shadow-xs">
            <div className="flex items-center justify-center gap-2">
              <Icon name="message-square" size="lg" />
              <span className="text-xl text-gray-700">{commentsResult.totalDocs || 0}</span>
            </div>
            <span className="text-sm text-gray-500">Comments written</span>
          </div>
          <div className="inset-shadow flex flex-col items-center justify-end gap-4 rounded-lg border border-gray-100 bg-gray-50 p-6 px-8 shadow-xs">
            <div className="flex items-center justify-center gap-2">
              <Icon name="clock" size="lg" />
              <span className="text-lg text-gray-700">
                {formatTimeRemaining(challenge.deadline)}
              </span>
            </div>
            <span className="text-sm text-gray-500">Time left to complete</span>
          </div>
        </div>
        <div className="inset-shadow rounded-lg border border-blue-100 bg-gradient-to-t from-blue-50/50 to-blue-50 p-8 text-gray-600">
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-2 text-lg">
              <Icon name="clock" size="lg" />
              Challenge ends in:
            </div>
            <div className="mx-auto grid max-w-md grid-cols-4 gap-4">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-xl font-semibold text-gray-800">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm opacity-70">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="inset-shadow rounded-lg border border-gray-100 bg-gray-50 p-8 shadow-xs">
          <div className="mx-auto max-w-prose">
            <div className="pb-4 text-lg font-medium text-gray-800">Challenge details</div>
            <div className="text-base text-gray-800">
              <RichText data={challenge.content} className="payload-rich-text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
