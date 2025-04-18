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

// TODO: Add pagination
// TODO: Add user modal
// TODO: Add empty state
// TODO: fill with real data

type LeaderboardUser = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email' | 'loginMethod' | 'updatedAt' | 'createdAt'
>

const LeaderboardTable = () => {
  const users: LeaderboardUser[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      loginMethod: 'email',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john2@example.com',
      loginMethod: 'email',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john3@example.com',
      loginMethod: 'email',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john4@example.com',
      loginMethod: 'email',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john5@example.com',
      loginMethod: 'email',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 6,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john6@example.com',
      loginMethod: 'email',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 7,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john7@example.com',
      loginMethod: 'email',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]

  return (
    <div className="mt-10 bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] px-4">Rank</TableHead>
            <TableHead className="px-4">User</TableHead>
            <TableHead className="px-4">Completed Challenges</TableHead>
            <TableHead className="text-right px-4">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow className="bg-gray-50" key={user.id}>
              <TableCell className="text-base px-4">{index + 1}</TableCell>
              <TableCell className="font-medium capitalize px-4">
                <div className="flex items-center gap-2 text-base">
                  <Avatar user={user as User} size="md" />
                  <span className="ml-2">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-base px-4">3</TableCell>
              <TableCell className="text-right text-base px-4">100</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default LeaderboardTable
