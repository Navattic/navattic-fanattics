import { payload } from '@/lib/payloadClient'
import { PageHeader, Container, PageTitle, Button, Icon } from '@/components/ui'
import { PodiumCard } from '@/components/ui/Leaderboard/PodiumCard'
import { LeaderboardTable } from '@/components/ui/Leaderboard/LeaderboardTable'
import { User, Ledger, Comment } from '@/payload-types'
import { calculateUserPoints } from '@/lib/users/points'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

interface UserWithStats {
  user: User
  points: number
  challengesCompleted: number
  lastCommentDate: string | null
}

interface PopulatedUser extends User {
  ledgerEntries?: {
    docs?: Ledger[]
    hasNextPage?: boolean
  }
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
  const usersWithStats: UserWithStats[] = users.map((user) => {
    // Calculate completed challenges by counting unique challenge_id entries in ledger
    const completedChallenges = new Set(
      user.ledgerEntries?.docs
        ?.filter(
          (entry: Ledger) =>
            entry.amount > 0 && // Only count positive point entries
            entry.challenge_id && // Must have a challenge reference
            typeof entry.challenge_id === 'object' &&
            entry.challenge_id?.id,
        )
        .map((entry: Ledger) =>
          typeof entry.challenge_id === 'object' ? entry.challenge_id?.id : null,
        )
        .filter(Boolean) || [],
    )

    // Calculate total points earned (only positive entries)
    const totalPointsEarned =
      user.ledgerEntries?.docs
        ?.filter((entry: Ledger) => entry.amount > 0)
        .reduce((total: number, entry: Ledger) => total + (entry.amount || 0), 0) || 0

    return {
      user,
      points: totalPointsEarned, // Changed from total balance to total points earned
      challengesCompleted: completedChallenges.size,
      lastCommentDate:
        user.comments
          ?.filter((comment) => comment.status === 'approved' && !comment.deleted)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          ?.createdAt || null,
    }
  })

  // Sort users based on points, challenges completed, and most recent comment
  const sortedUsers = usersWithStats.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points
    if (a.challengesCompleted !== b.challengesCompleted)
      return b.challengesCompleted - a.challengesCompleted
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
        <Container>
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
                  challengesCompleted={sortedUsers[0].challengesCompleted}
                />
                {sortedUsers.length > 1 && (
                  <PodiumCard
                    user={sortedUsers[1].user}
                    position={2}
                    points={sortedUsers[1].points}
                    challengesCompleted={sortedUsers[1].challengesCompleted}
                  />
                )}
                {sortedUsers.length > 2 && (
                  <PodiumCard
                    user={sortedUsers[2].user}
                    position={3}
                    points={sortedUsers[2].points}
                    challengesCompleted={sortedUsers[2].challengesCompleted}
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
