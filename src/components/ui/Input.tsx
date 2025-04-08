'use client'

import {
  HTMLAttributes,
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { FieldSet, FieldSetProps } from '@/components/ui/FieldSet'
import { Icon, IconName } from '@/components/ui/Icon'
import { useDebouncedCallback } from 'use-debounce'

// Replace the imported types with direct definitions
type Styleable<T> = {
  styles?: T
}

type NvSize = 'xs' | 'sm' | 'md' | 'lg'

export interface InputStyles {
  root?: React.CSSProperties
  input?: React.CSSProperties
  error?: React.CSSProperties
  wrapper?: React.CSSProperties
  innerWrapper?: React.CSSProperties
  iconWrapper?: React.CSSProperties
  iconLeft?: React.CSSProperties
  iconRight?: React.CSSProperties
  left?: React.CSSProperties
  right?: React.CSSProperties
  label?: React.CSSProperties
}

export interface InputProps<T = string>
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'size' | 'readOnly' | 'disabled' | 'required' | 'value' | 'defaultValue'
    >,
    Styleable<InputStyles> {
  pills?: React.ReactNode
  elementLeft?: React.ReactNode
  elementRight?: React.ReactNode
  iconLeft?: IconName | React.ReactNode
  iconRight?: IconName | React.ReactNode

  isReadOnly?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  isOptional?: boolean

  label?: FieldSetProps['label']
  description?: FieldSetProps['description']
  error?: FieldSetProps['promptText']
  help?: FieldSetProps['promptText']

  size?: NvSize
  variant?: 'default' | 'subtle'
  isThemable?: boolean
  autoResize?: boolean
  minResizeWidth?: number
  maxResizeWidth?: number

  /** Current value */
  value?: T
  /** Default value */
  defaultValue?: T
  /** Called with the new value */
  onValueChange?: (value: T) => void
  /** Called after input has stopped for the debounce period */
  onChangeDebounced?: (value: T) => void
  /** Debounce delay in milliseconds */
  debounceMs?: number

  /** @internal Converts string input to T */
  parse?: (value: string) => T
  /** @internal Converts T to string */
  format?: (value: T) => string

  inputClassName?: string
}

const wrapperVariants = cva(
  ['flex items-center justify-between border font-normal leading-5 p-0', 'transition-all'],
  {
    variants: {
      isThemable: {
        true: 'text-ct-dialog-font-size font-ct-dialog-font-family text-ct-dialog-text rounded-ct-form-field-radius focus-visible:outline-ct-focus-ring-width focus-visible:outline-ct-focus-ring-color outline-offset-1',
        false: [
          'rounded-lg text-sm',
          'peer-focus-within/input:outline-1 peer-focus-within/input:outline-gray-900/10 peer-focus-within/input:outline-offset-1',
        ],
      },
      variant: {
        subtle: '',
        default: '',
      },
      size: {
        xs: '',
        sm: 'text-sm h-7',
        md: 'text-base h-8',
        lg: 'text-base h-10',
      },
    },
    compoundVariants: [
      {
        isThemable: true,
        variant: 'default',
        className: 'bg-ct-dialog-bg border-ct-dialog-text/30 focus-within:border-ct-dialog-text/90',
      },
      {
        isThemable: true,
        variant: 'subtle',
        className:
          'border border-transparent hover:border-ct-dialog-text/30 text-ct-dialog-text focus-within:border-ct-dialog-text/90',
      },
      {
        isThemable: false,
        variant: 'default',
        className:
          'bg-default shadow-sm border-default enabled:hover:shadow focus-within:ring-1 focus-within:ring-gray-900/10 focus-within:ring-offset-1',
      },
      {
        isThemable: false,
        variant: 'subtle',
        className: 'border-transparent hover:bg-subtle focus-within:bg-subtle',
      },
    ],
  },
)

const inputVariants = cva(
  [
    'h-full w-full flex-grow bg-transparent truncate outline-none peer/input',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      isThemable: {
        true: 'rounded-ct-form-field-radius',
        false: 'rounded-lg',
      },
      variant: {
        subtle: 'pl-1',
        default: 'px-2',
      },
      iconLeft: {
        true: '',
        false: '',
      },
      iconRight: {
        true: '',
        false: '',
      },
      size: {
        xs: '',
        sm: '',
        md: '',
        lg: '',
      },
    },
    compoundVariants: [
      {
        isThemable: true,
        className:
          '!px-ct-button-padding-h !py-ct-button-padding-v placeholder:text-ct-dialog-text/50  placeholder:text-ct-dialog-font-family placeholder:text-ct-dialog-font-size rounded-ct-form-field-radius',
      },
      {
        isThemable: false,
        className:
          'disabled:border-default disabled:bg-subtle enabled:bg-default enabled:text-gray-700 enabled:focus-within:text-gray-900 rounded-lg ',
      },

      {
        isThemable: false,
        size: 'xs',
        className: 'text-xs font-medium',
      },
      {
        isThemable: false,
        size: ['sm', 'md'],
        className: 'text-sm font-medium',
      },
      {
        isThemable: false,
        size: 'lg',
        className: 'text-base font-medium',
      },

      {
        variant: 'default',
        iconLeft: true,
        className: 'pl-0',
      },
      {
        variant: 'default',
        iconLeft: false,
        className: 'pl-2',
      },
      {
        variant: 'default',
        iconRight: true,
        className: 'pr-0',
      },
      {
        variant: 'default',
        iconRight: false,
        className: 'pr-2',
      },
    ],
  },
)

