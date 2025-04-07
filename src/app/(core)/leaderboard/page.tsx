import { payload } from '@/lib/payloadClient'
import PageHeader from '@/components/ui/PageHeader'
import { Container } from '@/components/ui/Container'
import PodiumCard from '@/components/ui/Leaderboard/PodiumCard'

const Leaderboard = async () => {
  const usersData = (
    await payload.find({
      collection: 'users',
    })
  ).docs

  return (
    <>
      <PageHeader />
      <div className="bg-gray-50 min-h-screen">
        <Container className="pt-10">
          <h1>Leaderboard</h1>
          <div className="grid grid-cols-3 gap-4 mt-10">
            {usersData && (
              <>
                <PodiumCard user={usersData[0]} />
                <PodiumCard user={usersData[1]} />
                <PodiumCard user={usersData[1]} />
                {/* <PodiumCard user={usersData[2]} /> */}
              </>
            )}
          </div>
        </Container>
      </div>
    </>
  )
}

export default Leaderboard
