import React, { Fragment, isValidElement } from 'react'
import { cn } from '@/lib/utils'

export function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).reduce((acc: React.ReactNode[], child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return [...acc, ...flattenChildren((child as React.ReactElement<any>).props.children)]
    }
    return [...acc, child]
  }, [])
}

export interface GroupCascadeOptions<T extends object = any> {
  children: React.ReactNode
  isAttached: boolean
  size?: string
  variant?: string
  colorScheme?: string
  validTypes: any[]
  extraProps?: Partial<T>
}

export function processGroupChildren<T extends object = any>({
  children,
  isAttached,
  size,
  variant,
  colorScheme,
  validTypes,
  extraProps = {},
}: GroupCascadeOptions<T>): React.ReactNode[] {
  const flat = flattenChildren(children)

  function collectValidItems(nodes: React.ReactNode[]): React.ReactNode[] {
    return nodes.flatMap((child) => {
      if (isValidElement(child) && validTypes.includes(child.type)) {
        return [child]
      }
      return []
    })
  }
  const validItems = collectValidItems(flat)
  const total = validItems.length
  let btnIdx = 0

  function process(nodes: React.ReactNode[]): React.ReactNode[] {
    return nodes.map((child) => {
      if (isValidElement(child) && validTypes.includes(child.type)) {
        const btnChild = child as React.ReactElement<{
          size?: string
          variant?: string
          colorScheme?: string
          className?: string
        }>
        const modifiedProps: Record<string, unknown> = { ...extraProps }
        if (size && !btnChild.props.size) modifiedProps.size = size
        if (variant && !btnChild.props.variant) modifiedProps.variant = variant
        if (colorScheme && !btnChild.props.colorScheme) modifiedProps.colorScheme = colorScheme
        let childClassName = btnChild.props.className || ''
        if (isAttached) {
          if (btnIdx === 0) {
            childClassName = cn(childClassName, 'rounded-r-none')
          } else if (btnIdx === total - 1) {
            childClassName = cn(childClassName, 'rounded-l-none -ml-px')
          } else {
            childClassName = cn(childClassName, 'rounded-l-none rounded-r-none -ml-px')
          }
        }
        modifiedProps.className = childClassName
        btnIdx++
        return React.cloneElement(btnChild, modifiedProps)
      }
      return child
    })
  }
  return process(flat)
}
