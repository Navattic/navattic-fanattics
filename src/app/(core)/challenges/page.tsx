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

const Challenges = async () => {
  const session = await getServerSession(authOptions)

  // Single query to get all challenges with their related data
  const challengesData = (
    await payload.find({
      collection: 'challenges',
      depth: 2,
      populate: {
        comments: {
          status: true,
          deleted: true,
        },
        ledger: {
          user_id: true,
          amount: true,
        },
      },
    })
  ).docs as PopulatedChallenge[]

  // Filter comments in memory
  const filteredChallenges = challengesData.map((challenge) => ({
    ...challenge,
    comments: challenge.comments?.filter(
      (comment) => comment.status === 'approved' && !comment.deleted,
    ),
  }))

  // Get session user in a single query
  const sessionUser = session?.user?.email
    ? (
        await payload.find({
          collection: 'users',
          where: {
            email: { equals: session.user.email },
          },
          depth: 1,
        })
      ).docs[0]
    : null

  // Process challenges in memory
  const upcomingChallenges = filteredChallenges
    .filter((challenge) => new Date(challenge.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  const pastChallenges = challengesData
    .filter((challenge) => new Date(challenge.deadline) <= new Date())
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())

  // Get user points if logged in
  const userPoints = sessionUser ? await calculateUserPoints({ user: sessionUser }) : 0

  // Get user's ledger entries from the populated data
  const userLedgerEntries = sessionUser
    ? challengesData
        .flatMap((challenge) => challenge.ledger || [])
        .filter(
          (ledger) => typeof ledger.user_id === 'object' && ledger.user_id.id === sessionUser.id,
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
          {upcomingChallenges.length > 0 ? (
            <ChallengesList
              challengesData={upcomingChallenges}
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
          {pastChallenges.length > 0 ? (
            <ChallengesList challengesData={pastChallenges} userLedgerEntries={userLedgerEntries} />
          ) : (
            <Empty title="No previous challenges!" iconName="award" />
          )}
        </Container>
      </div>
    </>
  )
}

export default Challenges
