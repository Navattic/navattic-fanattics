import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table'
import Avatar from '../Avatar'
import type { User } from '@/payload-types'
import { Icon } from '../Icon'
import { cn } from '@/lib/utils'

// TODO: Add pagination
// TODO: Add user modal
// TODO: Add empty state

interface UserWithStats {
  user: User
  points: number
  commentCount: number
  lastCommentDate: string | null
}

const LeaderboardTable = ({ users }: { users: UserWithStats[] }) => {
  return (
    <div className="mt-10 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] px-4">Rank</TableHead>
            <TableHead className="px-4">User</TableHead>
            <TableHead className="px-4">
              <div className="flex items-center gap-2">
                {/* <Icon name="message-square" className="size-4 text-gray-500" /> */}
                Comments
              </div>
            </TableHead>
            <TableHead className="px-4 text-right">
              <div className="flex items-center justify-end gap-2">
                {/* <Icon name="coins" className="size-4 text-gray-500" /> */}
                Points
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((userWithStats, index) => (
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
                <div className="flex items-center gap-2 text-sm">
                  <Avatar user={userWithStats.user} size="md" />
                  <span className="ml-1">
                    {userWithStats.user.firstName} {userWithStats.user.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell
                className={cn(
                  'px-4 text-sm',
                  userWithStats.commentCount > 0 ? 'text-gray-800' : 'text-gray-400',
                )}
              >
                {userWithStats.commentCount > 0 ? userWithStats.commentCount : '-'}
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
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default LeaderboardTable
