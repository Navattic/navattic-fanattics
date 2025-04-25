import { getPayload } from 'payload'
import config from '@/payload.config'
import PageHeader from '@/components/ui/PageHeader'
import PageTitle from '@/components/ui/PageTitle'
import { Container } from '@/components/ui/Container'
import ChallengesList from '@/components/ui/ChallengesList'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { Icon } from '@/components/ui'
import { Button } from '@/components/ui'
import Empty from '@/components/ui/Empty'

const payload = await getPayload({ config })

const Challenges = async () => {
  const session = await getServerSession(authOptions)

  const challengesData = (
    await payload.find({
      collection: 'challenges',
    })
  ).docs

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

  // Sort challenges by deadline (expiring soonest appear first)
  const upcomingChallenges = challengesData
    .filter((challenge) => new Date(challenge.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  // Sort past challenges by deadline (oldest last)
  const pastChallenges = challengesData
    .filter((challenge) => new Date(challenge.deadline) <= new Date())
    .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())

  return (
    <>
      <PageHeader />
      <div className="bg-gray-50 min-h-screen">
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
          <div className="mt-8 text-md font-semibold text-gray-600 mb-3">Recent Challenges</div>
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
          <div className="mt-8 text-md font-semibold text-gray-600 mb-3">Previous Challenges</div>
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
