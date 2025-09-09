import { payload } from '@/lib/payloadClient'
import { GuideContent, PageHeader, Container, PageTitle, Empty } from '@/components/ui'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { calculateUserPoints } from '@/lib/users/points'

const GuideAndRules = async () => {
  const guide = await payload.findGlobal({
    slug: 'guide',
  })

  const session = await getServerSession(authOptions)
  const sessionUser = (
    await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: session?.user?.email,
        },
      },
    })
  ).docs[0]

  const userPoints = await calculateUserPoints({ user: sessionUser })

  return (
    <>
      <PageHeader title="Rules & Guide" userPoints={userPoints} />
      <div className="min-h-screen bg-gray-50">
        <Container>
          <PageTitle
            title="Rules & Guide"
            description="Learn about the rules and guide for the Navattic Portal."
          />
          {guide ? (
            <GuideContent guide={guide} />
          ) : (
            <Empty
              title="No rules and guide uploaded yet"
              description="Check back soon for updates."
              iconName="book-open"
            />
          )}
        </Container>
      </div>
    </>
  )
}

export default GuideAndRules
