import Image from 'next/image'
import type { User } from '@/payload-types'

export default function Avatar({ user }: { user: User }) {
  return user.avatar ? (
    <Image
      src={user.avatar}
      alt={user.firstName ? `${user.firstName}` : 'Avatar'}
      width={40}
      height={40}
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
      {user.firstName?.charAt(0).toUpperCase()}
      {user.lastName?.charAt(0).toUpperCase()}
    </div>
  )
}
