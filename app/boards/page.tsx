'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SZWtsYW0gTMO2dmjJmXNpPC90ZXh0Pjwvc3ZnPg==';

interface Board {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  width: number;
  height: number;
  boardType: string;
  thumbnailImage: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetchBoards();
  }, [selectedCity]);

  const fetchBoards = async () => {
    try {
      const url = selectedCity
        ? `/api/boards?city=${encodeURIComponent(selectedCity)}`
        : '/api/boards';

      const response = await fetch(url);
      const data = await response.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const cities = [...new Set(boards.map(b => b.city))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                banner.az
              </h1>
            </Link>
            <Link
              href="/login"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base font-semibold"
            >
              <span className="hidden sm:inline">+ Elan Yerləşdir</span>
              <span className="sm:hidden">+ Elan</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Reklam Lövhələri
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Azərbaycanda ən yaxşı reklam lövhələrini kəşf edin
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters and View Toggle */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              Mövcud Lövhələr
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white font-medium transition-all"
              >
                <option value="">📍 Bütün Şəhərlər</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">📋 Siyahı</span>
                  <span className="sm:hidden">📋</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">🗺️ Xəritə</span>
                  <span className="sm:hidden">🗺️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg font-medium">Yüklənir...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl sm:text-6xl mb-4">📭</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Hələ lövhə yoxdur</h3>
            <p className="text-gray-600 mb-6 px-4">İlk reklam lövhənizi yerləşdirin və gəlir əldə etməyə başlayın</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="text-lg sm:text-xl">+</span>
              <span className="text-sm sm:text-base">İlk Lövhəni Yerləşdir</span>
            </Link>
          </div>
        ) : viewMode === 'list' ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm sm:text-base text-gray-600">
                <span className="font-bold text-indigo-600">{boards.length}</span> lövhə tapıldı
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {boards.map((board) => (
                <Link key={board.id} href={`/boards/${board.id}`}>
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-2 group">
                    <div className="relative h-44 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                      <Image
                        src={board.thumbnailImage || DEFAULT_PLACEHOLDER}
                        alt={board.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized={!board.thumbnailImage}
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                          {board.boardType}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {board.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 h-8 sm:h-10">{board.description}</p>
                      <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4 flex items-center gap-1">
                        <span>📍</span>
                        <span className="font-semibold text-gray-700">{board.city}</span>
                        <span className="mx-1">•</span>
                        <span>{board.width}m × {board.height}m</span>
                      </p>
                      <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {(board.pricePerDay / 100).toFixed(0)}
                            </span>
                            <span className="text-xl sm:text-2xl font-bold text-gray-400">₼</span>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500 font-medium">/ gün</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100" style={{ height: '500px', minHeight: '400px' }}>
            <MapView boards={boards} />
          </div>
        )}
      </div>
    </div>
  );
}
