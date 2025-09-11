'use client'

import { useState } from 'react'
import { Button, Icon } from '@/components/ui'
import { ProfileEditModal } from './ProfileEditModal'

interface ProfileEditButtonProps {
  isOwnProfile: boolean
}

export function ProfileEditButton({ isOwnProfile }: ProfileEditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!isOwnProfile) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="md"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
      >
        <Icon name="pen" size="sm" />
        Edit profile
      </Button>

      <ProfileEditModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
