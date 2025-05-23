'use client'

import { Media, Product, User } from '@/payload-types'
import { Badge, Button, Icon } from '@/components/ui'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { revalidatePath } from 'next/cache'

interface RedeemProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  user: User
  onConfirm: () => void
  userPoints: number
  isRedeeming: boolean
}

function RedeemProductModal({
  isOpen,
  onClose,
  product,
  user,
  onConfirm,
  userPoints,
  isRedeeming,
}: RedeemProductModalProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()
  const productImage = product.image as Media
  // Reset flip state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsFlipped(false)
      setShowConfetti(false)
    }
  }, [isOpen])

  // Handle escape key press - only when not flipped
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen && !isFlipped) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen, onClose, isFlipped])

  if (!isOpen) return null

  const handleConfirm = () => {
    setIsFlipped(true)
    setShowConfetti(true)
    onConfirm()
  }

  const handleBackToShop = () => {
    revalidatePath('/gift-shop')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Confetti */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          <ReactConfetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.2}
          />
        </div>
      )}

      {/* Backdrop - only clickable when not flipped */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[3px]"
        onClick={isFlipped ? undefined : onClose}
      />

      {/* Modal Container */}
      <div className="relative z-50 w-full max-w-xl">
        {/* Flip Container */}
        <div
          className={`relative h-[20rem] w-full transition-transform duration-1200 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front Face */}
          <div className="absolute inset-0 rounded-xl bg-white shadow-xl [backface-visibility:hidden]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 p-5 py-4">
                <h2 className="text-md">Confirm Redemption</h2>
                <button
                  onClick={onClose}
                  className="grid aspect-square cursor-pointer place-items-center rounded-full p-1.5 transition-colors duration-200 hover:bg-gray-50"
                >
                  <Icon name="x" size="md" />
                </button>
              </div>

              <div className="flex-1 space-y-5 p-5 pb-0">
                <div className="flex items-center justify-start gap-5 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-2">
                  <div className="grid aspect-square size-25 place-items-center rounded-lg border border-gray-100 bg-gray-50">
                    {productImage.url && (
                      <Image
                        src={productImage.url}
                        alt={productImage.alt}
                        className="h-full w-full object-contain"
                        width={productImage.width ?? 0}
                        height={productImage.height ?? 0}
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-medium">{product.title}</h3>
                    <p className="mt-1 text-xs text-gray-600">{product.shortDescription}</p>
                    <Badge color="brand" className="mt-2" iconLeft="coins">
                      {product.price} credits
                    </Badge>
                  </div>
                </div>
                <div className="text-center text-sm text-balance text-gray-500">
                  This redemption will use {product.price} credits from your {userPoints} point
                  balance.
                </div>
              </div>

              <div className="flex justify-end p-5 pt-0">
                <div className="inline-flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    colorScheme="brand"
                    onClick={handleConfirm}
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? (
                      <>
                        Processing... <Icon name="spinner" />
                      </>
                    ) : (
                      <>
                        Confirm redemption <Icon name="gift" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute inset-0 [transform:rotateY(180deg)] rounded-xl bg-white p-6 shadow-xl [backface-visibility:hidden]">
            <div className="flex h-full flex-col items-center justify-between">
              <div className="mt-5 flex flex-col items-center justify-center gap-6 text-center">
                <div className="grid aspect-square place-items-center rounded-full border-2 border-green-500 p-2">
                  <Icon name="check" size="lg" className="text-green-600" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-md">Redemption successful! 🥳</h2>
                  <p className="text-balance text-gray-500">
                    Your {product.title} has been redeemed successfully. We will reach out via email
                    to confirm the order tracking information and expected arrival date.{' '}
                  </p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleBackToShop}>
                Back to Gift Shop <Icon name="arrow-right" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RedeemProductModal
