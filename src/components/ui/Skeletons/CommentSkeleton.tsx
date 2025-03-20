export function CommentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Main comment skeleton */}
      <div className="flex flex-col">
        <div className="flex items-center mt-4">
          <div className="mr-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
        <div className="relative flex items-stretch">
          <div className="px-4 mr-3 self-stretch">
            <div className="w-0.5 bg-gray-200 h-full" />
          </div>
          <div className="flex-col space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full max-w-[320px]" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
            <div className="flex gap-2 my-3">
              <div className="h-6 w-12 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Reply skeleton */}
      <div className="flex pl-4">
        <div className="border-b-2 border-l-2 rounded-bl-2xl border-gray-200 h-10 w-[20px]" />
        <div className="flex flex-col w-full">
          <div className="flex items-center mt-4">
            <div className="mr-3">
              <div className="w-6 h-6 rounded-full bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
          </div>
          <div className="relative flex items-stretch">
            <div className="px-4 mr-3 self-stretch">
              <div className="w-0.5 bg-gray-200 h-full" />
            </div>
            <div className="flex-col space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full max-w-[280px]" />
              <div className="flex gap-2 my-3">
                <div className="h-6 w-12 bg-gray-200 rounded" />
                <div className="h-6 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
