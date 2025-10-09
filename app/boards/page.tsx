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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">banner.az</h1>
            </Link>
            <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              Elan Yerləşdir
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Mövcud Reklam Lövhələri</h2>

          <div className="flex gap-4 items-center">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Bütün Şəhərlər</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
              >
                Siyahı
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 ${viewMode === 'map' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
              >
                Xəritə
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Yüklənir...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Hələ lövhə yoxdur.</p>
            <Link href="/admin" className="text-indigo-600 hover:underline mt-2 inline-block">
              İlk lövhəni siz yerləşdirin!
            </Link>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={board.thumbnailImage || DEFAULT_PLACEHOLDER}
                      alt={board.title}
                      fill
                      className="object-cover"
                      unoptimized={!board.thumbnailImage}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{board.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{board.description}</p>
                    <p className="text-gray-500 text-sm mb-3">
                      <span className="font-medium">{board.city}</span> • {board.width}m × {board.height}m
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {(board.pricePerDay / 100).toFixed(0)} ₼
                        </p>
                        <p className="text-xs text-gray-500">gün</p>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {board.boardType}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '600px' }}>
            <MapView boards={boards} />
          </div>
        )}
      </div>
    </div>
  );
}
