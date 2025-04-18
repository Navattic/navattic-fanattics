import { Icon } from '@/components/ui'
import { IconName } from './Icon'

const Empty = ({
  title,
  description,
  iconName,
}: {
  iconName?: string
  title?: string
  description?: string
}) => {
  return (
    <div className="min-h-[225px] flex flex-col items-center justify-center h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 py-10 border border-gray-200">
      <div className="mb-4 mx-auto relative grid place-items-center">
        {/* Top layer with icon */}
        <div className="relative z-30 bg-white grid place-items-center border border-gray-200 rounded-xl size-16 shadow-[inset_0_-6px_0_0_#F6F7F9]">
          <Icon
            name={iconName ? (iconName as IconName) : 'search'}
            className="size-7 text-gray-600"
          />
        </div>

        {/* Middle layer */}
        <div className="absolute z-20 bg-white border border-gray-200 rounded-xl size-14 shadow-[inset_0_-6px_0_0_#F6F7F9] rotate-12 translate-x-4" />

        {/* Bottom layer */}
        <div className="absolute z-10 bg-white border border-gray-200 rounded-xl size-14 shadow-[inset_0_-6px_0_0_#F6F7F9] -rotate-12 -translate-x-4" />
      </div>
      <div className="pt-4 flex flex-col items-center justify-center gap-1">
        <p className="text-center text-md text-gray-800 font-medium">{title ?? 'No results'}</p>
        {description && <p className="text-center text-sm text-gray-400">{description}</p>}
      </div>
    </div>
  )
}

export default Empty
