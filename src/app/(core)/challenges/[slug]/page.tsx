import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import Link from 'next/link'
import { Comments } from '@/components/ui/Comments'
const payload = await getPayload({ config })

const ChallengePage = async ({ params }: { params: { slug: string } }) => {
  const session = await getServerSession(authOptions)
  const sessionUser = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: session?.user?.email,
      },
    },
  })

  const { slug } = await params

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
      <div className="relative w-full p-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">{challenge.title}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-10 max-w-5xl mx-auto">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="font-medium text-4xl border-b pb-2 mb-4 flex items-center gap-2">
            {challenge.title}{' '}
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {challenge.points} points
            </span>
            {userChallengeCompletedData.length > 0 ? (
              <span className="bg-green-100 text-green-800 p-1 px-3 rounded-full text-sm">
                Completed on{' '}
                {new Date(userChallengeCompletedData[0].createdAt).toLocaleDateString()}
              </span>
            ) : (
              ''
            )}
          </h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Deadline: {new Date(challenge.deadline).toLocaleDateString()}
            </p>
          </div>
          <div className="max-w-xl mt-8 prose prose-slate">
            <RichText data={challenge.content} />
          </div>
        </div>

        <Comments />
      </div>
    </>
  )
}

export default ChallengePage
