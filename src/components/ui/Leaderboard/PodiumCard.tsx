import type { User } from '@/payload-types'
import { Icon, Avatar } from '@/components/ui'
import { OpenProfileDrawer } from '../UserProfilePreviewModal/OpenProfileDrawer'

export const PodiumCard = async ({
  user,
  position,
  points,
  challengesCompleted,
}: {
  user: User
  position: number
  points: number
  challengesCompleted: number
}) => {
  const styles = [
    {
      text: 'text-yellow-700',
      bg: 'bg-yellow-100',
      border: 'border-2 border-yellow-200/70',
    },
    {
      text: 'text-purple-700',
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
      <div className="inset-shadow @container flex flex-col gap-4 rounded-2xl bg-white p-1.5 pb-2.5">
        <div
          className={`${styles[position - 1].bg} rounded-t-[12px] rounded-b-[4px] p-4 py-1 pt-1.5 text-sm font-medium`}
        >
          <div className={`${styles[position - 1].text} flex items-center`}>
            <Icon name="award" className={`mr-2 size-4 ${styles[position - 1].text}`} />
            {position}
            {position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place
          </div>
        </div>
        <OpenProfileDrawer
          user={user}
          className="flex flex-col items-center pr-1 pl-4 @[300px]:flex-row"
        >
          <Avatar user={user} size="lg" showCompany={true} />
          <div className="mt-2 ml-0 text-center @[300px]:mt-0 @[300px]:ml-3 @[300px]:text-left">
            <div className="max-w-[30ch] cursor-pointer truncate text-base font-semibold text-gray-800 capitalize hover:underline">
              {user.firstName} {user.lastName}
            </div>
            {user.email && (
              <div className="max-w-[30ch] truncate text-xs text-gray-500">{user.email}</div>
            )}
          </div>
        </OpenProfileDrawer>
        <div className="flex w-full justify-between gap-2 px-1">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-tl-[8px] rounded-tr-[8px] rounded-br-[8px] rounded-bl-[12px] bg-gray-50 p-2 px-2">
            <div className="text-base font-semibold text-gray-600">
              {' '}
              <Icon name="coins" className="mr-2 size-4 text-gray-500" />
              {points}
            </div>
            <div className="text-xs text-gray-500">Total points</div>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-tl-[8px] rounded-tr-[8px] rounded-br-[12px] rounded-bl-[8px] bg-gray-50 p-2 px-2">
            <div className="text-base font-semibold text-gray-600">
              {' '}
              <Icon name="award" className="mr-2 size-4 text-gray-500" />
              {challengesCompleted}
            </div>
            <div className="text-xs text-gray-500">
              {challengesCompleted === 1 ? 'Challenge' : 'Challenges'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
