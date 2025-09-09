'use client'

import React from 'react'
import { Button } from '@/components/ui'
import { ButtonProps } from './Button'
import { IconButton } from '@/components/ui'
import { IconButtonProps } from './IconButton'
import { cn } from '@/lib/utils'
import { processGroupChildren } from '@/components/ui/Compass/utils/groupUtils'

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  isAttached?: boolean
  size?: ButtonProps['size']
  variant?: ButtonProps['variant']
  colorScheme?: ButtonProps['colorScheme']
  'data-test-id'?: string
}

/**
 * Button group displays multiple related actions stacked or in a horizontal row to help with arrangement and spacing. {@link https://compass-ui.dev/?path=/docs/inputs-buttongroup |  **Storybook docs**}
 * @param children - The Button or IconButton components to group together.
 * @param isAttached - Whether the buttons should be attached together without spacing.
 * @param size - The size of all buttons in the group (xs, sm, md, lg).
 * @param variant - The visual style of all buttons in the group ('solid', 'outline', 'ghost').
 * @param colorScheme - The color theme of all buttons in the group (gray, brand, red).
 */
export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  isAttached = false,
  size = 'md',
  variant,
  colorScheme = 'gray',
  className,
  'data-test-id': dataTestId,
  ...props
}) => {
  const validTypes = [Button, IconButton]

  const processedChildren = processGroupChildren<ButtonProps | IconButtonProps>({
    children,
    isAttached,
    size: size ?? undefined,
    variant: variant ?? undefined,
    colorScheme: colorScheme ?? undefined,
    validTypes,
  })

  return (
    <div
      role="group"
      data-test-id={dataTestId}
      className={cn(
        'flex',
        {
          'gap-0': isAttached,
          'gap-1': !isAttached && size === 'xs',
          'gap-2': !isAttached && (size === 'sm' || size === 'md'),
          'gap-3': !isAttached && size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {processedChildren}
    </div>
  )
}
