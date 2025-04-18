'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Building } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompanyLogoProps {
  src: string | null | undefined
  alt: string
  size?: number
  className?: string
}

export function CompanyLogo({ src, alt, size = 20, className = '' }: CompanyLogoProps) {
  const [error, setError] = useState(false)

  // Map size prop to specific Tailwind classes
  const sizeClasses = {
    16: 'w-4 h-4',
    20: 'w-5 h-5',
    24: 'w-6 h-6',
    32: 'w-8 h-8',
    40: 'w-10 h-10',
    48: 'w-12 h-12',
    64: 'w-16 h-16',
  }

  // Get the appropriate size class or default to w-5 h-5
  const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || 'w-5 h-5'

  // If no source or there was an error loading the image, show the Building icon
  if (!src || error) {
    return <Building className={cn(sizeClass, className)} />
  }

  return (
    <div className={cn('relative rounded overflow-hidden', sizeClass, className)}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          console.error(`[CompanyLogo] Error loading logo: ${src}`)
          setError(true)
        }}
        unoptimized={src.includes('cdn.brandfetch.io') || src.includes('ui-avatars.com')}
      />
    </div>
  )
}
