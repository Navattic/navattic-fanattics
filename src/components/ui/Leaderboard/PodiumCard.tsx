import type { User } from '@/payload-types'
import Avatar from '../Avatar'
import { calculateUserPoints } from '@/lib/users/points'
import { calculateUserNumComments } from '@/lib/users/numComments'
import { Badge } from '../Badge'

const PodiumCard = ({ user }: { user: User }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 pt-0 bg-white">
      <div className="-mt-8 flex flex-col items-center">
        <Avatar user={user} size="full" />
        <div className="space-y-3 mt-4">
          <Badge>1st place</Badge>
          <div className="text-base font-semibold text-gray-800 capitalize">
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>
      <div className="flex justify-evenly w-full mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col items-center gap-1 px-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Points</div>
          <div className="text-sm text-gray-800"> {calculateUserPoints({ user })}</div>
        </div>
        <div className="flex flex-col items-center gap-1 px-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Comments</div>
          <div className="text-sm text-gray-800"> {calculateUserNumComments({ user })}</div>
        </div>
      </div>
    </div>
  )
}

export default PodiumCard
