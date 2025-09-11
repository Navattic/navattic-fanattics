'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui'

interface BreadcrumbsProps {
  homeLabel?: string
  className?: string
  separator?: React.ReactNode
  transformLabel?: (segment: string) => string
  title?: string
}

function Breadcrumbs({
  title,
  homeLabel = 'Home',
  className,
  separator = <Icon name="chevron-right" className="text-gray-400" />,
  transformLabel = (segment) =>
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Split the pathname into segments and remove empty segments
  const segments = pathname.split('/').filter(Boolean)

  // If we're on the root page, show just the home icon
  if (pathname === '/') {
    return (
      <nav aria-label="Breadcrumbs" className={cn('flex items-center text-sm', className)}>
        <ol className="flex items-center space-x-0">
          <li className="flex items-center">
            <Link
              href="/"
              className="text-muted-foreground flex items-center transition-colors hover:text-gray-800"
            >
              <Icon name="home" className="mr-1" />
              <span className="sr-only">{homeLabel}</span>
            </Link>
          </li>
        </ol>
      </nav>
    )
  }

  // Generate breadcrumb items for non-root pages
  const breadcrumbs = [
    { label: homeLabel, href: '/' },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`
      return {
        label: transformLabel(segment),
        href,
      }
    }),
  ]

  return (
    <nav aria-label="Breadcrumbs" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center space-x-0">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li key={breadcrumb.href} className="flex items-center">
              {index > 0 && <span className="mx-1">{separator}</span>}

              {index === 0 ? (
                <Link
                  href={breadcrumb.href}
                  className="text-muted-foreground flex items-center transition-colors hover:text-gray-800"
                >
                  <Icon name="home" className="mr-1" />
                  <span className="sr-only">{breadcrumb.label}</span>
                </Link>
              ) : isLast ? (
                <span className="font-medium text-gray-800 capitalize" aria-current="page">
                  {title ? title : breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-muted-foreground transition-colors hover:text-gray-800"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumbs }
