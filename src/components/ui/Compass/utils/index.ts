import { isValidElement, PropsWithChildren, ReactNode } from 'react'
import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

export type { Styleable } from './styles'
export type { NvColorScheme } from './types'
export type { ClassValue }
export { useDebounceInput } from './useDebounceInput'

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      colors: [
        'ct-primary',
        'ct-close',
        'ct-dialog-text',
        'ct-dialog-bg',
        'ct-dialog-border',
        'ct-progress-bar',
        'ct-checkmark-bg',
        'ct-focus-ring-color',
        'ct-button-bg',
        'ct-button-bg-hover',
        'ct-button-bg-active',
        'ct-button-text',
        'ct-button-text-hover',
        'ct-button-border',
        'ct-button-border-hover',
        'ct-button-border-active',
        'ct-button-secondary-bg',
        'ct-button-secondary-bg-hover',
        'ct-button-secondary-bg-active',
        'ct-button-secondary-text',
        'ct-button-secondary-text-hover',
        'ct-button-secondary-border',
      ],
      spacing: [
        'ct-button-padding-h',
        'ct-button-padding-v',
        'ct-button-secondary-padding-h',
        'ct-button-secondary-padding-v',
        'ct-launcher-padding-h',
        'ct-launcher-padding-v',
        'ct-dialog-px',
        'ct-dialog-py',
      ],
    },
    classGroups: {
      'font-family': [
        'sans',
        'ct-dialog-font-family',
        {
          font: ['ct-button-weight', 'ct-button-secondary-weight', 'ct-launcher-weight'],
        },
      ],
      animate: ['accordion-down', 'accordion-up', 'collapsible-down', 'collapsible-up'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}

/**
 * Returns true if any parent of the element has the given attribute.
 * @param element The element to check.
 * @param attribute The attribute to check for.
 * @param depth The maximum depth to check.
 * @returns True if any parent of the element has the given attribute.
 */
export function someParentHasAttribute(
  element: Element | HTMLElement | null,
  attribute: string,
  depth: number | undefined = 10,
): boolean {
  if (!element || depth === -1) return false
  if (element.hasAttribute(attribute)) return true
  return someParentHasAttribute(element.parentElement, attribute, depth - 1)
}

export const getStringFromChildrenProp = (children: ReactNode): string => {
  if (typeof children === 'string' || typeof children === 'number') {
    return children.toString()
  }
  if (isValidElement<PropsWithChildren>(children)) {
    return getStringFromChildrenProp(children.props.children)
  }
  if (Array.isArray(children)) {
    return children.map(getStringFromChildrenProp).join('')
  }
  return ''
}

export interface ShadowConfig {
  id: string
  offsetX: number
  offsetY: number
  blurRadius: number
  spreadRadius: number
  color: string
  inset: boolean
}

/**
 * Parses a CSS box-shadow string into an array of ShadowConfig objects
 * Supports multiple shadows separated by commas
 */
export function parseShadowCSS(shadowCSS: string | undefined): ShadowConfig[] {
  if (!shadowCSS || shadowCSS.trim() === '') {
    return []
  }

  const shadows: ShadowConfig[] = []

  // Smart split by commas - need to handle rgba(r,g,b,a) and other color functions
  function smartSplitShadows(str: string): string[] {
    const result: string[] = []
    let current = ''
    let parenDepth = 0

    for (let i = 0; i < str.length; i++) {
      const char = str[i]

      if (char === '(') {
        parenDepth++
      } else if (char === ')') {
        parenDepth--
      } else if (char === ',' && parenDepth === 0) {
        // This comma is not inside parentheses, so it's a shadow separator
        result.push(current.trim())
        current = ''
        continue
      }

      current += char
    }

    if (current.trim()) {
      result.push(current.trim())
    }

    return result
  }

  const shadowStrings = smartSplitShadows(shadowCSS)

  shadowStrings.forEach((shadowString, index) => {
    if (!shadowString) return

    const inset = shadowString.includes('inset')
    const cleanShadow = shadowString.replace(/inset\s+/, '').trim()

    // Match pattern: offsetX offsetY blurRadius? spreadRadius? color
    // More flexible regex to handle various formats
    const shadowRegex =
      /^(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s+(-?\d+(?:\.\d+)?(?:px|em|rem|%)?)\s*(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%)?))?\s*(?:(-?\d+(?:\.\d+)?(?:px|em|rem|%)?))?\s*(.+)?$/

    const match = cleanShadow.match(shadowRegex)

    if (match) {
      const [, offsetX, offsetY, blur, spread, color] = match

      shadows.push({
        id: (index + 1).toString(),
        offsetX: parseFloat(offsetX) || 0,
        offsetY: parseFloat(offsetY) || 0,
        blurRadius: parseFloat(blur) || 0,
        spreadRadius: parseFloat(spread) || 0,
        color: color?.trim() || 'rgba(0, 0, 0, 0.15)',
        inset,
      })
    }
  })

  return shadows
}

/**
 * Generates a unique ID for shadow layers
 */
export function generateShadowId(): string {
  return `shadow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
