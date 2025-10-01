import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table'
import type { User } from '@/payload-types'
import { Icon, Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'
import { OpenProfileDrawer } from '../UserProfilePreviewModal/OpenProfileDrawer'

// TODO: Add pagination
// TODO: Add empty state

interface UserWithStats {
  user: User
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
  lastCommentDate: string | null
}

export const LeaderboardTable = ({ users }: { users: UserWithStats[] }) => {
  return (
    <div className="mt-10 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] px-4">Rank</TableHead>
            <TableHead className="px-4">User</TableHead>
            <TableHead className="px-4">
              <div className="flex items-center gap-2">Challenges completed</div>
            </TableHead>
            <TableHead className="px-4 text-right">
              <div className="flex items-center justify-end gap-2">Total points</div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userWithStats, index) => {
            return (
              <TableRow className="bg-gray-50" key={userWithStats.user.id}>
                <TableCell className="px-4 text-base">
                  <span
                    className={cn(
                      'inline-flex w-12 items-center justify-center gap-1 rounded-full px-2 py-1 text-sm',
                      index === 0 && 'inset-shadow bg-yellow-100 text-yellow-700',
                      index === 1 && 'inset-shadow bg-purple-50/50 text-purple-500',
                      index === 2 && 'inset-shadow bg-orange-100/70 text-orange-600',
                    )}
                  >
                    {index <= 2 && <Icon name="award" size="sm" />}
                    {index + 1}
                  </span>
                </TableCell>
                <TableCell className="px-4 font-medium capitalize">
                  <OpenProfileDrawer
                    user={userWithStats.user}
                    stats={{
                      points: userWithStats.points,
                      challengesCompleted: userWithStats.challengesCompleted,
                      itemsRedeemed: userWithStats.itemsRedeemed,
                      commentsWritten: userWithStats.commentsWritten,
                    }}
                    className="group flex items-center gap-2 text-sm"
                  >
                    <Avatar user={userWithStats.user} size="md" showCompany={true} />
                    <div className="ml-1 cursor-pointer hover:underline">
                      {userWithStats.user.firstName} {userWithStats.user.lastName}{' '}
                    </div>
                  </OpenProfileDrawer>
                </TableCell>
                <TableCell
                  className={cn(
                    'px-4 text-sm',
                    userWithStats.challengesCompleted > 0 ? 'text-gray-800' : 'text-gray-400',
                  )}
                >
                  {userWithStats.challengesCompleted > 0 ? userWithStats.challengesCompleted : '-'}
                </TableCell>
                <TableCell
                  className={cn(
                    'px-4 text-right text-sm',
                    userWithStats.points > 0 ? 'text-gray-800' : 'text-gray-400',
                  )}
                >
                  {userWithStats.points > 0 ? userWithStats.points : '-'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