const iconVariants = cva(['flex items-center pointer-events-none text-subtle'], {
  variants: {
    left: {
      true: 'pl-2',
      false: '',
    },
    right: {
      true: 'pr-2',
      false: '',
    },
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
    },
  },
})

const sideVariants = cva(
  [
    'flex h-full items-center bg-gray-50 text-gray-700 border-gray-300 whitespace-nowrap font-medium',
  ],
  {
    variants: {
      side: {
        left: 'border-r',
        right: 'border-l',
      },
      size: {
        xs: 'px-1.5 text-xs',
        sm: 'px-2 text-sm',
        md: 'px-2.5 text-sm',
        lg: 'px-3 text-base ',
      },
      error: {
        true: 'text-error',
        false: '',
      },
    },
    compoundVariants: [
      {
        side: 'left',
        size: ['xs', 'sm', 'md'],
        className: 'rounded-l-lg',
      },
      {
        side: 'left',
        size: 'lg',
        className: 'rounded-l-xl',
      },

      {
        side: 'right',
        size: ['xs', 'sm', 'md'],
        className: 'rounded-r-lg',
      },
      {
        side: 'right',
        size: 'lg',
        className: 'rounded-r-xl',
      },
    ],
  },
)

const ElementLeft = ({
  error,
  size,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { error: boolean; size: NvSize }) => {
  return <div className={cn(sideVariants({ error, size, side: 'left' }))} {...rest} />
}

const ElementRight = ({
  error,
  size,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { error: boolean; size: NvSize }) => {
  return <div className={cn(sideVariants({ error, size, side: 'right' }))} {...rest} />
}

export const Input = forwardRef<HTMLInputElement, InputProps<any>>(function Input<T = string>(
  {
    styles,
    className,
    elementLeft,
    elementRight,
    iconLeft,
    iconRight,
    pills,
    isReadOnly,
    isDisabled,
    isRequired,
    isOptional,
    label,
    description,
    error: inputError,
    help,
    size = 'md',
    variant = 'default',
    isThemable = false,
    onClick,
    onBlur,
    autoResize,
    minResizeWidth = 60,
    maxResizeWidth = 300,
    inputClassName,
    type = 'text',

    value,
    defaultValue,
    onValueChange,
    onChangeDebounced,
    parse = (v: string) => v as unknown as T,
    format = (v: T) => String(v),
    onChange,

    debounceMs = 0,
    ...rest
  }: InputProps<T>,
  outerRef: React.ForwardedRef<HTMLInputElement>,
) {
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined ? format(defaultValue) : '',
  )

  // Handle external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(format(value))
    }
  }, [value, format])

  const [validationError, setValidationError] = useState<string | null>(null)
  const innerRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(outerRef, () => innerRef.current!, [])

  const generatedId = useId()
  const uniqueId = rest.id || generatedId
  const debouncedCallback = useDebouncedCallback(
    (value: any) => onChangeDebounced?.(value),
    debounceMs,
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value
    const parsedValue = parse(stringValue)

    setInternalValue(stringValue)
    onValueChange?.(parsedValue)
    onChange?.(e)

    // Handle debounced changes with parsed value
    if (onChangeDebounced) {
      if (debounceMs > 0) {
        debouncedCallback(parsedValue)
      } else {
        onChangeDebounced(parsedValue)
      }
    }
  }

  // Cleanup for debounce
  useEffect(() => {
    return () => {
      debouncedCallback.cancel()
    }
  }, [debouncedCallback])

  const error = inputError || validationError

  useEffect(() => {
    if (autoResize) {
      const input = innerRef?.current
      if (input) {
        input.style.width = `${minResizeWidth}px`
        const bufferWidth = 1 // Buffer width is important to prevent truncate ellipsis
        input.style.width = `${Math.min(maxResizeWidth, input.scrollWidth + bufferWidth)}px`
      }
    }
  }, [autoResize, value, minResizeWidth, maxResizeWidth])

  return (
    <FieldSet
      // @ts-expect-error this is already a discriminated union - it's fine
      label={
        label &&
        (typeof label === 'string'
          ? { children: label, htmlFor: uniqueId, isRequired, isOptional }
          : { ...label, htmlFor: uniqueId, isRequired, isOptional })
      }
      style={styles?.root}
      variant={isThemable ? 'themable' : 'default'}
      state={error ? 'error' : 'default'}
      description={description}
      promptText={error || help}
      isDisabled={isDisabled}
      className={cn(className)}
    >
      <div
        className={cn(
          wrapperVariants({
            size,
            variant,
            isThemable,
          }),
        )}
        style={{
          ...styles?.wrapper,
          borderColor: error ? 'red-500' : undefined,
        }}
        onClick={onClick}
      >
        {/* Prefix. */}
        {elementLeft && (
          <ElementLeft size={size} error={Boolean(error)} style={styles?.left}>
            {elementLeft}
          </ElementLeft>
        )}

        <div className="flex h-full w-full items-center gap-2" style={styles?.innerWrapper}>
          {/* Left icon */}
          {iconLeft && typeof iconLeft === 'string' ? (
            <span className={cn(iconVariants({ left: true }))} style={styles?.iconWrapper}>
              <Icon name={iconLeft as IconName} size={size} style={styles?.iconLeft} />
            </span>
          ) : (
            iconLeft
          )}

          {pills ? <div className="flex gap-1 pl-2">{pills}</div> : null}

          {/* Input. */}
          <input
            id={uniqueId}
            style={styles?.input}
            readOnly={isReadOnly}
            disabled={isDisabled}
            required={isRequired}
            type={type}
            className={cn(
              inputVariants({
                iconLeft: Boolean(iconLeft),
                iconRight: Boolean(iconRight),
                variant,
                isThemable,
                size,
              }),
              inputClassName,
            )}
            value={internalValue}
            onChange={handleChange}
            {...rest}
            onBlur={(e) => {
              setValidationError(e.target.validationMessage || null)
              onBlur?.(e)
            }}
            ref={innerRef}
          />

          {/* Right icon */}
          {iconRight && typeof iconRight === 'string' ? (
            <span className={cn(iconVariants({ right: true }))} style={styles?.iconWrapper}>
              <Icon name={iconRight as IconName} size={size} style={styles?.iconRight} />
            </span>
          ) : (
            iconRight
          )}
        </div>

        {/* Suffix. */}
        {elementRight && (
          <ElementRight size={size} error={Boolean(error)} style={styles?.right}>
            {elementRight}
          </ElementRight>
        )}
      </div>
    </FieldSet>
  )
}) as <T = string>(
  props: InputProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> },
) => React.ReactElement
