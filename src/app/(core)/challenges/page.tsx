import { payload } from '@/lib/payloadClient'
import { Icon, Button, Empty, Container, PageHeader, PageTitle } from '@/components/ui'
import { ChallengesList } from '@/components/ui/ChallengesList'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { calculateUserPoints } from '@/lib/users/points'
import { Ledger } from '@/payload-types'

export const revalidate = 3600 // 1h

const Challenges = async () => {
  const session = await getServerSession(authOptions)
  const now = new Date()

  try {
    const [challengesData, sessionUser] = await Promise.all([
      payload.find({
        collection: 'challenges',
        where: {
          or: [
            {
              deadline: {
                greater_than: now,
              },
            },
            {
              deadline: {
                less_than_equal: now,
              },
            },
          ],
        },
        sort: '-deadline', // String format: '-' prefix for descending
        populate: {
          ledger: {
            user_id: true,
            amount: true,
          },
          // Add user population if session exists
          ...(session?.user?.email && {
            user: {
              where: {
                email: { equals: session.user.email },
              },
              depth: 1,
            },
          }),
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
      ? challengesData.docs
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
            {challengesData.docs.length > 0 ? (
              <ChallengesList
                challengesData={challengesData.docs}
                userLedgerEntries={userLedgerEntries}
              />
            ) : (
              <Empty
                title="No upcoming challenges!"
                description="Check back soon for updates."
                iconName="award"
              />
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
