import { payload } from '@/lib/payloadClient'
import PageHeader from '@/components/ui/PageHeader'
import { Container } from '@/components/ui/Container'
import GuideContent from '@/components/ui/GuideContent'
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
        <Container className="py-10">{guide && <GuideContent guide={guide} />}</Container>
      </div>
    </>
  )
}

export default GuideAndRules
