'use client'

import { Icon } from '@/components/ui'
import { useState } from 'react'
import clsx from 'clsx'

interface UserEmailProps {
  email: string
  size?: 'sm' | 'md'
}

export const UserEmail = ({ email, size = 'md' }: UserEmailProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy email:', error)
    }
  }

  const sizeClasses = {
    sm: 'text-xs font-light px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <div
      className={`${sizeClasses[size]} inset-shadow inline-flex max-w-[30ch] cursor-pointer items-center truncate rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200`}
      onClick={handleCopyEmail}
    >
      <Icon
        name={copied ? 'check' : 'copy'}
        size={size === 'sm' ? 'xs' : 'sm'}
        className={clsx(
          size === 'sm' ? 'mr-1' : 'mr-2',
          copied ? 'text-gray-600' : 'text-gray-400',
        )}
      />
      {copied ? 'Email copied!' : email}
    </div>
  )
}
