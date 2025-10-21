'use client'

import { useState, useRef } from 'react'
import { Button, Icon } from '@/components/ui'
import { Modal } from '@/components/ui/Compass/Modal'
import { CreatePostForm } from '@/features/discussions/CreatePostForm'
import { User } from '@/payload-types'

interface CreatePostModalProps {
  user: User
}

export function CreatePostModal({ user }: CreatePostModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<{ requestSubmit: () => void }>(null)

  const handleSuccess = () => {
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const handleSubmit = () => {
    // Trigger form submission
    if (formRef.current) {
      formRef.current.requestSubmit()
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button size="md" variant="solid" colorScheme="brand">
          Create discussion <Icon name="plus" className="size-4" />
        </Button>
      }
      title="Start a new discussion"
      showCloseButton={false}
      bodyClassName="p-0"
      className="max-w-4xl"
      primaryButton={{
        children: isSubmitting ? (
          <>
            Creating... <Icon name="spinner" className="size-4" />
          </>
        ) : (
          'Create Discussion'
        ),
        onClick: handleSubmit,
        disabled: isSubmitting,
        variant: 'solid',
        colorScheme: 'brand',
      }}
      secondaryButton={{
        children: 'Cancel',
        onClick: handleCancel,
        disabled: isSubmitting,
      }}
    >
      <div className="p-6">
        <CreatePostForm
          ref={formRef}
          user={user}
          onSuccess={handleSuccess}
          onSubmittingChange={setIsSubmitting}
        />
      </div>
    </Modal>
  )
}
