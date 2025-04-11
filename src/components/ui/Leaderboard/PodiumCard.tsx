import type { User } from '@/payload-types'
import Avatar from '../Avatar'
import { calculateUserPoints } from '@/lib/users/points'
import { calculateUserNumComments } from '@/lib/users/numComments'
import { Badge } from '../Badge'
import { Icon } from '../Icon'

const PodiumCard = ({ user, position }: { user: User; position: number }) => {
  const styles = [
    {
      text: 'text-yellow-700',
      bg: 'bg-yellow-100',
      border: 'border-2 border-yellow-200/70',
    },
    {
      text: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-gray-300',
    },
    {
      text: 'text-orange-600',
      bg: 'bg-orange-100',
      border: 'border-orange-200/80',
    },
  ]

  return (
    <>
      <div className="p-[6px] pb-[10px] bg-white rounded-2xl inset-shadow flex flex-col gap-4">
        <div
          className={`${styles[position - 1].bg} p-4 py-1 pt-2 text-sm font-medium rounded-t-[12px] rounded-b-[4px]`}
        >
          <span className={`${styles[position - 1].text}`}>
            <Icon name="award" className={`mr-2 size-4 ${styles[position - 1].text}`} />
            {position}
            {position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place
          </span>
        </div>
        <div className="flex items-center ml-1 px-4">
          <Avatar user={user} size="lg" />
          <div className="ml-4">
            <div className="text-base font-semibold text-gray-800 capitalize">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-gray-500">placeholder@email.com</div>
          </div>
        </div>
        <div className="flex justify-between w-full gap-2 px-1">
          <div className="bg-gray-50 flex-1 flex flex-col items-center gap-1 px-2 p-2 rounded-tl-[8px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[12px]">
            <div className="text-base font-semibold text-gray-600">
              {' '}
              <Icon name="coins" className="mr-2 size-4 text-gray-500" />
              {calculateUserPoints({ user })}
            </div>
            <div className="text-xs text-gray-500">Points</div>
          </div>
          <div className="bg-gray-50 flex-1 flex flex-col items-center gap-1 px-2 rounded-tl-[8px] rounded-tr-[8px] rounded-br-[12px] rounded-bl-[8px] p-2">
            <div className="text-base font-semibold text-gray-600">
              {' '}
              <Icon name="message-square" className="mr-2 size-4 text-gray-500" />
              {calculateUserNumComments({ user })}
            </div>
            <div className="text-xs text-gray-500">Comments</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PodiumCard
