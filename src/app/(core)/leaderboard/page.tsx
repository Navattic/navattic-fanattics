import { payload } from '@/lib/payloadClient'
import { PageHeader, Container, PageTitle, Button, Icon, Empty } from '@/components/ui'
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
  itemsRedeemed: number
  commentsWritten: number
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
  const users = (
    await payload.find({
      collection: 'users',
      where: {
        onboardingCompleted: { equals: true },
      },
      limit: 100,
      depth: 2,
    })
  ).docs as PopulatedUser[]

  const allLedgerEntries = await payload.find({
    collection: 'ledger',
    limit: 1000, // Adjust as needed
    depth: 1,
  })

  const allComments = await payload.find({
    collection: 'comments',
    limit: 1000,
    where: {
      status: { equals: 'approved' },
      deleted: { equals: false },
    },
  })

  const userLedgerMap = new Map<number, Ledger[]>()
  allLedgerEntries.docs.forEach((entry) => {
    const userId = typeof entry.user_id === 'object' ? entry.user_id.id : entry.user_id
    if (!userLedgerMap.has(userId)) {
      userLedgerMap.set(userId, [])
    }
    userLedgerMap.get(userId)!.push(entry)
  })

  const userCommentsMap = new Map<number, Comment[]>()
  allComments.docs.forEach((comment) => {
    const userId = typeof comment.user === 'object' ? comment.user.id : comment.user
    if (!userCommentsMap.has(userId)) {
      userCommentsMap.set(userId, [])
    }
    userCommentsMap.get(userId)!.push(comment)
  })

  const usersWithStats: UserWithStats[] = users.map((user) => {
    const userLedgerEntries = userLedgerMap.get(user.id) || []
    const userComments = userCommentsMap.get(user.id) || []

    const completedChallenges = new Set(
      userLedgerEntries
        .filter(
          (entry: Ledger) =>
            entry.amount > 0 && // Only count positive point entries
            entry.challenge_id && // Must have a challenge reference
            typeof entry.challenge_id === 'object' &&
            entry.challenge_id?.id,
        )
        .map((entry: Ledger) =>
          typeof entry.challenge_id === 'object' ? entry.challenge_id?.id : null,
        )
        .filter(Boolean),
    )

    // Calculate total points earned (only positive entries)
    const totalPointsEarned = userLedgerEntries
      .filter((entry: Ledger) => entry.amount > 0)
      .reduce((total: number, entry: Ledger) => total + (entry.amount || 0), 0)

    // Calculate items redeemed
    const itemsRedeemed = userLedgerEntries.filter(
      (entry: Ledger) => entry.amount < 0 && entry.reason?.toLowerCase().includes('redeem'),
    ).length

    // Calculate comments written (now using the separate comments query)
    const commentsWritten = userComments.length

    return {
      user,
      points: totalPointsEarned,
      challengesCompleted: completedChallenges.size,
      itemsRedeemed,
      commentsWritten,
      lastCommentDate:
        userComments.length > 0
          ? userComments.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )[0]?.createdAt || null
          : null,
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

  if (!session) {
    return (
      <>
        <PageHeader userPoints={0} noUser={true} />
        <div className="min-h-screen bg-gray-50">
          <Container className="grid place-items-center">
            <Empty
              title="Welcome to the Fanattics Portal"
              description="Please sign in or create an account to view the portal."
              iconName="user"
              button={
                <Button href="/login" size="md" className="mt-3">
                  Sign in
                </Button>
              }
            />
          </Container>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader userPoints={currentUserPoints} />
      <div className="min-h-screen bg-gray-50 pb-20">
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
          {sortedUsers.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              <>
                <PodiumCard
                  user={sortedUsers[0].user}
                  position={1}
                  points={sortedUsers[0].points}
                  challengesCompleted={sortedUsers[0].challengesCompleted}
                  itemsRedeemed={0}
                  commentsWritten={0}
                />
                {sortedUsers.length > 1 && (
                  <PodiumCard
                    user={sortedUsers[1].user}
                    position={2}
                    points={sortedUsers[1].points}
                    challengesCompleted={sortedUsers[1].challengesCompleted}
                    itemsRedeemed={0}
                    commentsWritten={0}
                  />
                )}
                {sortedUsers.length > 2 && (
                  <PodiumCard
                    user={sortedUsers[2].user}
                    position={3}
                    points={sortedUsers[2].points}
                    challengesCompleted={sortedUsers[2].challengesCompleted}
                    itemsRedeemed={0}
                    commentsWritten={0}
                  />
                )}
              </>
            </div>
          ) : (
            <Empty
              title="No users found"
              description="Check back soon for updates."
              iconName="award"
            />
          )}
          {sortedUsers.length > 0 && <LeaderboardTable users={sortedUsers} />}
        </Container>
      </div>
    </>
  )
}

export default Leaderboard
