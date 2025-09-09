import { payload } from '@/lib/payloadClient'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PageHeader, Container, Badge, Icon } from '@/components/ui'
import { Comments } from '@/components/ui/Comments'
import { formatTimeRemaining } from '@/utils/formatTimeRemaining'
import { calculateUserPoints } from '@/lib/users/points'
import { Challenge, Ledger, Comment } from '@/payload-types'
import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'
import { formatDate } from '@/utils/formatDate'

interface PopulatedChallenge extends Challenge {
  comments?: Comment[]
  ledger?: Ledger[]
}

// Cache only the challenge data (not comments)
const getChallengeData = unstable_cache(
  async (slug: string) => {
    const challengeResult = await payload.find({
      collection: 'challenges',
      where: { slug: { equals: slug } },
      depth: 2,
      populate: {
        ledger: {
          user_id: true,
          amount: true,
        },
      },
    })

    if (challengeResult.totalDocs === 0) {
      return { challenge: null }
    }

    return {
      challenge: challengeResult.docs[0],
    }
  },
  ['challenge-data'],
  { revalidate: 3600 }, // 1 hour for challenge data
)

// Add this export to force dynamic rendering
export const dynamic = 'force-dynamic'

const ChallengePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  // Fetch challenge data (cached) and user data
  const [challengeData, userData] = await Promise.all([
    getChallengeData(slug),
    session?.user?.email
      ? payload.find({
          collection: 'users',
          where: { email: { equals: session.user.email } },
          depth: 1,
        })
      : Promise.resolve(null),
  ])

  if (!challengeData.challenge) return notFound()

  const sessionUser = userData?.docs[0]
  const userPoints = sessionUser ? await calculateUserPoints({ user: sessionUser }) : 0

  // Fetch comments directly without caching
  const commentsResult = await payload.find({
    collection: 'comments',
    where: {
      challenge: { equals: challengeData.challenge.id },
      status: { equals: 'approved' },
      deleted: { equals: false },
    },
    depth: 5,
    sort: 'createdAt',
    limit: 200,
  })

  const challenge = {
    ...(challengeData.challenge as PopulatedChallenge),
    comments: commentsResult.docs,
  } as PopulatedChallenge

  // Filter user's ledger entries from the populated data
  const userChallengeCompletedData =
    challenge.ledger?.filter(
      (ledger) => typeof ledger.user_id === 'object' && ledger.user_id?.id === sessionUser?.id,
    ) || []

  if (!sessionUser) {
    return (
      <>
        <PageHeader userPoints={0} />
        <p>Please login to view this challenge</p>
      </>
    )
  }

  return (
    <>
      <PageHeader userPoints={userPoints} />
      <div className="min-h-screen bg-gray-50">
        <Container className="pt-10">
          <div className="content-container">
            <div className="space-y-4 border-b border-gray-200 p-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-medium">{challenge.title}</h1>
                  <span className="text-sm text-gray-500">
                    Published {formatDate(challenge.createdAt, { abbreviateMonth: true })}
                  </span>
                </div>
                {userChallengeCompletedData.length > 0 ? (
                  <Badge colorScheme="green">
                    <Icon name="award" size="sm" className="mr-1" />
                    Completed
                  </Badge>
                ) : (
                  ''
                )}
              </div>
              <div className="flex flex-wrap gap-5 text-sm">
                <Badge size="md" colorScheme="brand">
                  <Icon name="coins" size="sm" className="mr-1" />
                  {challenge.points} points
                </Badge>
                <div className="flex items-center justify-center gap-1 text-gray-500">
                  <Icon name="message-square" className="text-gray-400" />
                  {commentsResult.totalDocs || 0}
                </div>
                <div className="flex items-center justify-center gap-1 text-gray-500">
                  <Icon name="clock" className="text-gray-400" />
                  {formatTimeRemaining(challenge.deadline)}
                </div>
              </div>
            </div>
            <div className="max-w-prose p-8 pt-6 pb-2 text-base text-gray-600">
              <RichText data={challenge.content} className="payload-rich-text" />
            </div>
          </div>
          {/* Make comments section dynamic */}
          <Suspense fallback={<div>Loading comments...</div>}>
            <Comments
              user={sessionUser}
              challenge={challenge as Challenge & { comments: Comment[] }}
            />
          </Suspense>
        </Container>
      </div>
    </>
  )
}

export default ChallengePage
