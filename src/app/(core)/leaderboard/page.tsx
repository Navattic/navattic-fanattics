import { payload } from '@/lib/payloadClient'
import PageHeader from '@/components/ui/PageHeader'
import { Container } from '@/components/ui/Container'
import PodiumCard from '@/components/ui/Leaderboard/PodiumCard'
import LeaderboardTable from '@/components/ui/Leaderboard/LeaderboardTable'
import PageTitle from '@/components/ui/PageTitle'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui'

const Leaderboard = async () => {
  const usersData = (
    await payload.find({
      collection: 'users',
    })
  ).docs

  // TODO: Add logic for the leaderboard
  return (
    <>
      <PageHeader />
      <div className="bg-gray-50 min-h-screen">
        <Container className="max-w-6xl">
          <PageTitle
            title="Leaderboard"
            description="See the most active Fanattics and view their profile."
            button={
              <Button href="/challenges" size="md" variant="outline">
                Complete a challenge <Icon name="arrow-right" className="size-4" />
              </Button>
            }
          />
          <div className="grid grid-cols-3 gap-4 mt-6">
            {usersData && (
              <>
                <PodiumCard user={usersData[0]} position={1} />
                <PodiumCard user={usersData[1]} position={2} />
                <PodiumCard user={usersData[1]} position={3} />
                {/* <PodiumCard user={usersData[2]} /> */}
              </>
            )}
          </div>
          <LeaderboardTable />
        </Container>
      </div>
    </>
  )
}

export default Leaderboard
