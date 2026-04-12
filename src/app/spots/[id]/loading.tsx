export default function SpotLoading() {
  return (
    <div className="min-h-screen bg-white pb-20 animate-pulse">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="flex gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded" />
            <div className="h-5 w-5 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-8 w-56 bg-gray-200 rounded mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-full bg-gray-100 rounded mb-2" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
      </div>

      {/* Wind compass skeleton */}
      <div className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-48 w-48 bg-gray-100 rounded-full" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Forecast table skeleton */}
      <div className="px-4 sm:px-6 py-4">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
