import { RichText } from '@payloadcms/richtext-lexical/react'
import { Container, Icon, Avatar } from '@/components/ui'
import { Company, DiscussionPost, User } from '@/payload-types'
import { formatDate } from '@/utils/formatDate'

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

  return (
    <div className="w-full">
      <div className="grid h-[35vh] place-items-center space-y-4 bg-gradient-to-t from-white to-blue-50 p-14 pb-0">
        <div className="flex items-start justify-center">
          <div className="flex flex-col items-center gap-4">
            <h1 className="max-w-xl text-center text-2xl font-medium text-balance">
              {discussionPost.title}
            </h1>

            {/* Author info */}
            <div className="flex items-center gap-2">
              {author && <Avatar user={author} size="sm" showCompany={false} />}
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}
                </div>
                {author?.company && typeof author.company !== 'number' && author?.title && (
                  <div className="text-xs text-gray-500">
                    {author.title} at {author.company.name}
                  </div>
                )}
              </div>
            </div>

            <span className="text-xs text-gray-500">
              Published{' '}
              {formatDate(discussionPost.createdAt, {
                abbreviateMonth: true,
                timezone: userTimezone,
              })}
            </span>
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
