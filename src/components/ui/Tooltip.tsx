'use client'

import * as RTooltip from '@radix-ui/react-tooltip'
import { Icon } from './Icon'
import { cn } from '@/lib/utils'

export const NvSides = ['top', 'right', 'bottom', 'left'] as const
export type NvSide = (typeof NvSides)[number]

export interface TooltipProps extends RTooltip.TooltipProps {
  /* Label to the tooltip content */
  title?: string | React.ReactNode
  /* Primary content of the tooltip */
  content: string | React.ReactNode
  side?: NvSide
  offset?: number
  withArrow?: boolean
  align?: RTooltip.TooltipContentProps['align']
  'data-test-id'?: string
  className?: string
}

export function Tooltip({
  children = <Icon name="info" className="cursor-help text-gray-500" />,
  side = 'top',
  offset = 8,
  align = 'center',
  title,
  content,
  delayDuration = 300,
  withArrow = false,
  open,
  onOpenChange,
  className,
  'data-test-id': dataTestId,
  ...rest
}: TooltipProps) {
  return (
    <RTooltip.Root
      delayDuration={delayDuration}
      open={open}
      onOpenChange={onOpenChange}
      {...rest}
    >
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>

      <RTooltip.Portal>
        {content && (
          <RTooltip.Content
            className={cn(
              'data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade',
              'data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade',
              'data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade',
              'data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade',
              `z-50 w-full max-w-60 select-none rounded-lg border border-gray-900 bg-gray-800 shadow-[0px_4px_11px_2px_rgba(0,0,0,0.2),0px_-1px_1px_0px_rgba(7,10,13,0.14)_inset,0px_1px_2px_0px_rgba(246,248,249,0.5)_inset]`,
              'text-xs font-normal text-gray-300',
              {
                'px-2 py-1': typeof content === 'string',
                'p-2': typeof content !== 'string',
              },
              className
            )}
            side={side}
            sideOffset={offset}
            align={align}
            data-test-id={dataTestId}
          >
            {title ? (
              <p className="mb-1 text-xs font-medium text-white">{title}</p>
            ) : null}
            {content}
            {withArrow && (
              <RTooltip.Arrow asChild className="fill-gray-900">
                <svg
                  width="16"
                  height="14"
                  viewBox="0 0 24 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="-translate-y-px"
                >
                  <path d="M24 1C20 1 18 5 12 5C6 5 4 1 0 1" className="fill-gray-900" />
                </svg>
              </RTooltip.Arrow>
            )}
          </RTooltip.Content>
        )}
      </RTooltip.Portal>
    </RTooltip.Root>
  )
}

// Provider

export interface TooltipProviderProps extends RTooltip.TooltipProviderProps {}

/**
 * Aliasing the Radix tooltip provider here so that we don't have to add
 * dependencies to the main project.
 */
export function TooltipProvider(props: TooltipProviderProps) {
  return <RTooltip.TooltipProvider {...props} />
}