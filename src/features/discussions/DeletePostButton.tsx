'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui'
import { Modal } from '@/components/ui/Compass/Modal'
import { deleteDiscussionPost } from '@/features/discussions/actions'
import { DiscussionPost, User } from '@/payload-types'

interface DeletePostButtonProps {
  discussionPost: DiscussionPost
  currentUser: User
}

export function DeletePostButton({ discussionPost, currentUser }: DeletePostButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if current user is the author
  const author = typeof discussionPost.author === 'object' ? discussionPost.author : null
  const isAuthor = author && author.id === currentUser.id

  // Don't render the button if user is not the author
  if (!isAuthor) {
    return null
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    // Call the server action - it will handle the redirect
    await deleteDiscussionPost({
      postId: discussionPost.id,
      currentUser,
    })
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700">
          <Icon name="trash-2" className="size-4" />
          Delete post
        </button>
      }
      title="Delete discussion post"
      showCloseButton={false}
      primaryButton={{
        children: isDeleting ? (
          <>
            Deleting... <Icon name="spinner" className="size-4" />
          </>
        ) : (
          'Delete post'
        ),
        onClick: handleDelete,
        disabled: isDeleting,
        variant: 'solid',
        colorScheme: 'red',
      }}
      secondaryButton={{
        children: 'Cancel',
        onClick: handleCancel,
        disabled: isDeleting,
      }}
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to delete this discussion post and all associated comments ? This
          action cannot be undone.
        </p>
      </div>
    </Modal>
  )
}
