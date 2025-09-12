import { Icon } from '@/components/ui'
import { IconName } from './Icon'

export const Empty = ({
  title,
  description,
  iconName,
  button,
}: {
  iconName?: string
  title?: string
  description?: string
  button?: React.ReactNode
}) => {
  return (
    <div className="flex h-full min-h-[225px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 py-10">
      <div className="relative mx-auto mb-4 grid place-items-center">
        {/* Top layer with icon */}
        <div className="relative z-30 grid size-16 place-items-center rounded-xl border border-gray-200 bg-white shadow-[inset_0_-6px_0_0_#F6F7F9]">
          <Icon
            name={iconName ? (iconName as IconName) : 'search'}
            className="size-7 text-gray-600"
          />
        </div>

        {/* Middle layer */}
        <div className="absolute z-20 size-14 translate-x-4 rotate-12 rounded-xl border border-gray-200 bg-white shadow-[inset_0_-6px_0_0_#F6F7F9]" />

        {/* Bottom layer */}
        <div className="absolute z-10 size-14 -translate-x-4 -rotate-12 rounded-xl border border-gray-200 bg-white shadow-[inset_0_-6px_0_0_#F6F7F9]" />
      </div>
      <div className="flex flex-col items-center justify-center gap-1 pt-4">
        <p className="text-md text-center font-medium text-gray-800">{title ?? 'No results'}</p>
        {description && <p className="text-center text-sm text-gray-400">{description}</p>}
      </div>
      {button && button}
    </div>
  )
}
