'use client'

import { useState } from 'react'
import { Button, Icon } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/ui/dialog'
import { CreatePostForm } from '@/features/discussions/CreatePostForm'
import { User } from '@/payload-types'

interface CreatePostModalProps {
  user: User
}

export function CreatePostModal({ user }: CreatePostModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    // Refresh the page to show the new post
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="md" variant="solid" colorScheme="brand">
          Create discussion <Icon name="plus" className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start a new discussion</DialogTitle>
        </DialogHeader>
        <CreatePostForm user={user} onSuccess={handleSuccess} onCancel={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
