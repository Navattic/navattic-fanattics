import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Container } from '@/components/ui/Container'
import { formatDate } from '@/utils/formatDate'
import Avatar from '@/components/ui/Avatar'
import Statistics from '@/features/profile/Statistics'

const payload = await getPayload({ config })

const ProfilePage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = await params

  // Fetch the session for context if needed
  const session = await getServerSession(authOptions)

  // Fetch the user profile based on the slug
  const userResponse = await payload.find({
    collection: 'users',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 1,
  })

  // If no user found with this slug, return 404
  if (!userResponse.docs || userResponse.docs.length === 0) {
    notFound()
  }

  const user = userResponse.docs[0]


  return (
    <Container>
      <div className="mt-20 flex flex-row gap-8 border-b border-gray-200 pb-8">
        <Avatar user={user} size="full" />
        <div className="relative space-y-2">
          <h1 className="text-lg font-bold capitalize">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-base text-gray-500">{user.email}</p>
          <p className="text-base text-gray-500">Joined {formatDate(user.createdAt)}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-base font-medium mb-4">Statistics</h2>
        <Statistics user={user} />
      </div>
    </Container>
  )
}

export default ProfilePage
