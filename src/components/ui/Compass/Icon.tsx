'use client'

import { forwardRef } from 'react'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { IconName } from '@/components/ui/icons/generated/icon-name'

export type { IconName }

export const iconVariants = cva(['inline shrink-0 self-center'], {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-5',
      xl: 'size-11',
      tritone: 'w-14 h-9',
    },
  },
})

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  size?: VariantProps<typeof iconVariants>['size']
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 'md', name, className, ...props }, ref) => (
    <svg
      {...props}
      ref={ref}
      className={cn(iconVariants({ size }), name === 'spinner' && 'animate-spin', className)}
    >
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  ),
)
Icon.displayName = 'Icon'

export type IconType = typeof Icon
