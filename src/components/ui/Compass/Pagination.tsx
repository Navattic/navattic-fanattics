'use client'

import { useRef, type HTMLProps } from 'react'
import { ButtonGroup, IconButton, Select, SelectItemProps } from '@/components/ui'
import { Button } from './Button'
import { Icon } from './Icon'
import { cn } from '@/lib/utils'

export interface PaginationProps extends HTMLProps<HTMLDivElement> {
  pageSize: number
  maxRow: number
  page?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  hidePageSizeSelector?: boolean
  className?: string
  hideIfNotNeeded?: boolean
  isLoading?: boolean
  variant?: 'default' | 'compact'
  'data-test-id'?: string
}

/**
 * A component for navigating through paginated content. {@link https://compass-ui.dev/?path=/docs/display-table-pagination |  **Storybook docs**}
 * @param pageSize - Number of items displayed per page.
 * @param maxRow - Total number of items across all pages.
 * @param page - Current active page (zero-indexed).
 * @param onPageChange - Callback fired when the page changes.
 * @param onPageSizeChange - Callback fired when the page size changes.
 * @param pageSizeOptions - Available options for page size selection (defaults to [10, 25, 50]).
 * @param hidePageSizeSelector - Whether to hide the page size selector. Defaults to false.
 * @param hideIfNotNeeded - Whether to hide pagination when all items fit on one page.
 * @param isLoading - Whether the content is currently loading.
 * @param variant - Visual style of the pagination ('default' or 'compact').
 */
export function Pagination({
  pageSize,
  maxRow,
  page = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  hidePageSizeSelector = false,
  hideIfNotNeeded = false,
  className,
  isLoading,
  variant = 'default',
  'data-test-id': dataTestId,
  ...props
}: PaginationProps) {
  const maxPage = Math.ceil(maxRow / (pageSize || 1))

  // Calculate the current range of items being displayed
  const startItem = page * pageSize + 1
  const endItem = Math.min((page + 1) * pageSize, maxRow)

  const currentRange = (
    <div className="flex gap-1 text-sm font-medium text-gray-900">
      {`${startItem}-${endItem}`}
      <span className="text-gray-500"> of </span>
      {maxRow}
    </div>
  )

  // Ensure pageSizeOptions contains the initial pageSize, is unique, and sorted ascending
  const initialPageSizeOptionsRef = useRef<number[]>(
    Array.from(new Set([...(pageSizeOptions ?? []), pageSize])).sort((a, b) => a - b),
  )
  const initialPageSizeOptions = initialPageSizeOptionsRef.current

  // Map page size options to Select component format
  const sizeOptions: SelectItemProps[] = initialPageSizeOptions.map((size: number) => ({
    value: size.toString(),
    label: size.toString(),
  }))

  if ((hideIfNotNeeded && pageSize >= maxRow) || isLoading) {
    return null
  }

  return (
    <div
      data-test-id={dataTestId}
      className={cn('flex w-full flex-wrap items-center justify-between gap-3 py-3', className)}
      {...props}
    >
      <div
        className={cn('flex items-center gap-1.5 text-sm font-medium', {
          'invisible select-none': hidePageSizeSelector,
        })}
      >
        <Select
          items={sizeOptions}
          value={pageSize.toString()}
          onValueChange={(val) => val && onPageSizeChange?.(parseInt(val))}
          className="w-auto min-w-0"
          contentClassName="w-24 min-w-0"
          size={variant === 'default' ? 'sm' : 'xs'}
        />
        <span className="text-gray-500">rows {variant === 'default' ? 'per page' : ''}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{currentRange}</span>
        <ButtonGroup variant="outline" size={variant === 'default' ? 'sm' : 'xs'}>
          {variant === 'default' ? (
            <>
              <Button isDisabled={page === 0} onClick={() => onPageChange?.(page - 1)} size="sm">
                Previous
              </Button>
              <Button
                isDisabled={page === maxPage - 1}
                onClick={() => onPageChange?.(page + 1)}
                size="sm"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <IconButton
                icon="chevron-left"
                tooltip="Previous"
                isDisabled={page === 0}
                onClick={() => onPageChange?.(page - 1)}
                size="xs"
              />
              <IconButton
                icon="chevron-right"
                tooltip="Next"
                isDisabled={page === maxPage - 1}
                onClick={() => onPageChange?.(page + 1)}
                size="xs"
              />
            </>
          )}
        </ButtonGroup>
      </div>
    </div>
  )
}
