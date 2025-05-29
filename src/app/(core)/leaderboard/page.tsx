import { payload } from '@/lib/payloadClient'
import PageHeader from '@/components/ui/PageHeader'
import { Container } from '@/components/ui/Container'
import PodiumCard from '@/components/ui/Leaderboard/PodiumCard'
import LeaderboardTable from '@/components/ui/Leaderboard/LeaderboardTable'
import PageTitle from '@/components/ui/PageTitle'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui'
import { User, Ledger, Comment } from '@/payload-types'
// import OpenProfileDrawer from '@/components/ui/UserProfilePreviewModal/OpenProfileDrawer'
import { calculateUserPoints } from '@/lib/users/points'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

interface UserWithStats {
  user: User
  points: number
  commentCount: number
  lastCommentDate: string | null
}

interface PopulatedUser extends User {
  ledger?: Ledger[]
  comments?: Comment[]
}

const Leaderboard = async () => {
  // Fetch users with their points and comments in a single query using population
  const users = (
    await payload.find({
      collection: 'users',
      limit: 100,
      depth: 2,
    })
  ).docs as PopulatedUser[]

  // Process user stats in memory
  const usersWithStats: UserWithStats[] = users.map((user) => ({
    user,
    points:
      user.ledger?.reduce((total: number, entry: Ledger) => total + (entry.amount || 0), 0) || 0,
    commentCount:
      user.comments?.filter((comment) => comment.status === 'approved' && !comment.deleted)
        .length || 0,
    lastCommentDate:
      user.comments
        ?.filter((comment) => comment.status === 'approved' && !comment.deleted)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        ?.createdAt || null,
  }))

  // Sort users based on points, comment count, and most recent comment
  const sortedUsers = usersWithStats.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points
    if (a.commentCount !== b.commentCount) return b.commentCount - a.commentCount
    if (a.lastCommentDate && b.lastCommentDate) {
      return new Date(b.lastCommentDate).getTime() - new Date(a.lastCommentDate).getTime()
    }
    if (a.lastCommentDate) return -1
    if (b.lastCommentDate) return 1
    return 0
  })

  const session = await getServerSession(authOptions)

  // Only fetch current user points if logged in
  const currentUserPoints = session?.user?.email
    ? await calculateUserPoints({
        user: users.find((u) => u.email === session.user.email) as User,
      })
    : 0

  return (
    <>
      <PageHeader userPoints={currentUserPoints} />
      <div className="min-h-screen bg-gray-50">
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
          <div className="grid grid-cols-3 gap-4">
            {sortedUsers.length > 0 && (
              <>
                <PodiumCard
                  user={sortedUsers[0].user}
                  position={1}
                  points={sortedUsers[0].points}
                />
                {sortedUsers.length > 1 && (
                  <PodiumCard
                    user={sortedUsers[1].user}
                    position={2}
                    points={sortedUsers[1].points}
                  />
                )}
                {sortedUsers.length > 2 && (
                  <PodiumCard
                    user={sortedUsers[2].user}
                    position={3}
                    points={sortedUsers[2].points}
                  />
                )}
              </>
            )}
          </div>
          <LeaderboardTable users={sortedUsers} />
        </Container>
      </div>
    </>
  )
}

export default Leaderboard
