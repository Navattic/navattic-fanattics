import { useEffect, useState } from 'react'

/**
 * React hook to resolve a CSS variable (as hsl, rgb, etc) to hex at runtime.
 * @param cssVar CSS variable name (e.g. --ct-primary-color or --color-white)
 * @param options Optional: { root?: HTMLElement } - root element to resolve from (defaults to document.documentElement)
 * @returns Hex string (e.g. #ffffff) or '' if not resolved
 */
export function useResolvedHex(
  cssVar: string,
  options?: { root?: HTMLElement; mode?: 'hsl' | 'rgb' },
): string {
  const [hex, setHex] = useState('')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = document.createElement('div')
    const root = options?.root || document.documentElement
    const mode = options?.mode || 'rgb'
    el.style.color = mode === 'hsl' ? `hsl(var(${cssVar}))` : `rgb(var(${cssVar}))`
    root.appendChild(el)
    const computed = getComputedStyle(el).color
    root.removeChild(el)
    const rgb = computed.match(/\d+/g)
    if (rgb && rgb.length >= 3) {
      setHex(
        '#' +
          rgb
            .slice(0, 3)
            .map((x) => (+x).toString(16).padStart(2, '0'))
            .join(''),
      )
    } else {
      setHex('')
    }
  }, [cssVar, options?.root, options?.mode])
  return hex
}

/**
 * Normalize a color string to hex (e.g., #ffffff) for robust comparison.
 * Handles hex, rgb, rgba, hsl(var), var, etc. Returns '' if cannot parse.
 */
