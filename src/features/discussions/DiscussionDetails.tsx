import { RichText } from '@payloadcms/richtext-lexical/react'
import { Container, Icon, Avatar } from '@/components/ui'
import { DiscussionPost, User } from '@/payload-types'
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
    <div className="bg-white">
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {discussionPost.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                {author && <Avatar user={author} size="sm" showCompany={false} />}
                <div>
                  <div className="font-medium text-gray-900">
                    {author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {author?.title && author?.company && (
                      <>
                        {author.title} at {typeof author.company === 'object' ? author.company.name : author.company}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Icon name="calendar" size="xs" />
                <span>
                  {formatDate(discussionPost.createdAt, {
                    abbreviateMonth: false,
                    includeYear: true,
                    timezone: userTimezone,
                  })}
                </span>
              </div>

              {discussionPost.lastActivity && discussionPost.lastActivity !== discussionPost.createdAt && (
                <div className="flex items-center gap-1">
                  <Icon name="clock" size="xs" />
                  <span>
                    Last activity {formatDate(discussionPost.lastActivity, {
                      abbreviateMonth: true,
                      includeYear: false,
                      timezone: userTimezone,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose max-w-none">
            <RichText data={discussionPost.content} className="payload-rich-text" />
          </div>
        </div>
      </Container>
    </div>
  )
}
