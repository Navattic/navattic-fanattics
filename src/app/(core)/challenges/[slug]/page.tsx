import { payload } from '@/lib/payloadClient'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getServerSession, User } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Comments } from '@/components/ui/Comments'
import PageHeader from '@/components/ui/PageHeader'
import { Container } from '@/components/ui/Container'
import { formatDate } from '@/utils/formatDate'
import { Badge, Icon } from '@/components/ui'
import { formatTimeRemaining } from '@/utils/formatTimeRemaining'
import { calculateUserPoints } from '@/lib/users/points'
import { Challenge, Ledger, Comment } from '@/payload-types'
import { unstable_cache } from 'next/cache'

interface PopulatedChallenge extends Challenge {
  comments?: Comment[]
  ledger?: Ledger[]
}

// Cache the challenge data fetch
const getChallengeData = unstable_cache(
  async (slug: string) => {
    return await payload.find({
      collection: 'challenges',
      where: { slug: { equals: slug } },
      depth: 2,
      populate: {
        comments: {
          status: true,
          deleted: true,
        },
        ledger: {
          user_id: true,
          amount: true,
        },
      },
    })
  },
  ['challenge-data'],
  { revalidate: 60 * 5 }, // Cache for 5 minutes
)

// Add revalidation since challenges are mostly static
export const revalidate = 3600 // 1h

const ChallengePage = async ({
  params,
}: {
  params: { slug: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) => {
  const session = await getServerSession(authOptions)

  // Single query for both challenge and session user data
  const [challengeData, userData] = await Promise.all([
    getChallengeData(params.slug),
    session?.user?.email
      ? payload.find({
          collection: 'users',
          where: { email: { equals: session.user.email } },
          depth: 1,
        })
      : Promise.resolve(null),
  ])

  if (challengeData.totalDocs === 0) return notFound()

  const sessionUser = userData?.docs[0]
  const userPoints = sessionUser ? await calculateUserPoints({ user: sessionUser }) : 0

  const challenge = {
    ...(challengeData.docs[0] as PopulatedChallenge),
    comments:
      (challengeData.docs[0] as PopulatedChallenge).comments?.filter(
        (comment) => comment.status === 'approved' && !comment.deleted,
      ) || [],
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
                  26
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
          <Comments 
            user={sessionUser} 
            challenge={challenge as Challenge & { comments: Comment[] }} 
          />
        </Container>
      </div>
    </>
  )
}

export default ChallengePage
