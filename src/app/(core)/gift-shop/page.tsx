import { payload } from '@/lib/payloadClient'
import { PageHeader, Container, PageTitle, GiftShopGrid } from '@/components/ui'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { calculateUserPoints } from '@/lib/users/points'

const GiftShop = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return (
      <div className="mx-auto mt-20 text-center">
        <h1 className="text-xl font-medium">Please sign in to view the gift shop</h1>
      </div>
    )
  }

  const products = (
    await payload.find({
      collection: 'Products',
    })
  ).docs

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
      <PageHeader title="Gift Shop" userPoints={userPoints} />
      <div className="min-h-screen bg-gray-50">
        <Container>
          <PageTitle
            title="Gift Shop"
            description="Redeem your points with offerings from our gift shop!"
          />
          {products && (
            <GiftShopGrid products={products} user={sessionUser} userPoints={userPoints} />
          )}
        </Container>
      </div>
    </>
  )
}

export default GiftShop
