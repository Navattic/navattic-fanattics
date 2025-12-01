'use client'

import { ReactNode } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useDisclosure } from '@/components/ui/Compass/utils/hooks'
import { Button, ButtonGroup, Collapse, Icon } from '@/components/ui'
import { ButtonProps } from './Button'
import { IconName } from './Icon'
import Link from 'next/link'

export interface InlineBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  colorScheme?: VariantProps<typeof inlineBannerVariants>['colorScheme']
  icon?: IconName
  title: string | ReactNode
  description?: string | ReactNode
  className?: string
  isDismissible?: boolean
  actionButton?: ButtonProps & { href?: string }
  onDismiss?: (isDismissed: boolean) => void
  'data-test-id'?: string
  collapseClassName?: string
}

const inlineBannerVariants = cva(['flex justify-start gap-2 rounded-lg p-3 border'], {
  variants: {
    colorScheme: {
      gray: 'bg-gray-50 border-gray-200 text-default',
      brand: 'bg-blue-50 border-blue-200 text-info',
      orange: 'bg-orange-50 border-orange-200 text-attention',
      red: 'bg-red-50 border-red-200 text-error',
      green: 'bg-green-50 border-green-200 text-success',
    },
    hasDescription: {
      true: 'items-start',
      false: 'items-center',
    },
  },
  defaultVariants: {
    colorScheme: 'gray',
  },
})

/**
 * A narrow visual element that displays relevant messages or prompts within the context of the main content. {@link https://compass-ui.dev/?path=/docs-feedback-inlinebanner |  **Storybook docs**}
 * @param title - The main message or heading of the banner.
 * @param description - Optional detailed explanation or additional content.
 * @param colorScheme - The color theme of the banner ('gray', 'brand', 'orange', 'red', 'green').
 * @param icon - Optional icon to display at the start of the banner.
 * @param isDismissible - Whether the banner can be dismissed by the user.
 * @param actionButton - Optional configuration for an action button within the banner.
 * @param onDismiss - Callback function triggered when the banner is dismissed.
 */
export function InlineBanner({
  colorScheme = 'gray',
  icon,
  title,
  description,
  className,
  isDismissible,
  actionButton,
  onDismiss,
  'data-test-id': dataTestId,
  collapseClassName,
  ...props
}: InlineBannerProps) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  return (
    <Collapse isOpen={isOpen} className={cn(collapseClassName)}>
      <div
        {...props}
        data-test-id={dataTestId}
        className={cn(
          inlineBannerVariants({ colorScheme, hasDescription: !!description }),
          className,
        )}
      >
        {icon && <Icon name={icon} className={cn('shrink-0', { 'self-start': !!description })} />}
        <div
          className={cn('inline-flex w-full flex-col justify-start gap-1 pr-1', {
            'mt-px': !!description,
          })}
        >
          <div className="text-sm leading-none font-semibold">{title}</div>
          {description && <div className="text-sm">{description}</div>}
        </div>

        {(isDismissible || actionButton) && (
          <ButtonGroup size="sm" className="items-center self-stretch">
            {actionButton && (
              <Link href={actionButton.href ?? ''}>
                <Button variant="outline" {...actionButton} />
              </Link>
            )}

            {isDismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onToggle()
                  onDismiss?.(true)
                }}
                className={cn('p-1', {
                  'text-info': colorScheme === 'brand',
                  'text-attention': colorScheme === 'orange',
                  'text-error': colorScheme === 'red',
                  'text-success': colorScheme === 'green',
                })}
                aria-label="Dismiss"
              >
                <Icon name="x" />
              </Button>
            )}
          </ButtonGroup>
        )}
      </div>
    </Collapse>
  )
}
