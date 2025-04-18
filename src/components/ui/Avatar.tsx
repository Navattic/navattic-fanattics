import type { User, Avatar } from '@/payload-types'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function Avatar({
  user,
  size = 'md',
  className,
}: {
  user?: User | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: {
      width: 20,
      src: (user?.avatar as Avatar)?.sizes?.profile?.url || (user?.avatar as Avatar)?.url || '',
    },
    md: {
      width: 32,
      src: (user?.avatar as Avatar)?.sizes?.profile?.url || (user?.avatar as Avatar)?.url || '',
    },
    lg: {
      width: 56,
      src: (user?.avatar as Avatar)?.sizes?.thumbnail?.url || (user?.avatar as Avatar)?.url || '',
    },
    xl: {
      width: 112,
      src: (user?.avatar as Avatar)?.sizes?.thumbnail?.url || (user?.avatar as Avatar)?.url || '',
    },
  }

  return (
    <div
      className={cn(
        'block rounded-full shadow-sm aspect-square overflow-hidden',
        size === 'sm' && 'size-5',
        size === 'md' && 'size-8',
        size === 'lg' && 'size-14',
        size === 'xl' && 'size-28',
        className,
      )}
    >
      <Image
        className="block shadow-sm aspect-square"
        src={size ? sizes[size].src : sizes.md.src}
        quality={90}
        alt={`${(user?.avatar as Avatar)?.alt || `${user?.firstName}'s avatar`}`}
        width={size ? sizes[size].width : sizes.md.width}
        height={size ? sizes[size].width : sizes.md.width}
      />
    </div>
  )
}
