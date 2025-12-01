import { payload } from '@/lib/payloadClient'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PageHeader, Container, Empty, Button, Link } from '@/components/ui'
import { Comments } from '@/components/ui/Comments'
import { calculateUserPoints } from '@/lib/users/points'
import { DiscussionPost, Comment, User, Ledger } from '@/payload-types'
import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'
import { DiscussionDetails } from '@/features/discussions/DiscussionDetails'

interface PopulatedDiscussionPost extends DiscussionPost {
  comments?: Comment[]
}

interface UserStats {
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

// Cache only the discussion post data (not comments)
const getDiscussionData = unstable_cache(
  async (slug: string) => {
    const discussionResult = await payload.find({
      collection: 'discussionPosts',
      where: { slug: { equals: slug } },
      depth: 2,
    })

    if (discussionResult.totalDocs === 0) {
      return { discussionPost: null }
    }

    return {
      discussionPost: discussionResult.docs[0],
    }
  },
  ['discussion-data'],
  { revalidate: 300 }, // 5 minutes for discussion data
)

export const dynamic = 'force-dynamic'

const DiscussionPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  // Fetch discussion data (cached) and user data
  const [discussionData, userData] = await Promise.all([
    getDiscussionData(slug),
    session?.user?.email
      ? payload.find({
          collection: 'users',
          where: { email: { equals: session.user.email } },
          depth: 1,
        })
      : Promise.resolve(null),
  ])

  if (!discussionData.discussionPost) return notFound()

  const sessionUser = userData?.docs[0]
  const userPoints = sessionUser ? await calculateUserPoints({ user: sessionUser }) : 0

  // Fetch comments directly without caching
  const commentsResult = await payload.find({
    collection: 'comments',
    where: {
      discussionPost: { equals: discussionData.discussionPost.id },
      status: { equals: 'approved' },
      deleted: { equals: false },
    },
    depth: 5,
    sort: 'createdAt',
    limit: 200,
  })

  const discussionPost = {
    ...(discussionData.discussionPost as PopulatedDiscussionPost),
    comments: commentsResult.docs,
  } as PopulatedDiscussionPost

  // Calculate user stats for comment authors
  const userStatsMap = new Map<number, UserStats>()

  if (discussionPost.comments && discussionPost.comments.length > 0) {
    // Extract unique user IDs from comments
    const commentAuthorIds = new Set<number>()
    discussionPost.comments.forEach((comment) => {
      const userId = typeof comment.user === 'object' ? comment.user.id : comment.user
      if (userId) commentAuthorIds.add(userId)
    })

    if (commentAuthorIds.size > 0) {
      // Fetch all ledger entries and comments for these users
      const [allLedgerEntries, allComments] = await Promise.all([
        payload.find({
          collection: 'ledger',
          where: {
            user_id: { in: Array.from(commentAuthorIds) },
          },
          limit: 1000,
          depth: 1,
        }),
        payload.find({
          collection: 'comments',
          where: {
            user: { in: Array.from(commentAuthorIds) },
            status: { equals: 'approved' },
            deleted: { equals: false },
          },
          limit: 1000,
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
      commentAuthorIds.forEach((userId) => {
        const userLedgerEntries = userLedgerMap.get(userId) || []
        const userComments = userCommentsMap.get(userId) || []

        // Calculate challenges completed (unique challenge IDs from positive ledger entries)
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

        // Calculate comments written
        const commentsWritten = userComments.length

        userStatsMap.set(userId, {
          points: totalPointsEarned,
          challengesCompleted: completedChallenges.size,
          itemsRedeemed,
          commentsWritten,
        })
      })
    }
  }

  if (!session || !sessionUser) {
    return (
      <>
        <PageHeader userPoints={0} noUser={true} />
        <div className="min-h-screen bg-gray-50">
          <Container className="grid place-items-center">
            <div className="w-full py-20">
              <Empty
                title="Welcome to the Fanattics Portal"
                description="Please sign in or create an account to view the portal."
                iconName="user"
                button={
                  <Link href="/login">
                    <Button size="md" className="mt-3">
                      Sign in
                    </Button>
                  </Link>
                }
              />
            </div>
          </Container>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader userPoints={userPoints} />
      <div className="min-h-screen">
        <div className="border-b border-gray-200">
          <DiscussionDetails
            discussionPost={discussionPost}
            sessionUser={sessionUser}
            userTimezone={sessionUser?.timezone}
          />
        </div>
        <div className="min-h-[80vh] bg-gray-50">
          <Container className="py-10 max-w-4xl">
            <Suspense fallback={<div>Loading comments...</div>}>
              <Comments
                user={sessionUser}
                discussionPost={discussionPost as DiscussionPost & { comments: Comment[] }}
                userStatsMap={userStatsMap}
              />
            </Suspense>
          </Container>
        </div>
      </div>
    </>
  )
}

export default DiscussionPage
