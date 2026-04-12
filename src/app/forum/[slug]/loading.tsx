export default function ForumSlugLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-56 bg-gray-200 rounded mb-6" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-200 rounded-full" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
