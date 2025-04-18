import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Container } from '@/components/ui/Container'
import ChallengesList from '@/components/ui/ChallengesList'
import PageHeader from '@/components/ui/PageHeader'
import { payload } from '@/lib/payloadClient'
import PageTitle from '@/components/ui/PageTitle'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui'

const Home = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="mx-auto text-center mt-20">
        <h1 className="text-lg font-medium">Please sign in to view challenges</h1>
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

  const userPoints = calculateUserPoints(sessionUser.id)
  const userHasPoints = `You have ${userPoints} points (
    ${
      challengesData.filter((challenge) =>
        userLedgerEntries.some(
          (ledger) =>
            typeof ledger.challenge_id === 'object' && ledger.challenge_id?.id === challenge.id,
        ),
      ).length
    }{' '}
    challenge{userLedgerEntries.length === 1 ? '' : 's'} completed)`

  const userPointsDescription =
    userPoints === 0 ? 'No points yet - complete challenges to start earning!' : userHasPoints

  return (
    <>
      <PageHeader title="Fanattic Portal" />
      <div className="bg-gray-50 min-h-screen">
        <Container className="max-w-6xl">
          <PageTitle
            title={
              <>
                Welcome back, <span className="capitalize">{sessionUser.firstName}</span>!
              </>
            }
            description={userPointsDescription}
            button={
              <Button href="/challenges" variant="outline" size="sm">
                <Icon name="arrow-right" className="size-4" />
                View challenges
              </Button>
            }
          />
          {challengesData && (
            <ChallengesList
              // sessionUser={sessionUser}
              challengesData={challengesData}
              userLedgerEntries={userLedgerEntries}
            />
          )}
        </Container>
      </div>
    </>
  )
}

export default Home
