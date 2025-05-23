import type { CollectionConfig } from 'payload'

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
