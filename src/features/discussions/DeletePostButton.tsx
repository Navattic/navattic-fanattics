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
        <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors">
          <Icon name="trash-2" className="size-4" />
          Delete Post
        </button>
      }
      title="Delete Discussion Post"
      showCloseButton={true}
      primaryButton={{
        children: isDeleting ? (
          <>
            Deleting... <Icon name="spinner" className="size-4" />
          </>
        ) : (
          'Delete Post'
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
          Are you sure you want to delete this discussion post? This action cannot be undone.
        </p>

        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-medium text-gray-900">Post to be deleted:</h4>
          <p className="text-sm font-medium text-gray-600">"{discussionPost.title}"</p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <Icon name="alert-triangle" className="mt-0.5 size-5 flex-shrink-0 text-red-600" />
            <div>
              <h4 className="mb-1 font-medium text-red-800">Warning</h4>
              <p className="text-sm text-red-700">
                This will permanently delete the discussion post and all associated comments. This
                action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
