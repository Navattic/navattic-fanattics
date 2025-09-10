import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Container, PageHeader, PageTitle, Button, Icon, InlineBanner } from '@/components/ui'
import { ChallengesList } from '@/components/ui/ChallengesList'
import { payload } from '@/lib/payloadClient'
import { calculateUserPoints } from '@/lib/users/points'

const Home = async () => {
  const session = await getServerSession(authOptions)

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

  if (!session || !sessionUser) {
    return (
      <>
        <PageHeader userPoints={0} noUser={true} />
        <div className="min-h-screen bg-gray-50">
          <Container>
            <PageTitle
              title={<>Welcome!</>}
              description="Please sign in or create an account to view the portal."
            />
            <Button href="/login">Sign in</Button>
          </Container>
        </div>
      </>
    )
  }

  const challengesData = (
    await payload.find({
      collection: 'challenges',
    })
  ).docs

  const userLedgerEntries =
    sessionUser &&
    (
      await payload.find({
        collection: 'ledger',
        where: {
          user_id: {
            equals: sessionUser.id,
          },
        },
      })
    ).docs

  const userPoints = await calculateUserPoints({ user: sessionUser })

  const completedChallengesCount = challengesData.filter((challenge) =>
    userLedgerEntries.some(
      (ledger) =>
        typeof ledger.challenge_id === 'object' && ledger.challenge_id?.id === challenge.id,
    ),
  ).length

  const userHasPoints = `You have ${userPoints} points (${completedChallengesCount} challenge${completedChallengesCount === 1 ? '' : 's'} completed)`

  const userPointsDescription =
    userPoints === 0 ? 'No points yet - complete challenges to start earning.' : userHasPoints

  return (
    <>
      <PageHeader userPoints={userPoints} />
      <div className="min-h-screen bg-gray-50">
        <Container>
          <PageTitle
            title={
              <>
                Welcome, <span className="capitalize">{sessionUser.firstName}</span>!
              </>
            }
            description={userPointsDescription}
            button={
              <Button href="/challenges" variant="outline" size="sm">
                View challenges
                <Icon name="arrow-right" className="size-4" />
              </Button>
            }
          />
          <div className="flex flex-col gap-4">
            <InlineBanner
              title="Welcome to the Fanattic Portal!"
              icon="info"
              description="New here? Read the rules and guide to get started."
              colorScheme="brand"
              actionButton={{
                href: '/rules-and-guide',
                colorScheme: 'brand',
                size: 'sm',
                children: (
                  <>
                    Rules & Guide <Icon name="arrow-right" className="size-4" />
                  </>
                ),
              }}
            />
            {challengesData && (
              <ChallengesList
                // sessionUser={sessionUser}
                challengesData={challengesData}
                userLedgerEntries={userLedgerEntries}
              />
            )}
          </div>
        </Container>
      </div>
    </>
  )
}

export default Home
