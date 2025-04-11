import type { User, Avatar } from '@/payload-types'
import Image from 'next/image'
import { cn } from '@/lib/utils'
export default function Avatar({
  user,
  size = 'thumbnail',
  className,
}: {
  user: User
  size?: 'full' | 'thumbnail'
  className?: string
}) {
  // if size='full', render the full size avatar
  const sizeSrc =
    size === 'full'
      ? (user.avatar as Avatar)?.sizes?.profile?.url || (user.avatar as Avatar)?.url || ''
      : (user.avatar as Avatar)?.sizes?.thumbnail?.url || (user.avatar as Avatar)?.url || ''

  return (
    <div
      className={cn(
        'block rounded-full shadow-sm aspect-square overflow-hidden',
        size === 'full' ? 'size-28' : 'size-8',
        className,
      )}
    >
      <Image
        className="block shadow-sm aspect-square"
        src={sizeSrc}
        alt={`${(user.avatar as Avatar)?.alt || `${user.firstName}'s avatar`}`}
        width={size === 'full' ? 112 : 32}
        height={size === 'full' ? 112 : 32}
      />
    </div>
  )
}
