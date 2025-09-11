'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button, Icon } from '@/components/ui'
import { ProfileEditModal } from './ProfileEditModal'

interface ProfileEditButtonProps {
  isOwnProfile: boolean
}

// Cache for profile data to avoid multiple fetches
let profileDataCache: any = null
let profileDataPromise: Promise<any> | null = null

const fetchProfileData = async () => {
  if (profileDataCache) {
    return profileDataCache
  }

  if (profileDataPromise) {
    return profileDataPromise
  }

  profileDataPromise = fetch('/api/auth/update-profile')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch profile data')
      }
      return response.json()
    })
    .then((data) => {
      profileDataCache = data
      profileDataPromise = null
      return data
    })
    .catch((error) => {
      profileDataPromise = null
      throw error
    })

  return profileDataPromise
}

export function ProfileEditButton({ isOwnProfile }: ProfileEditButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Pre-fetch data when component mounts
  useEffect(() => {
    if (isOwnProfile) {
      fetchProfileData().catch(console.error)
    }
  }, [isOwnProfile])

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  if (!isOwnProfile) {
    return null
  }

  return (
    <>
      <Button
        variant="outline"
        size="md"
        onClick={handleOpenModal}
        className="flex items-center gap-2"
      >
        <Icon name="pen" size="sm" />
        Edit profile
      </Button>

      <ProfileEditModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
