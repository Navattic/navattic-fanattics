import type { User, Avatar, Company, CompanyLogo } from '@/payload-types'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import clsx from 'clsx'
import { Tooltip } from '@/components/ui/Tooltip'

export default function Avatar({
  user,
  size = 'md',
  className,
  showCompany = true,
}: {
  user?: User | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showCompany?: boolean
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

  const fallbackInitials = (user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || '')

  const company = typeof user?.company === 'object' ? user.company : null
  const logoSrc = typeof company?.logoSrc === 'object' ? company.logoSrc : null
  const companyLogoSrc = logoSrc?.defaultUrl

  // Check if the URL is a valid Brandfetch URL
  const isValidBrandfetchUrl = companyLogoSrc?.includes('cdn.brandfetch.io')

  return (
    <div
      className={cn(
        'inset-shadow relative grid aspect-square place-items-center rounded-full',
        size === 'sm' && 'size-5',
        size === 'md' && 'size-8',
        size === 'lg' && 'size-14',
        size === 'xl' && 'size-28',
        className,
      )}
    >
      <div className="relative size-full overflow-hidden rounded-full">
        {user?.avatar ? (
          <Image
            className="block aspect-square size-full object-cover"
            src={size ? sizes[size].src : sizes.md.src}
            quality={90}
            alt={`${(user?.avatar as Avatar)?.alt || `${user?.firstName}'s avatar`}`}
            width={size ? sizes[size].width : sizes.md.width}
            height={size ? sizes[size].width : sizes.md.width}
          />
        ) : (
          // fallback to initials
          <div
            className={cn(
              'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-gray-100 to-gray-200 text-gray-500 uppercase [text-shadow:-1px_1px_0px_rgba(255,255,255,0.5)]',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-xs',
              size === 'lg' && 'text-md',
              size === 'xl' && 'text-sm',
            )}
          >
            {fallbackInitials}
          </div>
        )}
      </div>
      {showCompany && companyLogoSrc && isValidBrandfetchUrl && (
        <Tooltip content={company?.name || 'Company'} side="bottom" offset={4}>
          <img
            className={clsx(
              'absolute -right-1 -bottom-1 z-10 aspect-square rounded-full border border-gray-200 bg-white object-contain p-px',
              size === 'sm' && 'size-3',
              size === 'md' && 'size-4',
              size === 'lg' && 'size-4',
              size === 'xl' && 'size-4',
            )}
            src={companyLogoSrc}
            alt={`${company?.name || 'Company'} logo`}
          />
        </Tooltip>
      )}
    </div>
  )
}
