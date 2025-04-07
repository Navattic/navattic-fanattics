import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Container } from '@/components/ui/Container'
import ChallengesList from '@/components/ui/ChallengesList'
import Leaderboard from '@/components/ui/Leaderboard'
import PageHeader from '@/components/ui/PageHeader'
import { payload } from '@/lib/payloadClient'

const Home = async () => {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return (
      <div className="mx-auto text-center mt-20">
        <h1 className="text-xl font-medium">Please sign in to view challenges</h1>
      </div>
    )
  }

  const sessionUser = (
    await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session?.user?.email,
        },
      },
    })
  ).docs[0]

  const challengesData = (
    await payload.find({
      collection: 'challenges',
    })
  ).docs

  const usersData = (
    await payload.find({
      collection: 'users',
    })
  ).docs

  const ledgerData = (
    await payload.find({
      collection: 'ledger',
    })
  ).docs

  const userLedgerEntries = (
    await payload.find({
      collection: 'ledger',
      where: {
        user_id: {
          equals: sessionUser.id,
        },
      },
    })
  ).docs

  // Helper function to calculate points for a user
  const calculateUserPoints = (userId: number) => {
    return ledgerData
      .filter((entry) => {
        const entryUserId = typeof entry.user_id === 'number' ? entry.user_id : entry.user_id.id
        return entryUserId === userId
      })
      .reduce((total, entry) => total + entry.amount, 0)
  }

  return (
    <div className="min-h-screen">
      <PageHeader />
      <div className="bg-white w-full border-b border-gray-200">
        <Container className="py-4 max-w-7xl">
          <h1 className="text-xl font-medium pb-2">
            Welcome back, <span className="capitalize">{sessionUser.firstName}</span>!
          </h1>
          <h2 className="text-base text-gray-500">
            You have {calculateUserPoints(sessionUser.id)} points (
            {
              challengesData.filter((challenge) =>
                userLedgerEntries.some(
                  (ledger) =>
                    typeof ledger.challenge_id === 'object' &&
                    ledger.challenge_id?.id === challenge.id,
                ),
              ).length
            }{' '}
            challenge{userLedgerEntries.length === 1 ? '' : 's'} completed)
          </h2>
        </Container>
      </div>
      <Container>
        <div className="flex flex-col gap-4 my-20">
          {challengesData && (
            <ChallengesList
              // sessionUser={sessionUser}
              challengesData={challengesData}
              userLedgerEntries={userLedgerEntries}
            />
          )}
          <Leaderboard usersData={usersData} calculateUserPoints={calculateUserPoints} />
        </div>
      </Container>
    </div>
  )
}

export default Home
