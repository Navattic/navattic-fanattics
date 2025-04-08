import type { User } from '@/payload-types'
import Avatar from '../Avatar'
import { calculateUserPoints } from '@/lib/users/points'
import { calculateUserNumComments } from '@/lib/users/numComments'
import { Badge } from '../Badge'
import { Icon } from '../Icon'

const PodiumCard = ({ user, position }: { user: User; position: number }) => {
  const styles = [
    {
      text: 'text-yellow-500',
      text_dark: 'text-yellow-800',
      bg: 'bg-yellow-50/80',
      bg_light: 'bg-yellow-50/90',
      border: 'border-2 border-yellow-200/70',
      translate: 'transform -translate-y-0',
    },
    {
      text: 'text-gray-800',
      text_dark: 'text-gray-800',
      bg: 'bg-gray-100',
      bg_light: 'bg-gray-100/60',
      border: 'border-gray-300',
      translate: 'transform translate-y-0',
    },
    {
      text: 'text-orange-600',
      text_dark: 'text-orange-800',
      bg: 'bg-orange-50',
      bg_light: 'bg-orange-50/80',
      border: 'border-orange-200/80',
      translate: 'transform translate-y-0',
    },
  ]

  return (
    <div
      className={`border border-gray-200 rounded-2xl overflow-hidden ${styles[position - 1].translate} ${styles[position - 1].bg}`}
    >
      <div className={`flex gap-2 justify-center items-center p-4 py-2 pt-3 text-sm font-medium`}>
        <span className={`${styles[position - 1].text_dark}`}>
          {position}
          {position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place
        </span>
        <Icon name="trophy" className={`size-4 ${styles[position - 1].text}`} />
      </div>
      <div className="m-1 p-4 bg-white rounded-xl shadow-sm">
        <div className="flex items-center ml-1">
          <div className="w-14">
            <Avatar user={user} size="full" />
          </div>
          <div className="ml-4">
            <div className="text-base font-semibold text-gray-800 capitalize">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">placeholder@email.com</div>
          </div>
        </div>
        <div className="flex justify-between w-full mt-6 gap-3">
          <div
            className={`flex-1 flex flex-col items-center gap-1 px-2 rounded-md p-2 ${styles[position - 1].bg_light}`}
          >
            <div className="text-sm font-semibold text-gray-800">
              {' '}
              {calculateUserPoints({ user })}
            </div>
            <div className="text-xs text-gray-500">Points</div>
          </div>
          <div
            className={`flex-1 flex flex-col items-center gap-1 px-2 rounded-md p-2 ${styles[position - 1].bg_light}`}
          >
            <div className="text-sm font-semibold text-gray-800">
              {' '}
              {calculateUserNumComments({ user })}
            </div>
            <div className="text-xs text-gray-500">Comments</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PodiumCard
