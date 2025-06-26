import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Container } from '@/components/ui/Container'
import Avatar from '@/components/ui/Avatar'
import Statistics from '@/features/profile/Statistics'
import PageHeader from '@/components/ui/PageHeader'
import UserEmail from '@/components/ui/UserEmail'
import Bio from '@/components/ui/Bio'
import { calculateUserPoints } from '@/lib/users/points'
import { payload } from '@/lib/payloadClient'
import { User, Ledger, Comment } from '@/payload-types'

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
            <h2 className="mb-2 text-base font-medium">About</h2>
            <Bio user={user} />
          </div>
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
