import type { CollectionConfig } from 'payload'
import { resend } from '@/lib/resendClient'

export const GiftShopTransactions: CollectionConfig = {
  slug: 'gift-shop-transactions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'product', 'status', 'createdAt'],
    group: 'Transactions',
  },
  access: {
    read: () => true, // You might want to restrict this based on your requirements
  },
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        // Only send notification for new transaction creation
        if (operation === 'create') {
          try {
            // Check if user and product are already populated or just IDs
            let user, product

            if (typeof doc.user === 'object' && doc.user !== null) {
              // User is already populated
              user = doc.user
            } else {
              // User is just an ID, fetch the full user
              const payload = await import('@/lib/payloadClient').then((m) => m.payload)
              user = await payload.findByID({
                collection: 'users',
                id: doc.user,
                depth: 1,
              })
            }

            if (typeof doc.product === 'object' && doc.product !== null) {
              // Product is already populated
              product = doc.product
            } else {
              // Product is just an ID, fetch the full product
              const payload = await import('@/lib/payloadClient').then((m) => m.payload)
              product = await payload.findByID({
                collection: 'Products',
                id: doc.product,
                depth: 1,
              })
            }

            const { data, error } = await resend.emails.send({
              from:
                process.env.NODE_ENV === 'production'
                  ? 'Fanattic Portal <noreply@mail.navattic.com>'
                  : 'Fanattic Portal <noreply@mail.navattic.dev>',
              to: ['fanattic@navattic.com'],
              subject: 'New Gift Shop Redemption - Fanattic Portal',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                    New Gift Shop Redemption
                  </h2>
                  
                  <p>A user has redeemed a product from the Fanattic Portal gift shop:</p>
                  
                  
                  <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">User Information</h3>
                  <p><strong>Name:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>
                  <p><strong>Email:</strong> ${user.email}</p>
                  <p><strong>Title:</strong> ${user.title || 'Not specified'}</p>
                  <p><strong>Company:</strong> ${user.company || 'Not specified'}</p>
                  <p><strong>Location:</strong> ${user.location || 'Not specified'}</p>
                  </div>
                  
                  <div style="background-color: #f0f8e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Product Information</h3>
                  <p><strong>Product:</strong> ${product.title}</p>
                  <p><strong>Description:</strong> ${product.description}</p>
                  <p><strong>Price:</strong> ${product.price} points</p>
                  <p><strong>Status:</strong> ${product.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
    
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Transaction Details</h3>
                    <p><strong>Transaction ID:</strong> ${doc.id}</p>
                    <p><strong>Status:</strong> ${doc.status}</p>
                    <p><strong>Redemption Date:</strong> ${new Date().toLocaleString()}</p>
                  </div>
                  
                  ${
                    doc.shippingAddress?.name || doc.shippingAddress?.address
                      ? `
                  <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
                    ${doc.shippingAddress.name ? `<p><strong>Name:</strong> ${doc.shippingAddress.name}</p>` : ''}
                    ${doc.shippingAddress.address ? `<p><strong>Address:</strong> ${doc.shippingAddress.address}</p>` : ''}
                    ${doc.shippingAddress.city ? `<p><strong>City:</strong> ${doc.shippingAddress.city}</p>` : ''}
                    ${doc.shippingAddress.state ? `<p><strong>State:</strong> ${doc.shippingAddress.state}</p>` : ''}
                    ${doc.shippingAddress.zipCode ? `<p><strong>ZIP Code:</strong> ${doc.shippingAddress.zipCode}</p>` : ''}
                    ${doc.shippingAddress.country ? `<p><strong>Country:</strong> ${doc.shippingAddress.country}</p>` : ''}
                  </div>
                  `
                      : ''
                  }

                  ${
                    doc.userNotes
                      ? `
                  <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #333; margin-top: 0;">User Notes</h3>
                    <p>${doc.userNotes}</p>
                  </div>
                  `
                      : ''
                  }

                  <p style="color: #666; font-size: 14px;">
                    This notification was automatically sent when a user redeemed a product from the Fanattic Portal gift shop.
                  </p>
                </div>
              `,
            })

            if (error) {
              console.error('Error sending gift shop transaction notification email:', error)
            } else {
              console.log('Gift shop transaction notification email sent successfully:', data)
            }
          } catch (error) {
            console.error('Failed to send gift shop transaction notification email:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who redeemed the product',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'Products',
      required: true,
      admin: {
        description: 'Product that was redeemed',
      },
    },
    {
      name: 'ledgerEntry',
      type: 'relationship',
      relationTo: 'ledger',
      required: true,
      admin: {
        description: 'Reference to the ledger entry for this redemption',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Processing',
          value: 'processing',
        },
        {
          label: 'Shipped',
          value: 'shipped',
        },
        {
          label: 'Delivered',
          value: 'delivered',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
      admin: {
        description: 'Current status of the redemption',
      },
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: false,
        },
        {
          name: 'address',
          type: 'text',
          required: false,
        },
        {
          name: 'city',
          type: 'text',
          required: false,
        },
        {
          name: 'state',
          type: 'text',
          required: false,
        },
        {
          name: 'zipCode',
          type: 'text',
          required: false,
        },
        {
          name: 'country',
          type: 'text',
          required: false,
        },
      ],
      admin: {
        description: 'Shipping address for the redeemed product',
      },
    },
    {
      name: 'trackingInfo',
      type: 'group',
      fields: [
        {
          name: 'carrier',
          type: 'text',
        },
        {
          name: 'trackingNumber',
          type: 'text',
        },
        {
          name: 'estimatedDelivery',
          type: 'date',
        },
      ],
      admin: {
        description: 'Shipping tracking information',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for admins',
      },
    },
    {
      name: 'userNotes',
      type: 'textarea',
      admin: {
        description: 'Notes from the user (e.g., special requests)',
      },
    },
    {
      name: 'fulfillmentDate',
      type: 'date',
      admin: {
        description: 'Date when the product was fulfilled',
      },
    },
  ],
  timestamps: true, // Adds createdAt and updatedAt fields
}
