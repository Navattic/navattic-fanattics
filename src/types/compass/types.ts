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
