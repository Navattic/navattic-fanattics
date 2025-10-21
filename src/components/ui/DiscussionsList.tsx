'use client'

import { DiscussionPost } from '@/payload-types'
import { Icon, Avatar } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import Link from 'next/link'

function extractTextFromLexicalContent(node: any): string {
  if (!node) return ''

  if (node.type === 'text' && node.text) {
    return node.text
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromLexicalContent).join(' ')
  }

  return ''
}

function getContentPreview(content: any, maxLength: number = 150): string {
  if (!content || !content.root) return ''

  const textContent = extractTextFromLexicalContent(content.root).trim()

  if (textContent.length <= maxLength) {
    return textContent
  }

  const truncated = textContent.substring(0, maxLength)
  const lastSpaceIndex = truncated.lastIndexOf(' ')

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }

  return truncated + '...'
}

export const DiscussionsList = ({
  discussionsData,
  commentCountMap,
  userTimezone,
}: {
  discussionsData: DiscussionPost[]
  commentCountMap: Record<string, number>
  userTimezone?: string
}) => {
  return (
    <div className="flex flex-col gap-4">
      {discussionsData?.map((discussion) => {
        const commentCount = commentCountMap?.[String(discussion.id)] || 0
        const author = typeof discussion.author === 'object' ? discussion.author : null
        const contentPreview = getContentPreview(discussion.content)

        return (
          <Link
            key={discussion.id}
            href={`/discussions/${discussion.slug}`}
            className="inset-shadow space-y-3 rounded-3xl border border-gray-100 bg-gradient-to-b from-white/90 to-white/70 px-7 py-6 transition-all duration-200 hover:border-gray-300 hover:bg-white [:last-child]:mb-20"
          >
            <div className="mb-2 space-y-2">
              {/* <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Avatar user={author} size="xs" showCompany={true} />
                  <span>
                    {author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}
                  </span>
                </div>
              </div> */}
              <h3 className="text-lg font-medium">{discussion.title}</h3>

              {/* Content preview */}
              {contentPreview && (
                <p className="max-w-prose text-base leading-relaxed text-balance text-gray-500">
                  {contentPreview}
                </p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <div className="inset-shadow flex items-center gap-[6px] rounded-full bg-gray-50 px-3 py-0.5 pl-2.5">
                <Icon name="message-circle" size="sm" className="text-gray-400" />
                <span className="text-sm text-gray-500">{commentCount}</span>
              </div>
              <div className="inset-shadow flex items-center gap-[6px] rounded-full bg-gray-50 px-3 py-0.5 pl-2.5">
                <Icon name="calendar" size="sm" className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {formatDate(discussion.createdAt, {
                    abbreviateMonth: true,
                    includeYear: false,
                    timezone: userTimezone,
                  })}
                </span>
              </div>
              <div className="inset-shadow flex items-center gap-[6px] rounded-full bg-gray-50 px-3 py-0.5 pl-1">
                <span className="text-sm text-gray-500">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full border border-gray-300">
                        <Avatar user={author} size="xs" showCompany={true} />
                      </div>
                      <span>
                        {author ? `${author.firstName} ${author.lastName}` : 'Unknown Author'}
                      </span>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
