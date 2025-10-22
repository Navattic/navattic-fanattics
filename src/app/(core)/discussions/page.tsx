import { payload } from '@/lib/payloadClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PageHeader, Container, Empty, Button, Icon, PageTitle } from '@/components/ui'
import { calculateUserPoints } from '@/lib/users/points'
import { DiscussionsList } from '@/components/ui/DiscussionsList'
import { CreatePostModal } from '@/features/discussions/CreatePostModal'

export const revalidate = 300 // 5 minutes

const Discussions = async () => {
  const session = await getServerSession(authOptions)

  try {
    const [discussionsData, sessionUser] = await Promise.all([
      payload.find({
        collection: 'discussionPosts',
        where: {
          status: {
            equals: 'published',
          },
        },
        sort: '-lastActivity',
        depth: 2,
        limit: 50,
      }),
      session?.user?.email
        ? payload
            .find({
              collection: 'users',
              where: {
                email: { equals: session.user.email },
              },
              depth: 1,
            })
            .then((res) => res.docs[0])
        : Promise.resolve(null),
    ])

    const userPoints = sessionUser ? await calculateUserPoints({ user: sessionUser }) : 0

    if (!session || !sessionUser) {
      return (
        <>
          <PageHeader userPoints={0} noUser={true} />
          <div className="min-h-screen bg-gray-50">
            <Container>
              <Empty
                title="Welcome to the Fanattic Portal"
                description="Please sign in or create an account to view the portal."
                iconName="user"
                button={
                  <Button href="/login" size="md">
                    Sign in
                  </Button>
                }
              />
            </Container>
          </div>
        </>
      )
    }

    // Calculate comment count map for discussions
    const commentCountMap = Object.fromEntries(
      discussionsData.docs.map((discussion) => {
        const approvedComments =
          discussion.discussionComments?.docs?.filter(
            (comment) =>
              typeof comment === 'object' &&
              comment !== null &&
              'status' in comment &&
              'deleted' in comment &&
              comment.status === 'approved' &&
              !comment.deleted,
          ) || []

        return [String(discussion.id), approvedComments.length]
      }),
    )

    return (
      <>
        <PageHeader userPoints={userPoints} />
        <div className="min-h-screen bg-gray-50">
          <Container>
            <PageTitle
              title="Discussions"
              description="Share ideas, ask questions, and engage with the community"
              button={<CreatePostModal user={sessionUser} />}
            />
            <div className="text-md mt-8 mb-3 font-semibold text-gray-600">Recent posts</div>
            {discussionsData.docs.length > 0 ? (
              <DiscussionsList
                discussionsData={discussionsData.docs}
                commentCountMap={commentCountMap}
                userTimezone={sessionUser?.timezone}
              />
            ) : (
              <Empty
                title="No discussions yet"
                description="Be the first to start a discussion!"
                iconName="message-circle"
                button={
                  <div className="mt-4">
                    <CreatePostModal user={sessionUser} buttonColorScheme="outline"/>
                  </div>
                }
              />
            )}
          </Container>
        </div>
      </>
    )
  } catch (error) {
    console.error('Error fetching discussions:', error)
    throw new Error('Failed to load discussions')
  }
}

export default Discussions
