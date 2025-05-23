import { Challenge, Ledger } from '@/payload-types'
import { Badge, Icon } from '@/components/ui'
import { formatTimeRemaining } from '@/utils/formatTimeRemaining'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'

const ChallengesList = async ({
  challengesData,
  userLedgerEntries,
}: {
  challengesData: Challenge[]
  userLedgerEntries: Ledger[]
}) => {
  const payload = await getPayload({ config })

  // Fetch comment counts for all challenges in one query
  const commentCounts = await Promise.all(
    challengesData.map(async (challenge) => {
      const comments = await payload.find({
        collection: 'comments',
        where: {
          challenge: { equals: challenge.id },
          deleted: { equals: false },
          status: { equals: 'approved' },
        },
      })
      return { challengeId: challenge.id, count: comments.totalDocs }
    }),
  )

  // Create a map for easy lookup
  const commentCountMap = Object.fromEntries(
    commentCounts.map(({ challengeId, count }) => [challengeId, count]),
  )

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
            className="inset-shadow space-y-3 rounded-2xl border border-gray-100 bg-white px-8 py-6 transition-all duration-200 hover:border-gray-300 [:last-child]:mb-20"
          >
            <div className="mb-2 space-y-2">
              <div className="flex items-center gap-4">
                <Badge size="sm" colorScheme="brand">
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
            <p className="max-w-prose text-sm text-balance text-gray-500">
              {challenge.description}
            </p>
            <div className="mt-5 flex gap-3">
              <div className="inset-shadow flex items-center gap-[6px] rounded-full bg-gray-50 px-3 py-0.5 pl-2.5">
                <Icon name="message-square" size="sm" className="text-gray-400" />
                <span className="text-sm text-gray-500">{commentCountMap[challenge.id] || 0}</span>
              </div>
              <div className="inset-shadow flex items-center gap-[6px] rounded-full bg-gray-50 px-3 py-0.5 pl-2.5">
                <Icon name="calendar-clock" size="sm" className="text-gray-400" />
                <span className="text-sm text-gray-500">
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
