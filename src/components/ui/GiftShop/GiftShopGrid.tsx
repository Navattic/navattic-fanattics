'use client'

import { Media, Product, User } from '@/payload-types'
import Image from 'next/image'
import { Button, Badge, Icon } from '@/components/ui'
import { useState } from 'react'
import RedeemProductModal from './RedeemProductModal'
import { redeemProduct } from '@/features/giftShop/actions'

const ProductCard = ({
  product,
  user,
  userPoints,
}: {
  product: Product
  user: User
  userPoints: number
}) => {
  const image = product.image as Media
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const hasEnoughPoints = userPoints >= product.price

  const handleRedeem = () => {
    setIsModalOpen(true)
  }

  const handleConfirmRedeem = async () => {
    try {
      setIsRedeeming(true)
      const result = await redeemProduct({
        productId: product.id,
        userId: user.id,
        points: product.price,
        productTitle: product.title,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // The modal will handle the flip animation
    } catch (error) {
      console.error('Error redeeming product:', error)
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <>
      <div className="inset-shadow flex h-full flex-col space-y-5 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5">
        <div className="relative aspect-[5/3] h-auto w-full overflow-hidden rounded-xl bg-gray-50">
          {image.url && (
            <Image
              src={image.url}
              alt={image.alt}
              className="h-full w-full object-contain"
              width={image.width ?? 0}
              height={image.height ?? 0}
            />
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-3">
            <div className="space-y-1">
              <h2 className="text-md font-semibold">{product.title}</h2>
              <Badge iconLeft="coins">{product.price} credits</Badge>
            </div>
            <p className="pb-5 text-sm text-gray-500">{product.description}</p>
          </div>
          <Button
            size="lg"
            className="w-full"
            variant={hasEnoughPoints ? 'solid' : 'outline'}
            disabled={!hasEnoughPoints}
            onClick={handleRedeem}
          >
            {hasEnoughPoints ? (
              <>
                Redeem gift <Icon name="gift" />
              </>
            ) : (
              'Insufficient credits'
            )}
          </Button>
        </div>
      </div>
      <RedeemProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        user={user}
        userPoints={userPoints}
        onConfirm={handleConfirmRedeem}
        isRedeeming={isRedeeming}
      />
    </>
  )
}

const GiftShopGrid = ({
  products,
  user,
  userPoints,
}: {
  products: Product[]
  user: User
  userPoints: number
}) => {
  return (
    <div className="relative grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} user={user} userPoints={userPoints} />
      ))}
    </div>
  )
}

export default GiftShopGrid
