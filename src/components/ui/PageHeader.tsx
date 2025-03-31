'use client'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { MessageSquareIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PageHeader = ({ title }: { title?: string }) => {
  
  const pathname = usePathname()

  return (
    <div className="w-full sticky top-0 z-10 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-8 py-3">
        {pathname === '/' ? 'Home' : <Breadcrumbs title={title} />}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MessageSquareIcon className="h-4 w-4 text-gray-400" />
          Feedback
        </div>
      </div>
    </div>
  )
}

export default PageHeader
