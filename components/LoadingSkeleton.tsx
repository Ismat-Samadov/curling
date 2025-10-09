'use client';

export function BoardCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="relative h-44 sm:h-56 bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="flex items-center gap-2 mt-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
          <div className="h-8 bg-gray-300 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function BoardDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 animate-pulse">
          {/* Left column */}
          <div className="space-y-4 sm:space-y-6">
            <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 sm:h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-4" />
              <div className="h-5 bg-gray-200 rounded w-full mb-2" />
              <div className="h-5 bg-gray-200 rounded w-5/6 mb-6" />

              <div className="space-y-3">
                <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" />
                <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
