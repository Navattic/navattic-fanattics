import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'Events',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
    update: () => true,
    delete: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the event',
      },
    },
    {
      name: 'eventPageUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Link to the event page',
      },
    },
    {
      name: 'cta',
      label: 'CTA (optional)',
      type: 'group',
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: {
            description: 'Label for the CTA button, ex: "Register here"',
          },
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            description: 'Link to the venue website or location (optional)',
          },
        },
      ],
    },
    {
      name: 'image',
      label: 'Thumbnail image',
      type: 'upload',
      required: true,
      relationTo: 'media',
      admin: {
        description:
          '250x220px ratio is preferred. If an image is not provided, a fallback will be used.',
      },
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'isWebinar',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Check if this event is a webinar',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description: 'Name of the venue or online platform',
          },
        },
        {
          name: 'link',
          label: 'Link to the venue, website, or location (optional)',
          type: 'text',
        },
        {
          name: 'address',
          type: 'text',
          admin: {
            description:
              'Physical address of the venue. Leave blank and check "Is Webinar" if this is a virtual event.',
          },
        },
      ],
    },
    {
      name: 'date',
      type: 'group',
      fields: [
        {
          name: 'displayDate',
          type: 'text',
          required: true,
          admin: {
            description: 'Display format of the date (e.g., "Wednesday, March 5")',
          },
        },
        {
          name: 'startTime',
          type: 'group',
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'MMM d, yyyy',
                },
                description: 'Event date',
              },
            },
            {
              name: 'time',
              type: 'text',
              required: true,
              admin: {
                description: 'Event start time (e.g., "4:00 PM")',
                placeholder: '4:00 PM',
              },
              validate: (value: string | null | undefined) => {
                if (!value) return 'Time is required'
                // Validate time format
                const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM)$/i
                if (!timeRegex.test(value)) {
                  return 'Please enter time in format "4:00 PM"'
                }
                return true
              },
            },
          ],
        },
        {
          name: 'endTime',
          type: 'group',
          fields: [
            {
              name: 'date',
              type: 'date',
              required: true,
              admin: {
                date: {
                  pickerAppearance: 'dayOnly',
                  displayFormat: 'MMM d, yyyy',
                },
                description: 'Event end date',
              },
            },
            {
              name: 'time',
              type: 'text',
              required: true,
              admin: {
                description: 'Event end time (e.g., "8:00 PM")',
                placeholder: '8:00 PM',
              },
              validate: (value: string | null | undefined) => {
                if (!value) return 'Time is required'
                const timeRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM)$/i
                if (!timeRegex.test(value)) {
                  return 'Please enter time in format "8:00 PM"'
                }
                return true
              },
            },
          ],
        },
        {
          name: 'timeZone',
          type: 'select',
          required: true,
          defaultValue: 'CDT',
          options: [
            { label: 'CDT', value: 'CDT' },
            { label: 'CST', value: 'CST' },
            { label: 'EDT', value: 'EDT' },
            { label: 'EST', value: 'EST' },
            { label: 'PDT', value: 'PDT' },
            { label: 'PST', value: 'PST' },
          ],
        },
      ],
    },
  ],
}
