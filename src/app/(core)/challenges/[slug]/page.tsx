import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Link from 'next/link'
import { Comments } from '@/components/ui/Comments'
import PageHeader from '@/components/ui/PageHeader'
import { Container } from '@/components/ui/Container'
import { formatDate } from '@/utils/formatDate'
import { CalendarIcon, CoinsIcon } from 'lucide-react'

const payload = await getPayload({ config })

const ChallengePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params

  const session = await getServerSession(authOptions)
  const sessionUser = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: session?.user?.email,
      },
    },
  })

  const challenges = await payload.find({
    collection: 'challenges',
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (challenges.totalDocs === 0) {
    return notFound()
  }

  const challenge = challenges.docs[0]

  const ledger = await payload.find({
    collection: 'ledger',
    where: {
      challenge_id: {
        equals: challenge.id,
      },
    },
  })

  const userChallengeCompletedData = ledger.docs.filter(
    (ledger) => typeof ledger.user_id === 'object' && ledger.user_id?.id === sessionUser.docs[0].id,
  )

  return (
    <>
      <PageHeader />

      <Container>
        <div className="mt-10 w-full border-b border-gray-200">
          <div className="space-y-2 pb-4 border-b border-gray-200">
            <h1 className="font-medium text-xl pb-2">{challenge.title} </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                Created: {formatDate(challenge.createdAt)}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-4 w-4" />
                Deadline: {formatDate(challenge.deadline)}
              </div>
              <div className="flex items-center">
                <CoinsIcon className="mr-1 h-4 w-4" />
                Points: {challenge.points}
              </div>
            </div>
            {userChallengeCompletedData.length > 0 ? (
              <span className="bg-green-100 text-green-800 py-0.5 px-3 rounded-full text-sm">
                Completed
              </span>
            ) : (
              ''
            )}
          </div>
          <div className="mt-4 text-base text-gray-600 max-w-prose">
            <RichText data={challenge.content} />
          </div>
        </div>
        <Comments />
      </Container>
    </>
  )
}

export default ChallengePage
