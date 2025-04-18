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
          {challengesData && (
            <ChallengesList challengesData={challengesData} userLedgerEntries={userLedgerEntries} />
          )}
        </Container>
      </div>
    </>
  )
}

export default Challenges
