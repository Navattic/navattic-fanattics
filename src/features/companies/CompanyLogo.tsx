'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { CompanyLogo as CompanyLogoType } from '@/payload-types'
import { Icon } from '@/components/ui'

type CompanyLogoProps = {
  src: string | CompanyLogoType | null | undefined
  alt: string
  size?: number
  className?: string
}

export function CompanyLogo({ src, alt, size = 4, className }: CompanyLogoProps) {
  // If no src, show fallback icon
  if (!src) {
    return <Icon name="building" />
  }

  // Get the URL from either string or CompanyLogo object
  const imageUrl =
    typeof src === 'string' ? src : src && typeof src === 'object' && 'url' in src ? src.url : null

  if (!imageUrl || typeof imageUrl !== 'string') {
    return <Icon name="building" />
  }

  // Check if it's a Brandfetch CDN URL
  if (imageUrl.includes('cdn.brandfetch.io')) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={size}
        height={size}
        className={cn('object-contain', className)}
        unoptimized={true}
      />
    )
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={size}
      height={size}
      className={cn('object-contain', className)}
    />
  )
}
