import { Challenge, Ledger } from '@/payload-types'

import Link from 'next/link'

const ChallengesList = async ({
  challengesData,
  userLedgerEntries,
}: {
  challengesData: Challenge[]
  userLedgerEntries: Ledger[]
}) => {
  return (
    <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-100">
      <div className="text-base border-b border-gray-200 pb-2 text-gray-500">Challenges</div>
      <div className="flex flex-col gap-4 mt-2">
        {challengesData?.map((challenge) => {
          const isCompleted = userLedgerEntries.some((ledger) => {
            return (
              typeof ledger.challenge_id === 'object' && ledger.challenge_id?.id === challenge.id
            )
          })

          return (
            <div
              key={challenge.id}
              className="flex flex-row justify-between items-center hover:bg-gray-50 transition-all duration-300 p-4 rounded-lg"
            >
              <div className="flex flex-col gap-2">
                <Link className="ml-1 text-blue-800" href={`challenges/${challenge.slug}`}>
                  <div className="text-base hover:underline">{challenge.title}</div>
                </Link>
                {isCompleted && (
                  <div className="bg-green-100 text-green-800 py-0 px-3 rounded-full text-sm border border-green-200 w-fit">
                    Completed
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">{challenge.points} points</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChallengesList
