'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@/payload-types'
import { PageTitle, Empty, Button, Icon, Pagination } from '@/components/ui'
import { FanatticsDirectoryGrid } from './FanatticsDirectoryGrid'

interface UserWithStats {
  user: User
  points: number
  challengesCompleted: number
  itemsRedeemed: number
  commentsWritten: number
}

interface FanatticsDirectoryPageProps {
  users: UserWithStats[]
  currentPage: number
  totalPages: number
  totalUsers: number
  pageSize: number
  currentUserSlug?: string | null
}

export function FanatticsDirectoryPage({
  users,
  currentPage,
  totalPages: _totalPages,
  totalUsers,
  pageSize,
  currentUserSlug,
}: FanatticsDirectoryPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    // Convert from 0-based to 1-based for URL
    const pageNum = page + 1
    const params = new URLSearchParams(searchParams.toString())
    if (pageNum === 1) {
      params.delete('page')
    } else {
      params.set('page', pageNum.toString())
    }
    router.push(`/fanattics?${params.toString()}`)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pageSize', newPageSize.toString())
    // Reset to page 1 when changing page size
    params.delete('page')
    router.push(`/fanattics?${params.toString()}`)
  }

  return (
    <>
      <PageTitle
        title="Fanattics"
        description={`
          Discover and connect with members of the Fanattics community. Include a bio in your
          profile to be featured here.
          `}
        button={
          currentUserSlug ? (
            <Button href={`/profile/${currentUserSlug}`} size="md" variant="outline">
              View your profile <Icon name="arrow-right" className="size-4" />
            </Button>
          ) : undefined
        }
      />

      {users.length > 0 ? (
        <>
          <FanatticsDirectoryGrid users={users} />
          <Pagination
            pageSize={pageSize}
            maxRow={totalUsers}
            page={currentPage - 1}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            hidePageSizeSelector={false}
            hideIfNotNeeded={true}
            className="mt-10"
          />
        </>
      ) : (
        <Empty title="No users found" description="Check back soon for updates." iconName="user" />
      )}
    </>
  )
}
