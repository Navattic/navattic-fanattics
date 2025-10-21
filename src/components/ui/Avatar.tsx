import type { User, Avatar as AvatarType, Media } from '@/payload-types'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import clsx from 'clsx'
import { Tooltip } from '@/components/ui'

export const Avatar = ({
  user,
  size = 'md',
  className,
  showCompany = false,
}: {
  user?: User | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showCompany?: boolean
}) => {
  const sizes = {
    xs: {
      width: 16,
      src:
        (user?.avatar as AvatarType)?.sizes?.profile?.url ||
        (user?.avatar as AvatarType)?.url ||
        '',
    },
    sm: {
      width: 20,
      src:
        (user?.avatar as AvatarType)?.sizes?.profile?.url ||
        (user?.avatar as AvatarType)?.url ||
        '',
    },
    md: {
      width: 32,
      src:
        (user?.avatar as AvatarType)?.sizes?.profile?.url ||
        (user?.avatar as AvatarType)?.url ||
        '',
    },
    lg: {
      width: 56,
      src:
        (user?.avatar as AvatarType)?.sizes?.profile?.url ||
        (user?.avatar as AvatarType)?.url ||
        '',
    },
    xl: {
      width: 112,
      src:
        (user?.avatar as AvatarType)?.sizes?.profile?.url ||
        (user?.avatar as AvatarType)?.url ||
        '',
    },
  }

  const fallbackInitials = (user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || '')

  const company = typeof user?.company === 'object' ? user.company : null
  const logoSrc = typeof company?.logoSrc === 'object' ? company.logoSrc : null
  const companyLogoSrc = logoSrc?.defaultUrl ?? (logoSrc?.uploadedLogo as Media)?.url ?? null

  return (
    <div
      className={cn(
        'inset-shadow relative grid aspect-square place-items-center rounded-full',
        size === 'xs' && 'size-4',
        size === 'sm' && 'size-6',
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
            alt={`${(user?.avatar as AvatarType)?.alt || `${user?.firstName}'s avatar`}`}
            width={size ? sizes[size].width : sizes.md.width}
            height={size ? sizes[size].width : sizes.md.width}
          />
        ) : (
          // fallback to initials
          <div
            className={cn(
              'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-gray-100 to-gray-200 text-gray-500 uppercase [box-shadow:0_-2px_2px_0_rgba(0,0,0,0.03)_inset,0_-3px_8px_0_rgba(0,0,0,0.015)_inset] [text-shadow:-1px_1px_0px_rgba(255,255,255,0.3)]',
              size === 'xs' && 'text-xs',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-xs',
              size === 'lg' && 'text-md',
              size === 'xl' && 'text-lg',
            )}
          >
            {fallbackInitials}
          </div>
        )}
      </div>
      {showCompany && companyLogoSrc && (
        <div className="absolute -right-1 -bottom-1 z-10">
          <Tooltip
            content={
              <div className="flex flex-col gap-1">
                {company?.name || 'Company'}{' '}
                {company?.website && (
                  <a
                    className="text-xs text-gray-400 hover:underline"
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company?.website}
                  </a>
                )}
              </div>
            }
            side="bottom"
            offset={4}
          >
            <Image
              className={clsx(
                'z-10 aspect-square rounded-full border border-gray-200 bg-white object-contain p-px',
                size === 'xs' && 'size-2',
                size === 'sm' && 'size-3',
                size === 'md' && 'size-4',
                size === 'lg' && 'size-5',
                size === 'xl' && 'size-4',
              )}
              src={companyLogoSrc}
              alt={`${company?.name || 'Company'} logo`}
              width={size === 'xs' ? 10 : size === 'sm' ? 12 : 16}
              height={size === 'xs' ? 10 : size === 'sm' ? 12 : 16}
            />
          </Tooltip>
        </div>
      )}
    </div>
  )
}
