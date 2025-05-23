'use server'

import { payload } from '@/lib/payloadClient'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Define the schema for validation
const redeemProductSchema = z.object({
  productId: z.number(),
  userId: z.number(),
  points: z.number().positive(),
  productTitle: z.string(),
})

type RedeemProductParams = z.infer<typeof redeemProductSchema>

interface ActionResponse {
  success: boolean
  error?: string
}

export async function redeemProduct({
  productId,
  userId,
  points,
  productTitle,
}: RedeemProductParams): Promise<ActionResponse> {
  try {
    // Validate input
    const validatedData = redeemProductSchema.parse({
      productId,
      userId,
      points,
      productTitle,
    })

    // 1. Create the ledger entry first
    const ledgerEntry = await payload.create({
      collection: 'ledger',
      data: {
        user_id: validatedData.userId,
        amount: -validatedData.points, // Negative amount for deduction
        reason: `Product redemption - ${validatedData.productTitle}`,
      },
    })

    if (!ledgerEntry) {
      throw new Error('Failed to create ledger entry')
    }

    // 2. Create the gift shop transaction
    const transaction = await payload.create({
      collection: 'gift-shop-transactions',
      data: {
        user: validatedData.userId,
        product: validatedData.productId,
        ledgerEntry: ledgerEntry.id,
        status: 'pending',
        shippingAddress: {
          name: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
      },
    })

    if (!transaction) {
      // If transaction creation fails, we should rollback the ledger entry
      await payload.delete({
        collection: 'ledger',
        id: ledgerEntry.id,
      })
      throw new Error('Failed to create gift shop transaction')
    }

    // 3. Add the user to the product's redeemedBy array
    const updatedProduct = await payload.update({
      collection: 'Products',
      id: validatedData.productId,
      data: {
        redeemedBy: [validatedData.userId],
      },
    })

    if (!updatedProduct) {
      // If product update fails, we should rollback both previous operations
      await Promise.all([
        payload.delete({
          collection: 'ledger',
          id: ledgerEntry.id,
        }),
        payload.delete({
          collection: 'gift-shop-transactions',
          id: transaction.id,
        }),
      ])
      throw new Error('Failed to update product')
    }

    // 4. Revalidate the gift shop page to update the UI
    revalidatePath('/gift-shop')

    return { success: true }
  } catch (error) {
    console.error('Error redeeming product:', error)

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to redeem product. Please try again.',
    }
  }
}
