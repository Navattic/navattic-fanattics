'use client'

import { useState, useRef } from 'react'
import { Icon } from '@/components/ui'
import { Modal } from '@/components/ui/Compass/Modal'
import { EditPostForm } from '@/features/discussions/EditPostForm'
import { User, DiscussionPost } from '@/payload-types'

interface EditPostModalProps {
  user: User
  discussionPost: DiscussionPost
  trigger?: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditPostModal({
  user,
  discussionPost,
  trigger,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditPostModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<{ requestSubmit: () => void }>(null)

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = controlledOnOpenChange || setInternalOpen

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
      trigger={trigger}
      title="Edit discussion"
      showCloseButton={false}
      bodyClassName="p-0"
      className="max-w-4xl"
      primaryButton={{
        children: isSubmitting ? (
          <>
            Saving... <Icon name="spinner" className="size-4" />
          </>
        ) : (
          'Save Changes'
        ),
        onClick: handleSubmit,
        isDisabled: isSubmitting,
        variant: 'solid',
        colorScheme: 'brand',
      }}
      secondaryButton={{
        children: 'Cancel',
        onClick: handleCancel,
        isDisabled: isSubmitting,
      }}
    >
      <div className="px-6">
        <EditPostForm
          ref={formRef}
          user={user}
          discussionPost={discussionPost}
          onSuccess={handleSuccess}
          onSubmittingChange={setIsSubmitting}
        />
      </div>
    </Modal>
  )
}
