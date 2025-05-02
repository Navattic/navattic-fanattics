'use client'

import React, { useCallback, useMemo } from 'react'
import { LabelProps as LabelRootProps, Root as LabelRoot } from '@radix-ui/react-label'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { Icon, IconName } from '@/components/ui/Icon'
import { Tooltip } from '@/components/ui/Tooltip'

export interface FieldSetProps
  extends Omit<React.ComponentPropsWithoutRef<'fieldset'>, 'children'> {
  children: React.ReactNode
  state?: 'default' | 'error'
  variant?: 'default' | 'themable'
  label?: string | LabelProps
  description?: FieldSetDescriptionProps['children']
  promptText?: PromptProps['children']
  isDisabled?: boolean
}

export const FieldSet = ({
  children,
  state = 'default',
  variant = 'default',
  className,
  label,
  description,
  promptText,
  isDisabled = false,
  ...props
}: FieldSetProps) => {
  return (
    <fieldset
      className={cn(
        'group/field flex min-w-0 shrink-0 flex-col gap-2.5',
        {
          disabled: isDisabled,
        },
        className,
      )}
      {...props}
    >
      {(label || description) && (
        <div className="flex flex-col gap-1">
          {label &&
            (typeof label === 'string' ? (
              <Label variant={variant} isDisabled={isDisabled}>
                {label}
              </Label>
            ) : (
              label.children && (
                <Label variant={variant} isDisabled={isDisabled} {...label}>
                  {label.children}
                </Label>
              )
            ))}
          {description && (
            <FieldSetDescription isDisabled={isDisabled} variant={variant}>
              {description}
            </FieldSetDescription>
          )}
        </div>
      )}

      {children}

      {promptText && (
        <Prompt isDisabled={isDisabled} state={state === 'default' ? 'help' : 'error'}>
          {promptText}
        </Prompt>
      )}
    </fieldset>
  )
}

const labelVariants = cva(
  'flex items-center gap-1.5 transition-colors text-sm font-medium leading-none',
  {
    variants: {
      variant: {
        default:
          'text-gray-700 group-focus-within/field:text-gray-900 group-hover/field:text-gray-800',
        themable:
          'text-ct-dialog-text/90 group-focus-within/field:text-ct-dialog-text group-hover/field:text-ct-dialog-text !text-ct-dialog-font-size font-ct-dialog-font-family !text-ct-dialog-text',
      },
      clickable: {
        true: 'cursor-pointer',
        false: '',
      },
      isDisabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
  },
)

const auxiliaryLabelVariants = cva('', {
  variants: {
    variant: {
      default: 'text-gray-500',
      themable: 'text-ct-dialog-text/50',
    },
  },
})

export type LabelProps = LabelRootProps & {
  tooltip?: string
  isDisabled?: boolean
  variant?: 'default' | 'themable'
  'data-test-id'?: string
} & (
    | { isRequired: boolean; isOptional?: never }
    | { isRequired?: never; isOptional: boolean }
    | { isRequired?: never; isOptional?: never }
  )

export const Label = ({
  children,
  htmlFor,
  tooltip,
  isRequired,
  isOptional,
  isDisabled = false,
  variant = 'default',
  className,
  'data-test-id': dataTestId,
  ...props
}: LabelProps) => {
  const containsText = useCallback((node: React.ReactNode): boolean => {
    if (typeof node === 'string') {
      return node.trim() !== ''
    }
    if (React.isValidElement(node)) {
      // @ts-ignore
      if (node.props.label && typeof node.props.label === 'string') {
        // @ts-ignore
        return node.props.label.trim() !== ''
      }
      // @ts-ignore
      if (node.props.dangerouslySetInnerHTML?.__html) {
        // @ts-ignore
        return node.props.dangerouslySetInnerHTML.__html.toString().trim() !== ''
      }
      // @ts-ignore
      return React.Children.toArray(node.props.children).some(containsText)
    }
    if (Array.isArray(node)) {
      return node.some(containsText)
    }
    return false
  }, [])

  const hasVisibleLabel = useMemo(() => {
    const result = containsText(children)
    return result
  }, [children, containsText])

  const subLabel = useMemo(() => {
    if (isDisabled) {
      return null
    } else if (isRequired) {
      return (
        <Tooltip content="Required">
          <Badge size="sm" colorScheme="brand" iconLeft="asterisk" isCircular />
        </Tooltip>
      )
    } else if (isOptional) {
      return <span className={cn('text-sm leading-none font-normal text-gray-500')}>optional</span>
    } else {
      return null
    }
  }, [isDisabled, isRequired, isOptional])

  if (!hasVisibleLabel) return null

  return (
    <LabelRoot
      htmlFor={htmlFor}
      className={cn(labelVariants({ variant, isDisabled, clickable: Boolean(htmlFor) }), className)}
      data-test-id={dataTestId}
      {...props}
    >
      {children}
      {tooltip && !isDisabled && (
        <Tooltip content={tooltip}>
          <Icon
            name="info"
            className={cn('cursor-default text-gray-500', auxiliaryLabelVariants({ variant }))}
          />
        </Tooltip>
      )}
      {subLabel}
    </LabelRoot>
  )
}

const descriptionVariants = cva('select-none text-xs leading-4', {
  variants: {
    variant: {
      default: 'text-gray-500',
      themable: 'text-ct-dialog-text/50',
    },
    isDisabled: {
      true: 'cursor-not-allowed opacity-50',
      false: '',
    },
  },
})

export interface FieldSetDescriptionProps extends React.ComponentPropsWithoutRef<'p'> {
  isDisabled?: boolean
  variant?: 'default' | 'themable'
  'data-test-id'?: string
}

export const FieldSetDescription = React.forwardRef<HTMLParagraphElement, FieldSetDescriptionProps>(
  ({ isDisabled, variant = 'default', 'data-test-id': dataTestId, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(descriptionVariants({ variant, isDisabled }))}
        data-test-id={dataTestId}
        {...props}
      >
        {children}
      </p>
    )
  },
)
FieldSetDescription.displayName = 'FieldSetDescription'

export interface PromptProps {
  state: 'help' | 'error'
  icon?: IconName
  showIcon?: boolean
  isDisabled?: boolean
  children: string
  'data-test-id'?: string
}

const promptVariants = cva('flex items-center gap-1 text-xs', {
  variants: {
    state: {
      help: 'text-gray-500',
      error: 'text-red-600',
    },
    isDisabled: {
      true: 'opacity-50 cursor-not-allowed',
    },
  },
})

export const Prompt = ({
  state = 'help',
  icon = 'info',
  showIcon = true,
  isDisabled,
  children,
  'data-test-id': dataTestId,
}: PromptProps) => {
  return (
    <div
      className={cn(promptVariants({ state, isDisabled }))}
      style={{ color: state === 'error' ? 'text-red-500' : undefined }}
      data-test-id={dataTestId}
    >
      {showIcon && icon && <Icon name={icon} size="xs" />}
      <p className="line-clamp-2">{children}</p>
    </div>
  )
}
