import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Leaderboard from '@/components/ui/Leaderboard'

const payload = await getPayload({ config })

const Home = async () => {
  const session = await getServerSession(authOptions)
  if (!session) {
    return (
      <div className="mx-auto text-center mt-20">
        <h1 className="text-xl font-medium">Please sign in to view challenges</h1>
      </div>
    )
  }

  const sessionUserData = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: session?.user?.email,
      },
    },
  })

  const challenges = await payload.find({
    collection: 'challenges',
  })

  const users = await payload.find({
    collection: 'users',
  })

  const ledger = await payload.find({
    collection: 'ledger',
  })

  const sessionUser = sessionUserData.docs[0]

  const challengesData = challenges.docs
  const usersData = users.docs
  const ledgerData = ledger.docs

  // Helper function to calculate points for a user
  const calculateUserPoints = (userId: number) => {
    return ledgerData
      .filter((entry) => {
        const entryUserId = typeof entry.user_id === 'number' ? entry.user_id : entry.user_id.id
        return entryUserId === userId
      })
      .reduce((total, entry) => total + entry.amount, 0)
  }

  const userLedgerEntries = await payload.find({
    collection: 'ledger',
    where: {
      user_id: {
        equals: sessionUser.id,
      },
    },
  })

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div key="challenges-list">
        <h1 className="text-xl font-medium pb-2 mt-20 capitalize">
          Welcome, {sessionUser.firstName} {sessionUser.lastName}!
        </h1>
        <h2 className="text-base text-gray-500">
          You have {calculateUserPoints(sessionUser.id)} points (
          {
            challengesData.filter((challenge) =>
              userLedgerEntries.docs.some(
                (ledger) =>
                  typeof ledger.challenge_id === 'object' &&
                  ledger.challenge_id?.id === challenge.id,
              ),
            ).length
          }{' '}
          challenge{userLedgerEntries.docs.length === 1 ? '' : 's'} completed)
        </h2>
        <div className="flex gap-4 mt-20">
          <div className="flex-1 border border-gray-200 rounded-lg py-8">
            <h1 className="text-lg font-medium border-b border-gray-200 pb-4 mx-8">Challenges</h1>
            <div className="flex flex-col gap-4 mt-4 px-4">
              {challengesData?.map((challenge) => {
                const isCompleted = userLedgerEntries.docs.some((ledger) => {
                  return (
                    typeof ledger.challenge_id === 'object' &&
                    ledger.challenge_id?.id === challenge.id
                  )
                })

                return (
                  <div
                    key={challenge.id}
                    className="flex flex-row justify-between items-center hover:bg-gray-50 transition-all duration-300 p-4 rounded-lg"
                  >
                    <div className="flex flex-col gap-2">
                      <Link
                        className="text-base ml-1 text-blue-800"
                        href={`challenges/${challenge.slug}`}
                      >
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
          <Leaderboard usersData={usersData} calculateUserPoints={calculateUserPoints} />
        </div>
      </div>
    </div>
  )
}

export default Home
