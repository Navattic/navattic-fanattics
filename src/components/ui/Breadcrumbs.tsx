'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  homeLabel?: string
  className?: string
  separator?: React.ReactNode
  transformLabel?: (segment: string) => string
}

function Breadcrumbs({
  homeLabel = 'Home',
  className,
  separator = <ChevronRight className="h-4 w-4 text-gray-400" />,
  transformLabel = (segment) =>
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Skip rendering breadcrumbs on homepage
  if (pathname === '/') return null

  // Split the pathname into segments and remove empty segments
  const segments = pathname.split('/').filter(Boolean)

  // Generate breadcrumb items
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
    <nav aria-label="Breadcrumbs" className={cn('flex items-center space-x-1 text-sm', className)}>
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <li key={breadcrumb.href} className="flex items-center">
              {index > 0 && <span className="mx-1">{separator}</span>}

              {index === 0 ? (
                <Link
                  href={breadcrumb.href}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  <span className="sr-only">{breadcrumb.label}</span>
                </Link>
              ) : isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
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
