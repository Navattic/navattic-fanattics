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

  try {
    const [challengesData, sessionUser] = await Promise.all([
      payload.find({
        collection: 'challenges',
        // Remove the deadline filter to get all challenges
        sort: '-deadline',
        depth: 2,
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

    // Filter challenges into active and expired
    const now = new Date()
    const activeChallenges = challengesData.docs.filter(
      (challenge) => new Date(challenge.deadline) > now
    )
    const expiredChallenges = challengesData.docs.filter(
      (challenge) => new Date(challenge.deadline) <= now
    )

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

    if (!session || !sessionUser) {
      return (
        <>
          <PageHeader userPoints={0} noUser={true} />
          <div className="min-h-screen bg-gray-50">
            <Container>
              <Empty
                title="Welcome to the Fanattics Portal"
                description="Please sign in or create an account to view the portal."
                iconName="user"
                button={
                  <Button href="/login" size="md">
                    Sign in
                  </Button>
                }
              />
            </Container>
          </div>
        </>
      )
    }

    // Simplified comment count mapping using the join relationship
    const commentCountMap = Object.fromEntries(
      challengesData.docs.map((challenge) => {
        // Count approved, non-deleted comments from the populated join
        const approvedComments =
          challenge.challengeComments?.docs?.filter(
            (comment) =>
              typeof comment === 'object' &&
              comment !== null &&
              'status' in comment &&
              'deleted' in comment &&
              comment.status === 'approved' &&
              !comment.deleted,
          ) || []

        return [String(challenge.id), approvedComments.length]
      }),
    )

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
            
            {/* Active Challenges Section */}
            <div className="text-md mt-8 mb-3 font-semibold text-gray-600">Active Challenges</div>
            {activeChallenges.length > 0 ? (
              <ChallengesList
                challengesData={activeChallenges}
                userLedgerEntries={userLedgerEntries}
                commentCountMap={commentCountMap}
                userTimezone={sessionUser?.timezone}
              />
            ) : (
              <Empty
                title="No upcoming challenges yet"
                description="Check back soon for updates."
                iconName="award"
              />
            )}

            {/* Expired Challenges Section */}
            <div className="text-md mt-16 mb-3 font-semibold text-gray-600">Expired Challenges</div>
            {expiredChallenges.length > 0 ? (
              <ChallengesList
                challengesData={expiredChallenges}
                userLedgerEntries={userLedgerEntries}
                commentCountMap={commentCountMap}
                userTimezone={sessionUser?.timezone}
                isExpired={true}
              />
            ) : (
              <Empty
                title="No expired challenges yet"
                description="Challenges that have passed their deadline will appear here."
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
