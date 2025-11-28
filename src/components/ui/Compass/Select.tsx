'use client'

import React, {
  forwardRef,
  ReactNode,
  startTransition,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Combobox, ComboboxItem, ComboboxList, ComboboxProvider } from '@ariakit/react'
import {
  Content,
  Group,
  Icon as IconPrimitive,
  Item,
  ItemIndicator,
  ItemText,
  Label as LabelPrimitive,
  Portal,
  Root as RadixRoot,
  ScrollDownButton,
  ScrollUpButton,
  SelectContentProps,
  SelectGroupProps as RadixSelectGroupProps,
  SelectIconProps,
  SelectItemProps as RadixSelectItemProps,
  SelectPortalProps,
  SelectProps as RadixSelectProps,
  SelectValueProps,
  Separator,
  Trigger,
  Value,
  Viewport,
} from '@radix-ui/react-select'
import { cva } from 'class-variance-authority'
import { matchSorter } from 'match-sorter'
import { Virtualizer, VirtualizerHandle } from 'virtua'
import { cn } from '@/lib/utils'
import { calculateErrorColor, RedShadeName } from './utils/color'
import { Button, ButtonProps } from './Button'
import { FieldSet, FieldSetProps } from './FieldSet'
import { Icon, IconName } from './Icon'
import { IconButton } from './IconButton'
import { Tooltip } from './Tooltip'

type NvSize = 'xs' | 'sm' | 'md' | 'lg'

const Root = RadixRoot as <T extends string | number>(
  props: RadixSelectProps & {
    value?: T
    defaultValue?: T
    onValueChange?: (value: T) => void
  }
) => React.ReactNode

type SelectRootProps<T extends string | number> = Omit<
  RadixSelectProps,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

function SelectRoot<T extends string | number>({
  value,
  defaultValue,
  onValueChange,
  ...props
}: SelectRootProps<T>) {
  return (
    <Root
      {...props}
      value={value?.toString()}
      defaultValue={defaultValue?.toString()}
      onValueChange={(newValue) => {
        if (onValueChange) {
          // Convert back to original type
          const convertedValue = (
            typeof value === 'number' ? Number(newValue) : newValue
          ) as T
          onValueChange(convertedValue)
        }
      }}
    />
  )
}

export type SelectIconOrElement =
  | { iconLeft?: IconName; elementLeft?: never }
  | { iconLeft?: never; elementLeft?: ReactNode }
  | { iconLeft?: never; elementLeft?: never }

export type SelectOptionality =
  | { isRequired?: boolean; isOptional?: never }
  | { isRequired?: never; isOptional?: boolean }
  | { isRequired?: never; isOptional?: never }

export type SelectProps<T extends string | number = string> = {
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  items?: SelectItemWithGroupProps<T>[]
  isDisabled?: boolean
  isReadOnly?: boolean
  isLoading?: boolean
  isClearable?: boolean
  isSearchable?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  itemsLoading?: boolean
  helpMessage?: string
  errorMessage?: string
  messageIcon?: boolean
  wrapperClassName?: string
  className?: string
  contentClassName?: string
  label?: FieldSetProps['label']
  description?: FieldSetProps['description']
  error?: FieldSetProps['promptText']
  help?: FieldSetProps['promptText']
  footerButton?: SelectFooterButtonProps
  variant?: 'default' | 'themable'
  usePortal?: boolean
  onClear?: () => void
  'data-test-id'?: string
  showChevronIcon?: boolean
  size?: NvSize
} & SelectIconOrElement &
  SelectOptionality &
  Omit<
    RadixSelectProps,
    | 'disabled'
    | 'required'
    | 'selected'
    | 'onOpen'
    | 'onOpenChange'
    | 'value'
    | 'defaultValue'
    | 'onValueChange'
  > &
  Omit<SelectValueProps, 'asChild'> &
  Omit<SelectIconProps, 'asChild'> &
  SelectPortalProps &
  Omit<SelectContentProps, 'asChild' | 'disabled'>

