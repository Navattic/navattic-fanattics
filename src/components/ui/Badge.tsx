import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { IconName, Icon, IconProps } from './Icon'
import { cn } from '@/lib/utils'

export const NvColorSchemes = [
  'gray',
  'brand',
  'green',
  'yellow',
  'orange',
  'pink',
  'red',
  'purple',
] as const
export type NvColorScheme = (typeof NvColorSchemes)[number]

export const NvSizes = ['xs', 'sm', 'md', 'lg', 'tritone'] as const
export type NvSize = (typeof NvSizes)[number]

const badgeVariants = cva(
  'inline-flex w-fit items-center text-center leading-none font-regular whitespace-nowrap overflow-hidden shrink-0',
  {
    variants: {
      variant: {
        default: 'border-[0.5px]',
        themable: '',
      },
      size: {
        xs: 'h-3.5 text-[9px] gap-0.5 px-1.5 rounded',
        sm: 'h-4 text-[12px] gap-0.5 px-1.5 rounded-md',
        md: 'h-5 text-[14px] gap-1 px-2 rounded-md',
        lg: 'h-6 text-[16px] gap-1.5 px-2.5 rounded-lg',
        xl: 'hidden',
        tritone: 'hidden',
      },
      icon: {
        left: '',
        right: '',
      },
      isCircular: {
        true: '',
        false: '',
      },
      colorScheme: {
        gray: [
          'bg-gray-50 border-gray-200 text-gray-800',
          '[box-shadow:0px_-1px_1px_0px_hsla(210,30%,4%,0.14)_inset,0px_1px_2px_0px_hsla(200,20%,97%,0.5)_inset]',
        ],
        brand: [
          'bg-blue-50 border-blue-200 text-blue-800',
          '[box-shadow:0px_-1px_1px_0px_hsla(226,88%,22%,0.14)_inset,0px_1px_2px_0px_hsla(204,100%,98%,0.5)_inset]',
        ],
        green: [
          'bg-green-50 border-green-200 text-green-800',
          '[box-shadow:_0px_-1px_1px_0px_hsla(148,88%,16%,0.14)_inset,0px_1px_2px_0px_hsla(166,57%,95%,0.5)_inset]',
        ],
        yellow: [
          'bg-yellow-50 border-yellow-200 text-yellow-800',
          '[box-shadow:0px_-1px_1px_0px_hsla(28,73%,26%,0.14)_inset,0px_1px_2px_0px_hsla(55,92%,95%,0.5)_inset]',
        ],
        orange: [
          'bg-orange-50 border-orange-200 text-orange-800',
          '[box-shadow:0px_-1px_1px_0px_hsla(15,75%,28%,0.14)_inset,0px_1px_2px_0px_hsla(33,100%,96%,0.5)_inset]',
        ],
        red: [
          'bg-red-50 border-red-200 text-red-800',
          '[box-shadow:0px_-1px_1px_0px_hsla(0,63%,31%,0.14)_inset,0px_1px_2px_0px_hsla(0,86%,97%,0.5)_inset]',
        ],
        pink: [
          'bg-pink-50 border-pink-200 text-pink-800',
          '[box-shadow:0px_-1px_1px_0px_hsla(336,69%,30%,0.14)_inset,0px_1px_2px_0px_hsla(327,73%,97%,0.5)_inset]',
        ],
        purple: [
          'bg-purple-100 border-purple-200 text-purple-800',
          '[box-shadow:0px_-1px_1px_0px_hsla(250,89%,14%,0.14)_inset,0px_1px_2px_0px_hsla(277,35%,93%,0.5)_inset]',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isCircular: false,
      icon: undefined,
    },
    compoundVariants: [
      // icon spacing
      {
        size: 'xs',
        isCircular: false,
        icon: 'left',
        className: 'pr-1.5',
      },
      {
        size: 'xs',
        isCircular: false,
        icon: 'right',
        className: 'pl-1.5',
      },
      {
        size: 'sm',
        isCircular: false,
        icon: 'left',
        className: 'pr-1.5',
      },
      {
        size: 'sm',
        isCircular: false,
        icon: 'right',
        className: 'pl-1.5',
      },
      {
        size: 'md',
        isCircular: false,
        icon: 'left',
        className: 'pr-2',
      },
      {
        size: 'md',
        isCircular: false,
        icon: 'right',
        className: 'pl-2',
      },
      {
        size: 'lg',
        isCircular: false,
        icon: 'left',
        className: 'pr-2.5',
      },
      {
        size: 'lg',
        isCircular: false,
        icon: 'right',
        className: 'pl-2.5',
      },
      // Other compound variants
      {
        isCircular: true,
        size: 'xs',
        className: 'w-3.5 justify-center',
      },
      {
        isCircular: true,
        size: 'sm',
        className: 'w-4 justify-center',
      },
      {
        isCircular: true,
        size: 'md',
        className: 'w-5 justify-center',
      },
      {
        isCircular: true,
        size: 'lg',
        className: 'w-6 justify-center',
      },
      {
        variant: 'themable',
        className:
          '!rounded-ct-button-radius !bg-ct-button-bg !hover:bg-ct-button-bg-hover !text-ct-button-text !hover:text-ct-button-text-hover',
      },
    ],
  },
)

const badgeIconVariants = cva([], {
  variants: {
    size: {
      xs: 'w-2 h-2',
      sm: 'w-2.5 h-2.5',
      md: 'w-3 h-3',
      lg: 'w-3.5 h-3.5',
      xl: 'w-4 h-4',
      tritone: 'hidden',
    },
  },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: NvSize
  colorScheme?: NvColorScheme
  iconLeft?: IconName | React.ReactNode
  iconRight?: IconName | React.ReactNode
  children?: React.ReactNode | string
  isCircular?: boolean
  variant?: 'default' | 'themable'
}

interface BadgeIconProps extends Omit<IconProps, 'name' | 'ref'> {
  name?: IconName
  ref?: React.Ref<SVGSVGElement>
}

function BadgeIcon({ name, size, className, ...props }: BadgeIconProps) {
  if (name == null) {
    return null
  }
  return <Icon name={name} className={cn(badgeIconVariants({ size }), className)} {...props} />
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      size = 'md',
      colorScheme = 'brand',
      iconLeft: _iconLeft,
      iconRight: _iconRight,
      isCircular = false,
      className,
      children,
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    const iconLeft =
      typeof _iconLeft === 'string' ? (
        <BadgeIcon size={size} name={_iconLeft as IconName} />
      ) : (
        _iconLeft
      )
    const iconRight =
      typeof _iconRight === 'string' ? (
        <BadgeIcon size={size} name={_iconRight as IconName} />
      ) : (
        _iconRight
      )
    const icon = iconLeft ? 'left' : iconRight ? 'right' : undefined

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ size, colorScheme, isCircular, variant }), className)}
        {...props}
      >
        {iconLeft}
        {children && (
          <span className={cn('flex items-center', { truncate: !isCircular })}>{children}</span>
        )}
        {iconRight}
      </div>
    )
  },
)
Badge.displayName = 'Badge'
