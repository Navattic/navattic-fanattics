import { payload } from '@/lib/payloadClient'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PageHeader, Container } from '@/components/ui'
import { Comments } from '@/components/ui/Comments'
import { calculateUserPoints } from '@/lib/users/points'
import { Challenge, Ledger, Comment } from '@/payload-types'
import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'
import { ChallengeDetails } from '@/features/challenges/ChallengeDetails'

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
  { revalidate: 300 }, // 5 minutes for challenge data
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
      <div className="min-h-screen">
        <div className="border-b border-gray-200">
          <ChallengeDetails
            challenge={challenge}
            sessionUser={sessionUser}
            // commentsResult={commentsResult}
          />
        </div>
        <div className="bg-gray-50">
          <Container className="py-10">
            <Suspense fallback={<div>Loading comments...</div>}>
              <Comments
                user={sessionUser}
                challenge={challenge as Challenge & { comments: Comment[] }}
              />
            </Suspense>
          </Container>
        </div>
      </div>
    </>
  )
}

export default ChallengePage