const selectTriggerVariants = cva(
  [
    'group/trigger relative flex min-w-[60px] select-none items-center justify-start gap-2 overflow-hidden border transition-all',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white focus:outline-none h-8 rounded-lg border-gray-300 leading-5',
          'data-disabled:bg-gray-50 data-placeholder:text-gray-400 disabled:bg-gray-50',
        ],
        themable:
          'bg-ct-dialog-bg data-placeholder:text-ct-dialog-text/50 px-ct-button-padding-h! py-ct-button-padding-v! border-ct-dialog-text/30 focus-within:border-ct-dialog-text/90 leading-none focus-within:outline-ct-focus-ring-width focus-within:outline-ct-focus-ring-color outline-offset-1 rounded-ct-form-field-radius px-ct-button-padding-h py-ct-button-padding-v text-ct-dialog-font-size font-ct-dialog-font-family',
      },
      isReadOnly: {
        true: '',
        false: '',
      },
      elementLeft: {
        true: '',
        false: 'pl-3',
      },
      showChevronIcon: {
        true: 'pr-2',
        false: 'pr-1',
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
        variant: 'default',
        isReadOnly: true,
        className: 'data-disabled:bg-white data-disabled:opacity-100',
      },
      {
        variant: 'default',
        size: 'xs',
        className: 'h-6 rounded-lg text-xs data-placeholder:text-xs', // 24px
      },
      {
        variant: 'default',
        size: 'sm',
        className: 'h-7 rounded-lg text-sm data-placeholder:text-sm', // 28px
      },
      {
        variant: 'default',
        size: 'md',
        className: 'h-8 rounded-lg text-sm data-placeholder:text-sm', // 32px
      },
      {
        variant: 'default',
        size: 'lg',
        className: 'h-10 rounded-[10px] text-base data-placeholder:text-base', // 40px
      },
    ],
  }
)

const contentVariants = cva(
  [
    'isolate z-50 max-h-(--radix-select-content-available-height) min-w-60 w-(--radix-select-trigger-width) max-w-[min(350px,calc(100vw-32px))] overflow-auto border shadow-lg focus:outline-hidden',
    'data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade will-change-[opacity,transform] pb-1',
  ],
  {
    variants: {
      variant: {
        default: 'bg-white rounded-xl border-gray-200',
        themable:
          'bg-ct-dialog-bg divide-ct-close/15 rounded-ct-dialog-radius border-ct-dialog-text/30 focus-within:border-ct-dialog-text/90 focus-within:outline-ct-focus-ring-width focus-within:outline-ct-focus-ring-color outline-offset-2',
      },
    },
  }
)

const itemVariants = cva(
  [
    'group/item mx-1 flex items-baseline gap-2 pr-[34px] transition-colors cursor-pointer select-none outline-hidden py-1 pl-2',
    'data-disabled:cursor-not-allowed data-disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: 'bg-white rounded-lg',
        themable:
          'font-ct-dialog-font-family text-ct-dialog-text/90 hover:text-ct-dialog-text data-active-item:bg-ct-close/20 data-highlighted:bg-ct-close/20 rounded-[calc(var(--ct-button-border-radius)-4px)]',
      },
      isSearchable: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        isSearchable: true,
        className: 'data-active-item:bg-gray-100',
      },
      {
        variant: 'default',
        isSearchable: false,
        className: 'data-highlighted:bg-gray-100',
      },
    ],
  }
)

/**
 * A dropdown component for selecting a single value from a list of options. {@link https://compass-ui.dev/?path=docs/inputs-select |  **Storybook docs**}
 * @param items - Array of items to choose from.
 * @param value - Currently selected value.
 * @param onValueChange - Callback fired when selection changes.
 * @param placeholder - Text to display when no item is selected.
 * @param isDisabled - Whether the select is disabled.
 * @param isReadOnly - Whether the select is read-only.
 * @param isLoading - Whether the select is in a loading state.
 * @param isSearchable - Whether the dropdown includes a search field.
 * @param isClearable - Whether the selection can be cleared.
 * @param iconLeft - Optional icon to display on the left side of the trigger.
 * @param elementLeft - Optional custom element to display on the left side of the trigger.
 * @param label - Label text or component for the select.
 * @param description - Description text displayed below the label.
 * @param error - Error message displayed when validation fails.
 * @param help - Help text displayed below the select.
 * @param size - Size of the select ('xs', 'sm', 'md', 'lg').
 * @param variant - Visual style of the select ('default' or 'themable').
 */
