export default function PlanLoading() {
  return (
    <div
      className="bg-gray-100 animate-pulse relative"
      style={{ height: "calc(100dvh - 56px)" }}
    >
      {/* Fake map background */}
      <div className="absolute inset-0 bg-gray-100" />
      {/* Fake filter panel left */}
      <div className="absolute top-0 left-0 bottom-0 w-96 bg-white/90 border-r border-gray-200 p-6 hidden lg:block">
        <div className="h-7 w-40 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-10 bg-gray-100 rounded-lg" />
            </div>
          ))}
          <div className="h-10 bg-sky-100 rounded-lg mt-4" />
        </div>
      </div>
      {/* Center spinner */}
      <div className="absolute inset-0 flex items-center justify-center lg:pl-96">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-sky-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
          <span className="text-sm text-gray-400 font-medium">
            Chargement du planificateur…
          </span>
        </div>
      </div>
    </div>
  );
}
