import { payload } from '@/lib/payloadClient'
import { PageHeader, Container } from '@/components/ui'
import { User, Ledger, Comment } from '@/payload-types'
import { calculateUserPoints } from '@/lib/users/points'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { FanatticsDirectoryPage } from '@/components/ui/FanatticsDirectory/FanatticsDirectoryPage'
import { redirect } from 'next/navigation'

interface UserWithStats {
  user: User
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

interface PopulatedUser extends User {
  ledgerEntries?: {
    docs?: Ledger[]
    hasNextPage?: boolean
  }
  comments?: Comment[]
}

const Fanattics = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <>
        <PageHeader userPoints={0} noUser={true} />
        <div className="min-h-screen bg-gray-50">
          <Container className="grid place-items-center">
            <div className="w-full py-20">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Welcome to the Fanattics Portal
                </h2>
                <p className="text-gray-500 mb-4">
                  Please sign in or create an account to view the directory.
                </p>
              </div>
            </div>
          </Container>
        </div>
      </>
    )
  }

  const { page, pageSize } = await searchParams
  const parsedPage = page ? parseInt(page, 10) : 1
  const currentPage = parsedPage > 0 ? parsedPage : 1
  const parsedPageSize = pageSize ? parseInt(pageSize, 10) : 12
  const limit = parsedPageSize > 0 ? parsedPageSize : 12

  // Fetch users with pagination
  // Filter for users with non-empty bios
  // Note: Payload's exists: true only checks for null/undefined, not empty strings
  // So we need to filter client-side as well
  const usersResult = await payload.find({
    collection: 'users',
    where: {
      and: [
        { onboardingCompleted: { equals: true } },
        { firstName: { exists: true } },
        { lastName: { exists: true } },
        { bio: { exists: true } },
      ],
    },
    limit: 1000, // Fetch all to filter properly, then paginate client-side
    sort: '-createdAt',
    depth: 2,
  })

  // Filter out users with empty or whitespace-only bios
  const allUsersWithBio = usersResult.docs.filter(
    (user) => user.bio && typeof user.bio === 'string' && user.bio.trim().length > 0,
  )

  // Calculate pagination on filtered results
  const totalUsers = allUsersWithBio.length
  const totalPages = Math.ceil(totalUsers / limit)
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit

  // Get the users for the current page
  const users = allUsersWithBio
    .slice(startIndex, endIndex)
    .map((user) => user as PopulatedUser)

  // Redirect to page 1 if current page is invalid
  if (currentPage > totalPages && totalPages > 0) {
    redirect('/fanattics')
  }

  // Fetch all ledger entries and comments for stats calculation
  const [allLedgerEntries, allComments] = await Promise.all([
    payload.find({
      collection: 'ledger',
      limit: 1000,
      depth: 1,
    }),
    payload.find({
      collection: 'comments',
      limit: 1000,
      where: {
        status: { equals: 'approved' },
        deleted: { equals: false },
      },
    }),
  ])

  // Create maps for efficient lookup
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

  // Calculate stats for each user
  const usersWithStats: UserWithStats[] = users.map((user) => {
    const userLedgerEntries = userLedgerMap.get(user.id) || []
    const userComments = userCommentsMap.get(user.id) || []

    const completedChallenges = new Set(
      userLedgerEntries
        .filter(
          (entry: Ledger) =>
            entry.amount > 0 &&
            entry.challenge_id &&
            typeof entry.challenge_id === 'object' &&
            entry.challenge_id?.id,
        )
        .map((entry: Ledger) =>
          typeof entry.challenge_id === 'object' ? entry.challenge_id?.id : null,
        )
        .filter(Boolean),
    )

    const totalPointsEarned = userLedgerEntries
      .filter((entry: Ledger) => entry.amount > 0)
      .reduce((total: number, entry: Ledger) => total + (entry.amount || 0), 0)

    const itemsRedeemed = userLedgerEntries.filter(
      (entry: Ledger) => entry.amount < 0 && entry.reason?.toLowerCase().includes('redeem'),
    ).length

    const commentsWritten = userComments.length

    return {
      user,
      points: totalPointsEarned,
      challengesCompleted: completedChallenges.size,
      itemsRedeemed,
      commentsWritten,
    }
  })

  // Get current user points for PageHeader
  // Fetch session user separately to ensure we have the right user
  const sessionUserResult = await payload.find({
    collection: 'users',
    where: {
      email: { equals: session.user.email },
    },
    limit: 1,
    depth: 1,
  })
  const sessionUser = sessionUserResult.docs[0] as User | undefined
  const currentUserPoints = sessionUser
    ? await calculateUserPoints({
        user: sessionUser,
      })
    : 0

  return (
    <>
      <PageHeader userPoints={currentUserPoints} />
      <div className="min-h-screen bg-gray-50 pb-20">
        <Container>
          <FanatticsDirectoryPage
            users={usersWithStats}
            currentPage={currentPage}
            totalPages={totalPages}
            totalUsers={totalUsers}
            pageSize={limit}
            currentUserSlug={sessionUser?.slug || null}
          />
        </Container>
      </div>
    </>
  )
}

export default Fanattics

