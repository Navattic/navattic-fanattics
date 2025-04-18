'use client'

import { Icon } from '@/components/ui/Icon'
import { useState } from 'react'

export default function UserEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy email:', error)
    }
  }

  return (
    <div
      className="text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full inset-shadow px-3 py-1 cursor-pointer inline-flex items-center"
      onClick={handleCopyEmail}
    >
      <Icon
        name={copied ? 'check' : 'copy'}
        size="sm"
        className={`mr-2 ${copied ? 'text-gray-600' : 'text-gray-400'}`}
      />
      {copied ? 'Email copied!' : email}
    </div>
  )
}
