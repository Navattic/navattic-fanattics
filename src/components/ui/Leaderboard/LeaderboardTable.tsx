import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table'
import Avatar from '../Avatar'

// TODO: Add pagination
// TODO: Add user modal
// TODO: Add empty state
// TODO: fill with real data

const LeaderboardTable = () => {
  const users = [
    {
      firstName: 'John',
      lastName: 'Doe',
      points: 100,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      points: 100,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      points: 100,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      points: 100,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      points: 100,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      points: 100,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      points: 100,
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
            <TableRow className="bg-gray-50" key={`${user.firstName}-${user.lastName}-${index}`}>
              <TableCell className="text-base px-4">{index + 1}</TableCell>
              <TableCell className="font-medium capitalize px-4">
                <div className="flex items-center gap-2 text-base">
                  <Avatar user={user ? user : null} size="thumbnail" />
                  <span className="ml-2">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-base px-4">3</TableCell>
              <TableCell className="text-right text-base px-4">{user.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default LeaderboardTable
