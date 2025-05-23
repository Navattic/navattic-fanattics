import * as Headless from '@headlessui/react'
import { cn } from '@/lib/utils'
import { Link } from '@/components/ui/Link'
import { VariantProps, cva } from 'class-variance-authority'

const buttonVariants = cva(
  [
    'relative flex items-center justify-center whitespace-nowrap transition-all border outline-none focus-visible:outline-none group w-fit cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'font-medium leading-none',
  ],
  {
    variants: {
      variant: {
        solid: 'text-white',
        outline: 'bg-white',
        ghost: 'border-transparent bg-transparent text-gray-600',
      },
      colorScheme: {
        gray: '',
        brand: '',
        red: '',
      },
      size: {
        xs: 'h-6 rounded-lg text-xs gap-x-1.5 px-2.5', // 24px
        sm: 'h-7 rounded-lg text-sm gap-x-1.5 px-2.5', // 28px
        md: 'h-8 rounded-lg text-sm gap-x-1.5 px-3', // 32px
        lg: 'h-10 rounded-[10px] text-sm gap-x-2 px-3.5', // 40px
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'lg',
    },
    compoundVariants: [
      {
        variant: 'solid',
        colorScheme: 'gray',
        className: cn([
          // default
          'border-gray-900 bg-gray-800 shadow-solid-gray-button-default',
          // hover
          'hover:bg-gray-700',
          // dark
          'dark:bg-white dark:text-gray-950 dark:border-gray-950',
          // active
          'active:shadow-solid-button-active data-[active=true]:shadow-solid-button-active',
          // focus
          'focus-visible:shadow-solid-button-gray-focus',
        ]),
      },
      {
        variant: 'solid',
        colorScheme: 'brand',
        className: cn([
          // default
          'bg-blue-500 border-blue-600 shadow-solid-blue-button-default',
          // hover
          'hover:bg-blue-600',
          // active
          'active:shadow-solid-button-active data-[active=true]:shadow-solid-button-active',
          // focus
          'focus-visible:shadow-solid-button-blue-focus',
        ]),
      },
      {
        variant: 'solid',
        colorScheme: 'red',
        className: cn([
          'bg-red-500 border-red-600 shadow-solid-red-button-default',
          'hover:bg-red-600',
          'active:shadow-solid-button-active data-[active=true]:shadow-solid-button-active',
          'focus-visible:shadow-solid-button-red-focus',
        ]),
      },
      {
        variant: 'outline',
        colorScheme: 'gray',
        className: cn([
          // default
          'border-gray-300 shadow-button-elevated text-gray-700',
          // hover
          'hover:bg-gray-50 hover:text-gray-900',
          // dark
          'dark:bg-white/10 dark:border-gray-600 dark:text-white',
          // active
          'active:text-gray-900 data-[active=true]:text-gray-900 active:shadow-button-shallow-inset-indented data-[active=true]:shadow-button-shallow-inset-indented',
          // focus
          'focus-visible:shadow-gray-focus focus-visible:text-gray-900',
        ]),
      },
      {
        variant: 'outline',
        colorScheme: 'red',
        className: cn([
          'border-red-300 shadow-button-elevated text-red-700',
          'hover:bg-red-50 hover:text-red-900',
          'dark:bg-white/10 dark:border-red-600 dark:text-white',
          'active:text-red-900 data-[active=true]:text-red-900 active:shadow-button-shallow-inset-indented data-[active=true]:shadow-button-shallow-inset-indented',
          'focus-visible:shadow-red-focus focus-visible:text-red-900',
        ]),
      },
      {
        variant: 'ghost',
        colorScheme: 'gray',
        className: cn([
          // hover
          'hover:text-gray-900 hover:border-gray-200 hover:bg-gray-100',
          // active
          'active:text-gray-900 data-[active=true]:text-gray-900 active:border-gray-100 data-[active=true]:border-gray-100 active:bg-gray-200 data-[active=true]:bg-gray-200 active:shadow-ghost-button-active data-[active=true]:shadow-ghost-button-active',
          // focus
          'focus-visible:text-gray-900 focus-visible:shadow-gray-focus focus-visible:bg-gray-100',
          // dark
          'dark:text-white dark:hover:bg-transparent dark:hover:border-transparent',
        ]),
      },
      {
        variant: 'ghost',
        colorScheme: 'red',
        className: cn([
          'hover:text-red-900 hover:border-red-200 hover:bg-red-100',
          'active:text-red-900 data-[active=true]:text-red-900 active:border-red-100 data-[active=true]:border-red-100 active:bg-red-200 data-[active=true]:bg-red-200 active:shadow-ghost-button-active data-[active=true]:shadow-ghost-button-active',
          'focus-visible:text-red-900 focus-visible:shadow-red-focus focus-visible:bg-red-100',
          'dark:text-white dark:hover:bg-transparent dark:hover:border-transparent',
        ]),
      },
    ],
  },
)

type ButtonProps = {
  variant?: VariantProps<typeof buttonVariants>['variant']
  colorScheme?: VariantProps<typeof buttonVariants>['colorScheme']
  size?: VariantProps<typeof buttonVariants>['size']
  target?: '_blank' | '_self' | '_parent' | '_top'
} & (React.ComponentPropsWithoutRef<typeof Link> | (Headless.ButtonProps & { href?: undefined }))

export function Button({
  variant = 'solid',
  colorScheme = 'gray',
  size = 'lg',
  className,
  target,
  ...props
}: ButtonProps) {
  const buttonClasses = buttonVariants({
    variant,
    colorScheme,
    size,
    className: className,
  })

  if (typeof props.href === 'undefined') {
    return <Headless.Button {...props} className={buttonClasses} />
  }

  return <Link {...props} target={target} className={buttonClasses} />
}
