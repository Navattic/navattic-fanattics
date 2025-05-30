import { payload } from '@/lib/payloadClient'
import PageHeader from '@/components/ui/PageHeader'
import PageTitle from '@/components/ui/PageTitle'
import { Container } from '@/components/ui/Container'
import ChallengesList from '@/components/ui/ChallengesList'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { Icon } from '@/components/ui'
import { Button } from '@/components/ui'
import Empty from '@/components/ui/Empty'
import { calculateUserPoints } from '@/lib/users/points'
import { Challenge, Ledger, Comment } from '@/payload-types'

interface PopulatedChallenge extends Challenge {
  comments?: Comment[]
  ledger?: Ledger[]
}


// Add revalidation to ensure fresh data
export const revalidate = 0

const Challenges = async () => {
  const session = await getServerSession(authOptions)
  const now = new Date()

  try {
    const [upcomingChallengesData, pastChallengesData, sessionUser] = await Promise.all([
      payload.find({
        collection: 'challenges',
        where: {
          deadline: {
            greater_than: now,
          },
        },
        sort: 'deadline',
        depth: 1,
        // Only populate what's needed for the list view
        populate: {
          ledger: {
            user_id: true,
            amount: true,
          },
        },
      }),
      payload.find({
        collection: 'challenges',
        where: {
          deadline: {
            less_than_equal: now,
          },
        },
        sort: '-deadline', // Note the - for descending
        depth: 1,
        populate: {
          ledger: {
            user_id: true,
            amount: true,
          },
        },
      }),
      session?.user?.email
        ? payload
            .find({
              collection: 'users',
              where: {
                email: { equals: session.user.email },
              },
              depth: 1,
            })
            .then((res) => res.docs[0])
        : Promise.resolve(null),
    ])

    const userPoints = sessionUser ? await calculateUserPoints({ user: sessionUser }) : 0

    // Improve type safety for ledger filtering
    const userLedgerEntries = sessionUser
      ? [...upcomingChallengesData.docs, ...pastChallengesData.docs]
          .flatMap((challenge) => (challenge.ledger || []) as Ledger[])
          .filter(
            (ledger): ledger is Ledger =>
              typeof ledger.user_id === 'object' &&
              ledger.user_id !== null &&
              'id' in ledger.user_id &&
              ledger.user_id.id === sessionUser.id,
          )
      : []

    return (
      <>
        <PageHeader userPoints={userPoints} />
        <div className="min-h-screen bg-gray-50">
          <Container>
            <PageTitle
              title="Challenges"
              description="Complete challenges to earn points, which you can redeem for rewards"
              button={
                <Button href="/gift-shop" size="md" variant="outline">
                  View rewards <Icon name="arrow-right" className="size-4" />
                </Button>
              }
            />
            <div className="text-md mt-8 mb-3 font-semibold text-gray-600">Active Challenges</div>
            {upcomingChallengesData.docs.length > 0 ? (
              <ChallengesList
                challengesData={upcomingChallengesData.docs}
                userLedgerEntries={userLedgerEntries}
              />
            ) : (
              <Empty
                title="No upcoming challenges!"
                description="Check back soon for updates."
                iconName="award"
              />
            )}
            <div className="text-md mt-8 mb-3 font-semibold text-gray-600">Past Challenges</div>
            {pastChallengesData.docs.length > 0 ? (
              <ChallengesList
                challengesData={pastChallengesData.docs}
                userLedgerEntries={userLedgerEntries}
              />
            ) : (
              <Empty title="No previous challenges!" iconName="award" />
            )}
          </Container>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error fetching challenges:', error)
    throw new Error('Failed to load challenges')
  }
}

export default Challenges
