import { RichText } from '@payloadcms/richtext-lexical/react'
import { Avatar } from '@/components/ui'
import { DiscussionPost, User } from '@/payload-types'
import { formatDate } from '@/utils/formatDate'
import { DeletePostButton } from '@/features/discussions/DeletePostButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu'
import { Button } from '@/components/ui/Compass/Button'
import { EllipsisIcon } from 'lucide-react'

interface DiscussionDetailsProps {
  discussionPost: DiscussionPost
  sessionUser: User
  userTimezone?: string
}

export function DiscussionDetails({
  discussionPost,
  sessionUser,
  userTimezone,
}: DiscussionDetailsProps) {
  const author = typeof discussionPost.author === 'object' ? discussionPost.author : null

  // Check if current user is the author (same logic as DeletePostButton)
  const isAuthor = author && author.id === sessionUser.id

  return (
    <div className="w-full">
      <div className="grid place-items-center space-y-4 bg-gradient-to-t from-white to-blue-50 p-14 pb-0">
        <div className="relative mx-auto flex w-full max-w-3xl items-start justify-start">
          <div className="flex w-full flex-col gap-4">
            {/* Author info */}
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-2">
                {author && <Avatar user={author} size="md" showCompany={true} />}
                <div className="flex flex-col gap-0">
                  <div className="text-sm font-medium text-gray-900">
                    {author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}{' '}
                  </div>
                  <span className="text-xs font-normal text-gray-400">
                    Published{' '}
                    {formatDate(discussionPost.createdAt, {
                      abbreviateMonth: true,
                      timezone: userTimezone,
                    })}
                  </span>
                </div>
              </div>

              {/* Ellipsis dropdown - only show if user is the author */}
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <EllipsisIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    sideOffset={4}
                    align="end"
                    className="w-[160px] rounded-xl"
                  >
                    <DropdownMenuItem asChild className="cursor-pointer p-0">
                      <DeletePostButton discussionPost={discussionPost} currentUser={sessionUser} />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {/* title */}
            <h1 className="text-2xl font-medium text-balance">{discussionPost.title}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto my-10 max-w-3xl border-t border-b border-gray-100 py-10 pb-4">
        <RichText data={discussionPost.content} className="payload-rich-text" />
      </div>
    </div>
  )
}
