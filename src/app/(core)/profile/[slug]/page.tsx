import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Container, Avatar, PageHeader, Icon, UserEmail, Bio } from '@/components/ui'
import { Statistics } from '@/features/profile/Statistics'
import { ProfileEditButton } from '@/features/profile/ProfileEditButton'
import { calculateUserPoints } from '@/lib/users/points'
import { payload } from '@/lib/payloadClient'
import { User, Ledger, Comment } from '@/payload-types'
import { ArrowUpRightIcon } from 'lucide-react'

interface PopulatedUser extends User {
  ledgerEntries?: {
    docs?: Ledger[]
    hasNextPage?: boolean
  }
  comments?: {
    docs?: Comment[]
    hasNextPage?: boolean
  }
}

const ProfilePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params

  // Fetch the session for context if needed
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="mx-auto mt-20 text-center">
        <h1 className="text-xl font-medium">Please sign in to view profile</h1>
      </div>
    )
  }

  // Fetch the current user to check if this is their own profile
  const currentUserResponse = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: session.user.email,
      },
    },
    limit: 1,
  })

  const currentUser = currentUserResponse.docs[0]

  // Fetch the user profile with populated data
  const userResponse = await payload.find({
    collection: 'users',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
    populate: {
      ledger: {
        challenge_id: true,
        amount: true,
      },
      comments: {
        status: true,
        deleted: true,
      },
    },
  })

  // If no user found with this slug, return 404
  if (!userResponse.docs || userResponse.docs.length === 0) {
    notFound()
  }

  const user = userResponse.docs[0] as PopulatedUser

  // Check if this is the user's own profile
  const isOwnProfile = currentUser && currentUser.id === user.id

  // Calculate total points earned (only positive entries)
  const totalPointsEarned =
    user.ledgerEntries?.docs
      ?.filter((entry) => entry.amount > 0)
      .reduce((total, entry) => total + (entry.amount || 0), 0) || 0

  // Calculate current balance (for PageHeader)
  const currentBalance = await calculateUserPoints({ user })

  // Calculate real statistics
  const completedChallenges = new Set(
    user.ledgerEntries?.docs
      ?.filter(
        (entry) =>
          entry.amount > 0 &&
          entry.challenge_id &&
          typeof entry.challenge_id === 'object' &&
          entry.challenge_id?.id,
      )
      .map((entry) => (typeof entry.challenge_id === 'object' ? entry.challenge_id?.id : null))
      .filter(Boolean) || [],
  )

  const itemsRedeemed =
    user.ledgerEntries?.docs?.filter(
      (entry) => entry.amount < 0 && entry.reason?.toLowerCase().includes('redeem'),
    ).length || 0

  const commentsWritten =
    user.comments?.docs?.filter((comment) => comment.status === 'approved' && !comment.deleted)
      .length || 0

  const userStats = {
    points: totalPointsEarned, // Total points earned over time
    challengesCompleted: completedChallenges.size,
    itemsRedeemed,
    commentsWritten,
  }

  return (
    <>
      {/* TODO: make /profile not clickable in breadcrumbs here */}
      <PageHeader title={`${user.firstName} ${user.lastName}`} userPoints={currentBalance} />
      <div className="min-h-screen bg-gray-50">
        <Container className="pt-10">
          <div className="flex flex-row items-center justify-between pb-8">
            <div className="flex flex-row items-center gap-8">
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

            {/* Edit profile button - only shown on own profile */}
            <ProfileEditButton isOwnProfile={isOwnProfile} />
          </div>

          <div className="mt-4">
            <h2 className="mb-2 text-base font-medium">About</h2>
            <Bio user={user} />
          </div>

          {(user.linkedinUrl || user.interactiveDemoUrl) && (
            <div className="mt-8">
              <h2 className="mb-2 text-base font-medium">Links</h2>
              <div className="space-y-3">
                {user.linkedinUrl && (
                  <div className="inset-shadow flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="grid aspect-square size-8 place-items-center rounded-md border border-gray-200">
                      <Icon name="linkedin" className="size-4 text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex text-sm text-blue-500"
                      >
                        LinkedIn Profile
                        <ArrowUpRightIcon className="ml-0.5 size-3 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[104%] group-hover:opacity-100" />
                      </a>
                    </div>
                  </div>
                )}
                {user.interactiveDemoUrl && (
                  <div className="inset-shadow flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="grid aspect-square size-8 place-items-center rounded-md border border-gray-200">
                      <Icon name="navattic" className="size-5 text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                      <a
                        href={user.interactiveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex text-sm text-blue-500"
                      >
                        Favorite Interactive Demo
                        <ArrowUpRightIcon className="ml-0.5 size-3 opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-[104%] group-hover:opacity-100" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="mb-2 text-base font-medium">Statistics</h2>
            <Statistics userStats={userStats} />
          </div>
        </Container>
      </div>
    </>
  )
}

export default ProfilePage
