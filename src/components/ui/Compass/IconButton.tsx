'use client'

import * as Headless from '@headlessui/react'
import { Icon } from './Icon'
import { IconName } from './Icon'
import { Tooltip } from './Tooltip'
import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'

const iconButtonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-xl border border-solid border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
      variant: {
        solid: 'text-white',
        outline: 'bg-white',
        ghost: 'border-transparent bg-transparent text-gray-600',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'outline',
    },
  }
)

const iconSizeMap = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
}

export interface IconButtonProps extends VariantProps<typeof iconButtonVariants> {
  href?: string
  iconName?: string
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  target?: string
  rel?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  isDisabled?: boolean
  tooltip?: string | React.ReactNode
  'data-test-id'?: string
}

export function IconButton({
  href,
  iconName,
  icon,
  size = 'md',
  variant = 'outline',
  className = '',
  target,
  rel,
  onClick,
  isDisabled = false,
  tooltip,
  'data-test-id': dataTestId,
  ...props
}: IconButtonProps) {
  const iconToUse = icon || iconName
  const buttonContent = (
    <>
      {href ? (
        <a
          href={href}
          target={target}
          rel={rel}
          className={cn(iconButtonVariants({ size, variant }), className)}
          data-test-id={dataTestId}
          {...props}
        >
          {iconToUse && (
            <Icon name={iconToUse as IconName} className={iconSizeMap[size || 'md']} />
          )}
        </a>
      ) : (
        <Headless.Button
          onClick={onClick}
          disabled={isDisabled}
          className={cn(iconButtonVariants({ size, variant }), className)}
          data-test-id={dataTestId}
          {...props}
        >
          {iconToUse && (
            <Icon name={iconToUse as IconName} className={iconSizeMap[size || 'md']} />
          )}
        </Headless.Button>
      )}
    </>
  )

  if (tooltip) {
    return (
      <Tooltip content={tooltip} side="top">
        {buttonContent}
      </Tooltip>
    )
  }

  return buttonContent
}

export default IconButton
