'use client'

import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui'
import { IconName } from './Icon'
import { Tooltip } from '@/components/ui'
import { TooltipProps } from './Tooltip'
import type { ReactNode } from 'react'
import { NvColorScheme } from '@/types/compass/types'

export interface DescriptionProps {
  title?: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  iconLeft?: IconName
  iconColorScheme?: NvColorScheme
  tooltip?: TooltipProps['content']
  'data-test-id'?: string
  id?: HTMLLabelElement['id']
  className?: HTMLLabelElement['className']
  descriptionClassName?: HTMLParagraphElement['className']
  htmlFor?: HTMLLabelElement['htmlFor']
}

const iconVariants = cva('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', {
  variants: {
    colorScheme: {
      gray: 'bg-gray-50 text-gray-700',
      brand: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      orange: 'bg-orange-100 text-orange-700',
      pink: 'bg-pink-100 text-pink-700',
      red: 'bg-red-100 text-red-700',
      purple: 'bg-purple-100 text-purple-700',
    },
  },
})

/**
 * A descriptive component for displaying titled information with optional icon and tooltip. {@link https://compass-ui.dev/?path=/docs-display-description |  **Storybook docs**}
 * @param title - The primary text to display.
 * @param subtitle - Optional secondary text displayed next to the title.
 * @param description - Optional detailed text displayed below the title.
 * @param iconLeft - Optional icon to display on the left side.
 * @param iconColorScheme - The color scheme for the icon background (gray, brand, green, etc.).
 * @param tooltip - Optional tooltip content to show on hover of an info icon.
 * @param htmlFor - Associates the description with a form control (makes it clickable).
 */
export const Description = ({
  title,
  subtitle,
  description,
  iconLeft,
  iconColorScheme = 'gray',
  tooltip,
  'data-test-id': dataTestId,
  id,
  className,
  descriptionClassName,
  htmlFor,
}: DescriptionProps) => {
  return (
    <label
      className={cn('flex min-w-0 gap-3', { 'cursor-pointer': Boolean(htmlFor) }, className)}
      data-test-id={dataTestId}
      id={id}
      htmlFor={htmlFor}
    >
      {iconLeft && (
        <span
          className={cn(
            iconVariants({
              colorScheme: iconColorScheme,
            }),
          )}
        >
          <Icon name={iconLeft} size="md" />
        </span>
      )}
      <div className="flex min-w-0 flex-col justify-center">
        <div className="flex items-baseline gap-1.5">
          {title && <p className="min-w-0 text-sm font-medium text-gray-900">{title}</p>}
          {subtitle && (
            <p className="text-xs font-medium whitespace-nowrap text-gray-500">{subtitle}</p>
          )}
          {tooltip && (
            <Tooltip content={tooltip}>
              {<Icon name="info" size="sm" className="cursor-help text-gray-500" />}
            </Tooltip>
          )}
        </div>
        {description && (
          <p className={cn('mt-1 text-xs text-gray-600', descriptionClassName)}>{description}</p>
        )}
      </div>
    </label>
  )
}