export function normalizeColorToHex(input?: string): string {
  if (!input) return ''
  try {
    const { r, g, b } = parseColorString(input)
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`.toLowerCase()
  } catch {
    return ''
  }
}

export function parseColorString(input?: string): {
  r: number
  g: number
  b: number
  a: number
} {
  if (!input) return { r: 0, g: 0, b: 0, a: 1 }

  // HEX #RRGGBB or #RRGGBBAA
  if (input.startsWith('#')) {
    let r = 0,
      g = 0,
      b = 0,
      a = 1
    if (input.length === 9) {
      r = parseInt(input.slice(1, 3), 16)
      g = parseInt(input.slice(3, 5), 16)
      b = parseInt(input.slice(5, 7), 16)
      a = Math.round((parseInt(input.slice(7, 9), 16) / 255) * 100) / 100
    } else if (input.length === 7) {
      r = parseInt(input.slice(1, 3), 16)
      g = parseInt(input.slice(3, 5), 16)
      b = parseInt(input.slice(5, 7), 16)
      a = 1
    }
    return { r, g, b, a }
  }

  // internalRgba(r, g, b, a)
  const internalRgbaMatch = input.match(/^internalRgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/)
  if (internalRgbaMatch) {
    return {
      r: parseInt(internalRgbaMatch[1]),
      g: parseInt(internalRgbaMatch[2]),
      b: parseInt(internalRgbaMatch[3]),
      a: parseFloat(internalRgbaMatch[4]),
    }
  }

  // rgba(r, g, b, a)
  const rgbaMatch = input.match(/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/)
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3]),
      a: parseFloat(rgbaMatch[4]),
    }
  }

  // rgb(r, g, b)
  const rgbMatch = input.match(/^rgb\((\d+), (\d+), (\d+)\)$/)
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: 1,
    }
  }

  return { r: 0, g: 0, b: 0, a: 1 }
}

export function rgbaToCss({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function rgbaString({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
}

export function internalRgbaToHex({ r, g, b, a }: { r: number; g: number; b: number; a: number }) {
  const alpha = Math.round(a * 255)
  return (
    '#' +
    [r, g, b, alpha]
      .map((x, i) =>
        i < 3
          ? x.toString(16).padStart(2, '0')
          : alpha !== 255
            ? x.toString(16).padStart(2, '0')
            : '',
      )
      .join('')
      .toLowerCase()
  )
}

export function isRgbaStringEqual(a: string, b: string) {
  // Parses both strings and compares r/g/b/a to 2 decimals
  const parse = (input: string) => {
    const match = input.match(/^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/)
    if (!match) return null
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: Number(Number(match[4]).toFixed(2)),
    }
  }
  const pa = parse(a)
  const pb = parse(b)
  if (!pa || !pb) return a === b
  return pa.r === pb.r && pa.g === pb.g && pa.b === pb.b && pa.a === pb.a
}

export function getDisplayValue(
  mode: 'hex' | 'rgb',
  color: { r: number; g: number; b: number; a: number },
  allowAlpha: boolean,
  outputRGB?: boolean,
) {
  if (outputRGB) {
    return allowAlpha ? rgbaString(color) : `rgb(${color.r}, ${color.g}, ${color.b})`
  }
  if (mode === 'hex') return internalRgbaToHex(color)
  if (allowAlpha) return rgbaString(color)
  return `rgb(${color.r}, ${color.g}, ${color.b})`
}

export function getThemeRoot(el: HTMLElement | null): HTMLElement {
  if (typeof window === 'undefined') return document.documentElement
  let node: HTMLElement | null = el
  while (node && node !== document.documentElement) {
    if (node.id === 'custom-navattic-theme') return node
    node = node.parentElement
  }
  // Fallback: first in document
  const docTheme = document.getElementById('custom-navattic-theme')
  return docTheme || document.documentElement
}

export enum RedShadeName {
  RED_50 = 'red-50',
  RED_100 = 'red-100',
  RED_200 = 'red-200',
  RED_300 = 'red-300',
  RED_400 = 'red-400',
  RED_500 = 'red-500',
  RED_600 = 'red-600',
  RED_700 = 'red-700',
  RED_800 = 'red-800',
  RED_900 = 'red-900',
}

export const RED_SHADES = {
  [RedShadeName.RED_50]: {
    hsl: 'hsl(0deg, 86%, 97%)',
    rgb: { r: 255, g: 245, b: 245 },
  },
  [RedShadeName.RED_100]: {
    hsl: 'hsl(0deg, 93%, 94%)',
    rgb: { r: 255, g: 237, b: 237 },
  },
  [RedShadeName.RED_200]: {
    hsl: 'hsl(0deg, 96%, 89%)',
    rgb: { r: 254, g: 226, b: 226 },
  },
  [RedShadeName.RED_300]: {
    hsl: 'hsl(0deg, 94%, 82%)',
    rgb: { r: 254, g: 202, b: 202 },
  },
  [RedShadeName.RED_400]: {
    hsl: 'hsl(0deg, 91%, 71%)',
    rgb: { r: 252, g: 165, b: 165 },
  },
  [RedShadeName.RED_500]: {
    hsl: 'hsl(0deg, 84%, 60%)',
    rgb: { r: 248, g: 113, b: 113 },
  },
  [RedShadeName.RED_600]: {
    hsl: 'hsl(0deg, 72%, 51%)',
    rgb: { r: 220, g: 38, b: 38 },
  },
  [RedShadeName.RED_700]: {
    hsl: 'hsl(0deg, 74%, 42%)',
    rgb: { r: 185, g: 28, b: 28 },
  },
  [RedShadeName.RED_800]: {
    hsl: 'hsl(0deg, 70%, 35%)',
    rgb: { r: 153, g: 27, b: 27 },
  },
  [RedShadeName.RED_900]: {
    hsl: 'hsl(0deg, 63%, 31%)',
    rgb: { r: 127, g: 29, b: 29 },
  },
}

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

export function calculateErrorColor({
  bgColor,
  defaultColor,
}: {
  bgColor?: {
    r: number
    g: number
    b: number
  }
  defaultColor?: RedShadeName
}): string {
  // get custom theme provider contents to use if background color not provided
  const dialog = document.getElementsByClassName('contents')[0]
  const dialogBgColor =
    dialog && getComputedStyle(dialog).getPropertyValue('--ct-dialog-bg-color').trim().split(' ')
  const rgb = dialogBgColor && {
    r: Number(dialogBgColor[0]),
    g: Number(dialogBgColor[1]),
    b: Number(dialogBgColor[2]),
  }
  const backgroundColor = bgColor ?? rgb

  if (!backgroundColor)
    return defaultColor ? RED_SHADES[defaultColor].hsl : RED_SHADES[RedShadeName.RED_600].hsl // default to red-600 if no default given

  // Calculate background luminance
  const bgLuminance = luminance(backgroundColor.r, backgroundColor.g, backgroundColor.b)

  // Select red shade based on background luminance
  // For light backgrounds (high luminance), use darker reds
  // For dark backgrounds (low luminance), use lighter reds
  let selectedShade
  if (bgLuminance > 0.8) {
    // Very light background - use dark red
    selectedShade = RED_SHADES[RedShadeName.RED_800]
  } else if (bgLuminance > 0.6) {
    // Light background - use medium-dark red
    selectedShade = RED_SHADES[RedShadeName.RED_600]
  } else if (bgLuminance > 0.4) {
    // Medium background - use medium red
    selectedShade = RED_SHADES[RedShadeName.RED_500]
  } else if (bgLuminance > 0.2) {
    // Dark background - use light-medium red
    selectedShade = RED_SHADES[RedShadeName.RED_400]
  } else {
    // Very dark background - use light red
    selectedShade = RED_SHADES[RedShadeName.RED_300]
  }

  const { r, g, b } = selectedShade.rgb
  return `rgb(${r}, ${g}, ${b})`
}
