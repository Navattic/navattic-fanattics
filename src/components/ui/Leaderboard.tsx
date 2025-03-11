import Avatar from './Avatar'
import type { User } from '@/payload-types'

interface LeaderboardProps {
  usersData: User[]
  calculateUserPoints: (userId: number) => number
}

function Leaderboard({ usersData, calculateUserPoints }: LeaderboardProps) {
  // Sort users by points in descending order
  const sortedUsers = [...usersData].sort((a, b) => {
    return calculateUserPoints(b.id) - calculateUserPoints(a.id)
  })

  return (
    <div className="flex-1 border border-gray-200 rounded-lg p-8">
      <h1 className="text-lg font-medium border-b border-gray-200 pb-4">Leaderboard</h1>
      <ol className="flex flex-col gap-12 mt-8">
        {sortedUsers?.map((user, index) => {
          return (
            <li key={user.id} className="flex items-center gap-2">
              <div className="text-base font-semibold text-gray-800 mr-4">{index + 1}</div>
              <Avatar user={user} />
              <div className="text-base font-medium ml-1 text-gray-800 flex flex-col capitalize">
                <div className="flex items-center gap-2">
                  {user.firstName} {user.lastName}
                  {user.roles && (
                    <div className="capitalize text-sm text-gray-500 space-x-1">
                      {user.roles.map((role, index) => (
                        <span
                          className="text-xs font-medium text-blue-500 bg-blue-100 rounded-md px-1 py-0.5 capitalize"
                          key={`${index}-${role}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500">Points: {calculateUserPoints(user.id)}</div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default Leaderboard
