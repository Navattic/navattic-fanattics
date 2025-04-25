import { Challenge, Ledger } from '@/payload-types'
import { Badge, Icon } from '@/components/ui'
import { formatTimeRemaining } from '@/utils/formatTimeRemaining'
import Link from 'next/link'

const ChallengesList = async ({
  challengesData,
  userLedgerEntries,
}: {
  challengesData: Challenge[]
  userLedgerEntries: Ledger[]
}) => {
  return (
    <div className="flex flex-col gap-4">
      {challengesData?.map((challenge) => {
        const isCompleted = userLedgerEntries.some((ledger) => {
          return typeof ledger.challenge_id === 'object' && ledger.challenge_id?.id === challenge.id
        })
        return (
          <Link
            key={challenge.id}
            href={`/challenges/${challenge.slug}`}
            className="bg-white px-8 py-6 rounded-2xl border border-gray-100 inset-shadow hover:border-gray-300 transition-all duration-200 space-y-3 [:last-child]:mb-20"
          >
            <div className="space-y-2 mb-2">
              <div className="flex items-center gap-4">
                <Badge size="sm" colorScheme="yellow">
                  <Icon name="coins" size="sm" className="mr-1" />
                  {challenge.points} points
                </Badge>
                {isCompleted && (
                  <Badge size="sm" colorScheme="green">
                    <Icon name="award" size="sm" className="mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-medium">{challenge.title}</h3>
            </div>
            <p className="text-sm text-gray-500 text-balance max-w-prose">
              {challenge.description}
            </p>
            <div className="flex gap-3 mt-5">
              {/* TODO: add dynamic count */}
              <div className="flex items-center gap-[6px] inset-shadow rounded-full bg-gray-50 pl-2.5 px-3 py-0.5">
                <Icon name="message-square" size="sm" className="text-gray-400" />
                <span className="text-gray-500 text-sm">2</span>
              </div>
              {/* TODO: add dynamic count */}
              <div className="flex items-center gap-[6px] inset-shadow rounded-full bg-gray-50 pl-2.5 px-3 py-0.5">
                <Icon name="calendar-clock" size="sm" className="text-gray-400" />
                <span className="text-gray-500 text-sm">
                  {formatTimeRemaining(challenge.deadline)}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default ChallengesList
