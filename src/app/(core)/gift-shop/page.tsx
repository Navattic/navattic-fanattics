import { payload } from '@/lib/payloadClient'
import { PageHeader, Container, PageTitle, GiftShopGrid, Empty, Button } from '@/components/ui'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { calculateUserPoints } from '@/lib/users/points'
import Link from 'next/link'

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

  if (!session || !sessionUser) {
    return (
      <>
        <PageHeader userPoints={0} noUser={true} />
        <div className="min-h-screen bg-gray-50">
          <Container className="grid place-items-center">
            <div className="w-full py-20">
              <Empty
                title="Welcome to the Fanattics Portal"
                description="Please sign in or create an account to view the portal."
                iconName="user"
                button={
                  <Link href="/login">
                    <Button size="md" className="mt-3">
                      Sign in
                    </Button>
                  </Link>
                }
              />
            </div>
          </Container>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Gift Shop" userPoints={userPoints} />
      <div className="min-h-screen bg-gray-50">
        <Container>
          <PageTitle
            title="Gift Shop"
            description="Redeem your points with offerings from our gift shop!"
          />
          {products ? (
            <GiftShopGrid products={products} user={sessionUser} userPoints={userPoints} />
          ) : (
            <Empty
              title="No gift shop items yet"
              description="Check back soon for updates."
              iconName="gift"
            />
          )}
        </Container>
      </div>
    </>
  )
}

export default GiftShop
