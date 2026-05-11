export default function ForumLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-lg" />
              <div>
                <div className="h-5 w-40 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
