export const NvSizes = ['xs', 'sm', 'md', 'lg'] as const
export type NvSize = (typeof NvSizes)[number]

export const NvSides = ['top', 'right', 'bottom', 'left'] as const
export type NvSide = (typeof NvSides)[number]

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

export const NvCorners = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const
export type NvCorner = (typeof NvCorners)[number]

export type NvSideOrCorner = NvSide | NvCorner

export type NvId = string | number

export type NvBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export const ALL_BREAKPOINTS: NvBreakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'] as const
