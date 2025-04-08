import type { User, Avatar } from '@/payload-types'
import Image from 'next/image'

export default function Avatar({
  user,
  size = 'thumbnail',
  className,
}: {
  user: User
  size?: 'full' | 'thumbnail'
}) {
  // if size='full', render the full size avatar
  const sizeSrc =
    size === 'full'
      ? (user.avatar as Avatar)?.sizes?.profile?.url || (user.avatar as Avatar)?.url || ''
      : (user.avatar as Avatar)?.sizes?.thumbnail?.url || (user.avatar as Avatar)?.url || ''

  return (
    <Image
      className="rounded-full shadow-sm aspect-square"
      src={sizeSrc}
      alt={`${(user.avatar as Avatar)?.alt || `${user.firstName}'s avatar`}`}
      width={size === 'full' ? 100 : 32}
      height={size === 'full' ? 100 : 32}
    />
  )
}
