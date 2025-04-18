import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Container } from '@/components/ui/Container'
import Avatar from '@/components/ui/Avatar'
import Statistics from '@/features/profile/Statistics'
import PageHeader from '@/components/ui/PageHeader'
import UserEmail from '@/components/ui/UserEmail'
import Bio from '@/components/ui/Bio'
const payload = await getPayload({ config })

const ProfilePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params

  // Fetch the session for context if needed
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="mx-auto text-center mt-20">
        <h1 className="text-xl font-medium">Please sign in to view profile</h1>
      </div>
    )
  }

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
    <>
      {/* TODO: make /profile not clickable in breadcrumbs here */}
      <PageHeader title={`${user.firstName} ${user.lastName}`} />
      <div className="bg-gray-50 min-h-screen">
        <Container className="pt-10">
          <div className="flex flex-row items-center gap-8 pb-8">
            <Avatar user={user} size="xl" />
            <div className="relative space-y-2">
              <div className="space-y-0">
                <h1 className="text-lg font-medium capitalize">
                  {user.firstName} {user.lastName}
                </h1>
              </div>
              <UserEmail email={user.email} />
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-base font-medium mb-2">About</h2>
            <Bio user={user} />
          </div>
          <div className="mt-8">
            <h2 className="text-base font-medium mb-2">Statistics</h2>
            <Statistics user={user} />
          </div>
        </Container>
      </div>
    </>
  )
}

export default ProfilePage