export const Select = forwardRef(
  <T extends string | number = string>(
    {
      id,
      iconLeft,
      elementLeft,
      name,
      isDisabled = false,
      isReadOnly = false,
      isRequired = undefined,
      isOptional = undefined,
      isLoading = false,
      defaultValue,
      value,
      onValueChange,
      defaultOpen = false,
      items,
      children,
      placeholder = 'Select an item',
      onCloseAutoFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      position = 'popper',
      side,
      sideOffset = 8,
      align = 'start',
      alignOffset,
      avoidCollisions,
      collisionBoundary,
      collisionPadding,
      arrowPadding,
      sticky,
      label,
      description,
      error,
      help,
      className,
      wrapperClassName,
      footerButton,
      variant = 'default',
      isSearchable = false,
      searchValue: externalSearchValue,
      onSearchChange: externalOnSearchChange,
      isClearable = false,
      onClear,
      usePortal = true,
      'data-test-id': dataTestId,
      itemsLoading,
      showChevronIcon = true,
      size = 'md',
      contentClassName,
      style,
      ...props
    }: SelectProps<T>,
    forwardedRef: React.Ref<HTMLButtonElement>
  ) => {
    const [open, onOpenChange] = useState(defaultOpen)
    const [internalSearchValue, setInternalSearchValue] = useState<string>('')
    const searchValue =
      externalSearchValue !== undefined ? externalSearchValue : internalSearchValue
    const setSearchValue =
      externalSearchValue !== undefined ? externalOnSearchChange : setInternalSearchValue

    const [key, setKey] = useState<number>(+new Date())
    const generatedId = useId()
    const uniqueId = id || generatedId
    const searchInputRef = useRef<HTMLInputElement>(null)

    // Focus search input when select opens
    useLayoutEffect(() => {
      if (open && isSearchable && searchInputRef.current) {
        // Small delay to ensure the DOM is ready
        const timer = setTimeout(() => {
          searchInputRef.current?.focus()
        }, 50)
        return () => clearTimeout(timer)
      }
    }, [open, isSearchable])

    const handleClear = useCallback(
      (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        e.stopPropagation()
        setKey(+new Date())
        onClear?.()
      },
      [onClear]
    )

    const leftItem = useMemo(() => {
      if (iconLeft || isLoading) {
        return (
          <IconPrimitive
            className={cn(
              'pointer-events-none flex items-center justify-center text-gray-500',
              {
                'text-red-700 data-placeholder:text-red-700/50': Boolean(error),
              }
            )}
          >
            <Icon
              name={!isLoading && iconLeft ? iconLeft : 'loader'}
              className={cn({ 'animate-spin': isLoading })}
              size={size}
            />
          </IconPrimitive>
        )
      } else if (elementLeft) {
        return (
          <div className="flex h-full items-center border-r border-r-gray-300 bg-gray-50 px-1.5 text-sm font-medium text-gray-700">
            {elementLeft}
          </div>
        )
      } else {
        return null
      }
    }, [iconLeft, elementLeft, error, isLoading, size])

    const ungroupedItems: SelectItemProps<T>[] = useMemo(() => {
      return (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        items?.map(({ group: _, ...rest }: SelectItemWithGroupProps<T>) => rest) || []
      )
    }, [items])

    const matches = useMemo(() => {
      if (!searchValue) return items as SelectItemWithGroupProps<T>[]

      const keys = ['label', 'value']
      const matchedItems = matchSorter(ungroupedItems, searchValue, {
        keys,
      }) as SelectItemProps[]

      // Convert matchedItems back to SelectItemWithGroupProps[]
      const matchesWithGroups: SelectItemWithGroupProps<T>[] = matchedItems.map(
        (item) => {
          const originalItem = items?.find((i) => i.value === item.value)
          return originalItem || (item as SelectItemWithGroupProps<T>)
        }
      )

      // Radix Select does not work if we don't render the selected item, so we make sure to include it in the list of matches.
      const selectedItem = items?.find(
        (item: SelectItemWithGroupProps<T>) => item.value === value
      )
      if (
        selectedItem &&
        !matchesWithGroups.some((item) => item.value === selectedItem.value)
      ) {
        matchesWithGroups.push(selectedItem)
      }

      return matchesWithGroups
    }, [searchValue, value, items, ungroupedItems])

    const showClearButton = isClearable && value

    const renderItems = useMemo(() => {
      if (isLoading || itemsLoading) {
        return (
          <div key="loading" className="flex flex-col gap-1">
            <div className="mx-1 h-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-1 h-8 animate-pulse rounded-lg bg-gray-200" />
            <div className="mx-1 h-8 animate-pulse rounded-lg bg-gray-200" />
          </div>
        )
      }

      if ((items?.length ?? 0) <= 0 && !children) {
        return (
          <SelectGroup
            key="no-items"
            separatorTop={false}
            className="text-gray-500 pointer-events-none my-2 flex items-center justify-center px-2 text-sm font-medium"
          >
            No items!
          </SelectGroup>
        )
      }

      if (children) {
        return children
      }

      if ((!matches || matches.length === 0) && !value) {
        return (
          <SelectGroup
            key="no-matches"
            separatorTop={false}
            className="text-gray-500 pointer-events-none my-2 flex items-center justify-center px-2 text-sm font-medium"
          >
            No items found!
          </SelectGroup>
        )
      }

      const groups = matches.reduce(
        (acc, item) => {
          const groupInfo: DefaultSelectGroup =
            typeof item.group === 'object'
              ? {
                  ...item.group,
                }
              : {
                  name: item.group,
                }

          const group = acc.find((g) => g.name === groupInfo.name)
          if (group) {
            group.items.push(item)
          } else {
            acc.push({
              name: groupInfo.name,
              items: [item],
              nameElementRight: groupInfo.nameElementRight,
            })
          }

          return acc
        },
        [] as Array<
          DefaultSelectGroup & {
            items: SelectItemProps<T>[]
          }
        >
      )

      return (
        <>
          {groups.map(({ name: groupName, items: groupItems }, index) => {
            const selectedGroupIndex = groupItems.findIndex(
              (item) => item.value === value
            )
            return (
              <SelectGroup
                key={groupName || `group-${index}`}
                label={groupName || undefined}
                separatorTop={index > 0}
                selectedIndexInGroup={selectedGroupIndex}
                itemCount={groupItems.length}
                elementRight={groups[index].nameElementRight}
              >
                {groupItems.map((item) => (
                  <SelectItem
                    key={String(item.value)}
                    variant={variant}
                    isReadOnly={isReadOnly}
                    isSearchable={isSearchable}
                    {...item}
                  />
                ))}
              </SelectGroup>
            )
          })}
        </>
      )
    }, [
      isLoading,
      itemsLoading,
      items,
      children,
      matches,
      value,
      variant,
      isReadOnly,
      isSearchable,
    ])

    const content = useMemo(
      () => (
        <Content
          onCloseAutoFocus={onCloseAutoFocus}
          onEscapeKeyDown={onEscapeKeyDown}
          onPointerDownOutside={onPointerDownOutside}
          position={position}
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          avoidCollisions={avoidCollisions}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          arrowPadding={arrowPadding}
          sticky={sticky}
          className={cn(contentVariants({ variant }), contentClassName)}
        >
          {isSearchable && (
            <div
              className={cn('relative mb-1.5 flex items-center border-b pb-1', {
                'border-gray-300': variant !== 'themable',
                'border-ct-close': variant === 'themable',
              })}
            >
              <Icon
                size="sm"
                name="search"
                className={cn('pointer-events-none absolute left-2.5', {
                  'text-gray-500': variant !== 'themable',
                  'text-ct-close': variant === 'themable',
                })}
              />
              <Combobox
                ref={searchInputRef}
                autoSelect
                disabled={isLoading || isDisabled}
                placeholder="Search"
                className={cn(
                  'flex h-8 w-full appearance-none items-center pl-8 text-sm leading-none outline-hidden',
                  {
                    'cursor-not-allowed opacity-50': isLoading || isDisabled,
                  }
                )}
                // Ariakit's Combobox manually triggers a blur event on virtually
                // blurred items, making them work as if they had actual DOM
                // focus. These blur events might happen after the corresponding
                // focus events in the capture phase, leading Radix Select to
                // close the popover. This happens because Radix Select relies on
                // the order of these captured events to discern if the focus was
                // outside the element. Since we don't have access to the
                // onInteractOutside prop in the Radix SelectContent component to
                // stop this behavior, we can turn off Ariakit's behavior here.
                onBlurCapture={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              />
            </div>
          )}
          <ScrollUpButton
            className={cn('relative flex items-center justify-center', {
              'text-gray-700': variant !== 'themable',
              'text-ct-dialog-text': variant === 'themable',
            })}
          >
            <Icon name="chevron-up" size="sm" />
            <div
              className={cn('absolute top-3.5 z-10 h-4 w-full bg-linear-to-b', {
                hidden: (items?.length || 0) <= 3,
                'from-white to-white/0': variant !== 'themable',
                'from-ct-dialog-bg to-transparent': variant === 'themable',
              })}
            />
          </ScrollUpButton>
          <Viewport className="min-h-[calc(var(--radix-select-trigger-height)-4px)]">
            {isSearchable ? <ComboboxList>{renderItems}</ComboboxList> : renderItems}
          </Viewport>
          <ScrollDownButton
            className={cn('relative flex items-center justify-center', {
              'text-gray-700': variant !== 'themable',
              'text-ct-dialog-text': variant === 'themable',
            })}
          >
            <div
              className={cn('absolute bottom-3.5 z-10 h-4 w-full bg-linear-to-t', {
                hidden: (items?.length || 0) <= 3,
                'from-white to-white/0': variant !== 'themable',
                'from-ct-dialog-bg to-transparent': variant === 'themable',
              })}
            />
            <Icon name="chevron-down" size="sm" />
          </ScrollDownButton>
          {footerButton && (
            <SelectFooterButton
              isLoading={isLoading}
              {...footerButton}
              onClick={(event) => {
                footerButton.onClick?.(event)
                onOpenChange(false)
              }}
            />
          )}
        </Content>
      ),
      [
        align,
        alignOffset,
        arrowPadding,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        contentClassName,
        footerButton,
        isDisabled,
        isLoading,
        isSearchable,
        items?.length,
        onCloseAutoFocus,
        onEscapeKeyDown,
        onPointerDownOutside,
        position,
        renderItems,
        side,
        sideOffset,
        sticky,
        variant,
      ]
    )

    const rootContents = useMemo(
      () => (
        <>
          <Trigger
            id={uniqueId}
            className={cn(
              selectTriggerVariants({
                variant,
                isReadOnly,
                elementLeft: Boolean(elementLeft),
                showChevronIcon,
                size,
              }),
              label || description ? 'w-full' : 'w-auto',
              className
            )}
            data-test-id={dataTestId}
            ref={forwardedRef}
            style={{
              ...style,
              borderColor: error
                ? calculateErrorColor({ defaultColor: RedShadeName.RED_300 })
                : undefined,
            }}
          >
            {leftItem}
            <div
              className={cn('min-w-0 grow truncate text-start', {
                'mr-2': !showClearButton,
                'mr-6': showClearButton,
                '[&_*]:text-xs': size === 'xs',
                '[&_*]:text-sm': size === 'sm' || size === 'md',
                '[&_*]:text-base': size === 'lg',
              })}
            >
              <Value placeholder={placeholder} className="block truncate" />
            </div>
            <IconPrimitive
              className={cn('shrink-0', {
                hidden: showClearButton || !showChevronIcon,
              })}
            >
              <Icon
                name="chevron-down"
                className={cn(
                  'pointer-events-none text-gray-500 transition-all',
                  {
                    'text-red-700': Boolean(error),
                  },
                  { 'text-ct-close': variant === 'themable' }
                )}
              />
            </IconPrimitive>
          </Trigger>
          {usePortal ? <Portal>{content}</Portal> : content}
        </>
      ),
      [
        className,
        content,
        dataTestId,
        elementLeft,
        error,
        forwardedRef,
        showClearButton,
        isReadOnly,
        leftItem,
        placeholder,
        showChevronIcon,
        uniqueId,
        style,
        usePortal,
        variant,
        size,
      ]
    )

    return (
      <FieldSet
        // @ts-expect-error this is already a discriminated union - it's fine
        label={
          label &&
          (typeof label === 'string'
            ? { children: label, htmlFor: uniqueId, isRequired, isOptional }
            : { ...label, htmlFor: uniqueId, isRequired, isOptional })
        }
        description={description}
        promptText={error || help}
        state={error ? 'error' : 'default'}
        variant={variant}
        isDisabled={isDisabled}
        className={cn(
          'relative',
          {
            'w-auto': !label && !description,
            'min-w-0': !label && !description,
          },
          wrapperClassName
        )}
      >
        <SelectRoot<T>
          key={key}
          name={name}
          disabled={isDisabled || isReadOnly}
          required={isRequired}
          defaultValue={defaultValue}
          value={value}
          onValueChange={onValueChange}
          defaultOpen={defaultOpen}
          open={open}
          onOpenChange={onOpenChange}
          {...props}
        >
          {/*This allows the clearable icon button to always sit in the trigger*/}
          <span className={cn('relative', label || description ? 'w-full' : 'w-auto')}>
            {isSearchable ? (
              <ComboboxProvider
                open={open}
                setOpen={onOpenChange}
                resetValueOnHide
                includesBaseElement={false}
                value={searchValue}
                setValue={(value) => {
                  startTransition(() => {
                    setSearchValue?.(value)
                  })
                }}
              >
                {rootContents}
              </ComboboxProvider>
            ) : (
              rootContents
            )}
            {showClearButton && (
              <IconButton
                size="xs"
                variant="ghost"
                icon="x"
                className="absolute top-1 right-1"
                tooltip="Clear"
                onClick={handleClear}
                isDisabled={isDisabled}
              />
            )}
          </span>
        </SelectRoot>
      </FieldSet>
    )
  }
) as SelectComponentWithDisplayName

type SelectComponent = <T extends string | number = string>(
  props: SelectProps<T> & { ref?: React.Ref<HTMLButtonElement> }
) => React.ReactNode

interface SelectComponentWithDisplayName extends SelectComponent {
  displayName?: string
}

Select.displayName = 'Select'

type SelectItemPropsBase<T extends string | number = string> = {
  isDisabled?: boolean
  isReadOnly?: boolean
  isSearchable?: boolean
  isHidden?: boolean
  className?: string
  iconLeft?: IconName
  sublabel?: string | ReactNode
  description?: string
  variant?: 'default' | 'themable'
  value: T
} & Omit<
  RadixSelectItemProps,
  'disabled' | 'textValue' | 'children' | 'label' | 'value' | 'hidden'
>

type SelectItemPropsWithLabel<T extends string | number = string> =
  SelectItemPropsBase<T> & {
    label: string
    children?: never
  }

type SelectItemPropsWithChildren<T extends string | number = string> =
  SelectItemPropsBase<T> & {
    label?: never
    children: React.ReactNode
  }

type DefaultSelectGroup = { name?: string; nameElementRight?: ReactNode }

export type SelectItemProps<T extends string | number = string> =
  | SelectItemPropsWithLabel<T>
  | SelectItemPropsWithChildren<T>

export type SelectItemWithGroupProps<T extends string | number = string> =
  SelectItemProps<T> & { group?: string | DefaultSelectGroup }

export const SelectItem = forwardRef(
  <T extends string | number = string>(
    {
      iconLeft,
      children,
      label,
      sublabel,
      description,
      isDisabled,
      isReadOnly,
      isSearchable,
      className,
      value,
      variant,
      isHidden,
      ...props
    }: SelectItemProps<T>,
    forwardedRef: React.Ref<HTMLDivElement>
  ) => {
    const item = useMemo(
      () => (
        <>
          {iconLeft && (
            <IconPrimitive className="pointer-events-none text-gray-500 transition-colors group-data-highlighted/item:text-gray-700">
              <Icon name={iconLeft} />
            </IconPrimitive>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ItemText className="flex items-center">
              <div className="flex w-full items-baseline overflow-hidden">
                <span
                  className={cn('min-w-0 truncate leading-6 font-medium', {
                    'text-sm text-gray-700 group-data-highlighted/item:text-gray-900':
                      variant !== 'themable' && !isReadOnly,
                    'text-sm text-gray-500': variant !== 'themable' && isReadOnly,
                    'text-ct-dialog-text/80 group-data-highlighted/item:text-ct-dialog-text/80':
                      variant === 'themable',
                  })}
                  title={typeof label === 'string' ? label : undefined}
                >
                  {label || children}
                </span>
                {sublabel && (
                  <span
                    className="ml-1.5 text-xs font-medium text-gray-400 group-data-highlighted/item:text-gray-500"
                    title={typeof sublabel === 'string' ? sublabel : undefined}
                  >
                    {sublabel}
                  </span>
                )}
              </div>
            </ItemText>
            {description && (
              <p
                className="line-clamp-2 text-xs font-normal text-gray-600 group-data-highlighted/item:text-gray-700"
                title={description}
              >
                {description}
              </p>
            )}
          </div>
          <ItemIndicator
            className={cn(
              'absolute right-3 flex h-6 items-center justify-center text-sm',
              {
                'text-gray-900': variant !== 'themable',
                'text-ct-dialog-text': variant === 'themable',
              }
            )}
          >
            <Icon name="check" />
          </ItemIndicator>
        </>
      ),
      [children, description, iconLeft, isReadOnly, label, sublabel, variant]
    )

    return (
      !isHidden && (
        <Item
          className={cn(itemVariants({ variant, isSearchable }), className)}
          disabled={isDisabled}
          value={String(value)}
          textValue={label ? String(label) : String(value)}
          asChild={isSearchable}
          ref={forwardedRef}
          {...props}
        >
          {isSearchable ? <ComboboxItem>{item}</ComboboxItem> : item}
        </Item>
      )
    )
  }
)

SelectItem.displayName = 'SelectItem'

export const SelectSeparator = forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator> & { className?: string }
>(({ className }, ref) => {
  return <Separator ref={ref} className={cn('h-px bg-gray-300', className)} />
})

SelectSeparator.displayName = 'SelectSeparator'

export type SelectGroupProps = {
  label?: string
  className?: string
  separatorTop?: boolean
  separatorBottom?: boolean
  selectedIndexInGroup?: number
  itemCount?: number
  elementRight?: ReactNode
} & RadixSelectGroupProps

export const SelectGroup = forwardRef<
  React.ElementRef<typeof Group>,
  React.ComponentPropsWithoutRef<typeof Group> & SelectGroupProps
>(
  (
    {
      children,
      label,
      className,
      separatorTop = true,
      separatorBottom = false,
      selectedIndexInGroup: selectedIndex = -1,
      itemCount,
      elementRight,
    },
    ref
  ) => {
    const virtualizerRef = useRef<VirtualizerHandle>(null)
    useLayoutEffect(() => {
      if (selectedIndex === -1) return

      virtualizerRef.current?.scrollToIndex(selectedIndex, {
        smooth: true,
        align: 'center',
      })
    }, [selectedIndex])

    return (
      <>
        {separatorTop && <SelectSeparator className="mt-1" />}
        <Group ref={ref} className={cn('mt-1', className)}>
          {label && (
            <div
              className={cn('pointer-events-none mb-1 ml-3 flex items-center gap-1.5', {
                'mt-2': !separatorTop,
                'mt-2.5': separatorTop,
              })}
            >
              <LabelPrimitive className="text-xs font-medium text-gray-400 uppercase">
                {label}
              </LabelPrimitive>
              {elementRight ? elementRight : null}
            </div>
          )}
          <Virtualizer
            ref={virtualizerRef}
            keepMounted={selectedIndex !== -1 ? [selectedIndex] : undefined}
            overscan={2}
            count={itemCount}
          >
            {children}
          </Virtualizer>
        </Group>
        {separatorBottom && <SelectSeparator className="my-1" />}
      </>
    )
  }
)

SelectGroup.displayName = 'SelectGroup'

export type SelectFooterButtonProps = Pick<
  ButtonProps,
  | 'id'
  | 'children'
  | 'colorScheme'
  | 'variant'
  | 'onClick'
  | 'isLoading'
  | 'isDisabled'
> & {
  iconLeft?: IconName
  tooltipContent?: string | ReactNode
}

export const SelectFooterButton = forwardRef<HTMLButtonElement, SelectFooterButtonProps>(
  (
    {
      colorScheme = 'gray',
      variant = 'outline',
      iconLeft = 'plus',
      tooltipContent,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const button = (
      <Button
        ref={ref}
        variant={variant}
        colorScheme={colorScheme}
        className="w-full"
        onPointerDown={(e) => {
          e.stopPropagation()
          onClick?.(e)
        }}
        {...props}
      >
        {iconLeft && <Icon name={iconLeft} className="mr-2" />}
        {children}
      </Button>
    )

    return (
      <div className="mt-1 w-full border-t border-gray-300 px-2 pt-2 pb-2">
        {tooltipContent ? (
          <Tooltip content={tooltipContent} side="bottom">
            {button}
          </Tooltip>
        ) : (
          button
        )}
      </div>
    )
  }
)

SelectFooterButton.displayName = 'SelectFooterButton'

