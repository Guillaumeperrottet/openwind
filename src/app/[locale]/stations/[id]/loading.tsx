export default function StationLoading() {
  return (
    <div className="min-h-screen bg-white pb-20 animate-pulse">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-6">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
          <div className="h-5 w-28 bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* Wind data skeleton */}
      <div className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-50 rounded-xl border border-gray-100"
            />
          ))}
        </div>

        {/* History chart skeleton */}
        <div className="h-6 w-36 bg-gray-200 rounded mb-4" />
        <div className="h-48 bg-gray-50 rounded-xl border border-gray-100" />

        {/* Forecast skeleton */}
        <div className="h-6 w-40 bg-gray-200 rounded mb-4 mt-8" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-50 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
