import type { User } from '@/payload-types'

export default function Avatar({ user }: { user: User }) {
  return (
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
      {user.firstName?.charAt(0).toUpperCase()}
      {user.lastName?.charAt(0).toUpperCase()}
    </div>
  )
}
