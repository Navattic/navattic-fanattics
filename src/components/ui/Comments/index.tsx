export const Comments = () => {
  return (
    <div className="w-96 border-l pl-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Comments</h2>

        {/* Comment Input */}
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full border rounded-lg p-3 h-24 resize-none"
            placeholder="Add a comment..."
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg self-end hover:bg-blue-700 transition-colors">
            Post Comment
          </button>
        </div>

        {/* Comments List */}
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1 border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-gray-500">2 days ago</div>
            </div>
            <p className="text-gray-700">
              This is a great challenge! Looking forward to working on it.
            </p>
          </div>

          <div className="flex flex-col gap-1 border-b pb-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">Jane Smith</div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
            <p className="text-gray-700">Has anyone figured out the optimal approach for this?</p>
          </div>
        </div>
      </div>
    </div>
  )
}
