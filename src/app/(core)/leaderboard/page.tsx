import { payload } from '@/lib/payloadClient'
import PageHeader from '@/components/ui/PageHeader'
import { Container } from '@/components/ui/Container'
import PodiumCard from '@/components/ui/Leaderboard/PodiumCard'
import LeaderboardTable from '@/components/ui/Leaderboard/LeaderboardTable'
import PageTitle from '@/components/ui/PageTitle'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui'
import { User } from '@/payload-types'
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

const Leaderboard = async () => {
  // Fetch all users
  const users = (
    await payload.find({
      collection: 'users',
    })
  ).docs

  // Fetch points for each user from ledger
  const userPoints = await Promise.all(
    users.map(async (user) => {
      const ledger = await payload.find({
        collection: 'ledger',
        where: {
          user_id: {
            equals: user.id,
          },
        },
      })
      return ledger.docs.reduce((total, entry) => total + (entry.amount || 0), 0)
    }),
  )

  // Fetch comments for each user
  const userComments = await Promise.all(
    users.map(async (user) => {
      const comments = await payload.find({
        collection: 'comments',
        where: {
          user: {
            equals: user.id,
          },
          status: {
            equals: 'approved',
          },
          deleted: {
            equals: false,
          },
        },
        sort: '-createdAt',
      })
      return {
        count: comments.docs.length,
        lastCommentDate: comments.docs[0]?.createdAt || null,
      }
    }),
  )

  // Combine user data with their stats
  const usersWithStats: UserWithStats[] = users.map((user, index) => ({
    user,
    points: userPoints[index],
    commentCount: userComments[index].count,
    lastCommentDate: userComments[index].lastCommentDate,
  }))

  // Sort users based on points, comment count, and most recent comment
  const sortedUsers = usersWithStats.sort((a, b) => {
    // First, compare points
    if (a.points !== b.points) {
      return b.points - a.points
    }

    // If points are equal, compare comment count
    if (a.commentCount !== b.commentCount) {
      return b.commentCount - a.commentCount
    }

    // If comment count is equal, compare last comment date
    if (a.lastCommentDate && b.lastCommentDate) {
      return new Date(b.lastCommentDate).getTime() - new Date(a.lastCommentDate).getTime()
    }

    // If one user has no comments, prioritize the user with comments
    if (a.lastCommentDate) return -1
    if (b.lastCommentDate) return 1

    // If neither has comments, maintain stable sort
    return 0
  })

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

  const currentUserPoints = await calculateUserPoints({ user: sessionUser })

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
