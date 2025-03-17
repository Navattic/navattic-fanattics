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
            className="bg-white px-8 py-6 rounded-2xl border border-gray-100 shadow-xs space-y-3"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{challenge.title}</h3>
              <div className="flex items-center gap-2">
                <Badge size="sm" colorScheme="yellow">
                  <Icon name="coins" size="xs" className="mr-1" />
                  {challenge.points} points
                </Badge>
                {isCompleted && (
                  <Badge size="sm" colorScheme="green">
                    <Icon name="award" size="xs" className="mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 text-balance">{challenge.description}</p>
            <div className="flex gap-5">
              <div className="flex items-center gap-1">
                <Icon name="message-square" size="sm" className="text-gray-400" />
                <span className="text-gray-500 text-sm">2</span>
              </div>
              <div className="flex items-center gap-1">
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
