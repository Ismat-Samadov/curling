'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SZWtsYW0gTMO2dmjJmXNpPC90ZXh0Pjwvc3ZnPg==';

interface Board {
  id: number;
  title: string;
  description: string;
  city: string;
  width: number;
  height: number;
  boardType: string;
  thumbnailImage: string;
  pricePerDay: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
      } else {
        setUser(data.user);
        fetchBoards();
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/my-boards');
      const data = await response.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu lövhəni silmək istədiyinizdən əminsiniz?')) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/boards/${id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBoards(boards.filter(b => b.id !== id));
        alert('Lövhə uğurla silindi');
      } else {
        const data = await response.json();
        alert(data.error || 'Lövhə silinmədi');
      }
    } catch (error) {
      alert('Lövhə silinmədi');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Yüklənir...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">banner.az</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/boards" className="text-gray-700 hover:text-indigo-600">
                Lövhələr
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-indigo-600">
                Yeni Elan
              </Link>
              <span className="text-gray-600">Salam, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Çıxış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mənim Elanlarım</h2>
          <p className="text-gray-600">Lövhələrinizi idarə edin</p>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-600 mb-4">Hələ elanınız yoxdur.</p>
            <Link
              href="/admin"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              İlk Elanı Yerləşdir
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div key={board.id} className="bg-white rounded-xl shadow-md overflow-hidden">
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
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{board.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      board.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {board.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{board.description}</p>
                  <p className="text-gray-500 text-sm mb-3">
                    <span className="font-medium">{board.city}</span> • {board.width}m × {board.height}m
                  </p>
                  <div className="flex justify-between items-center mb-4">
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

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href={`/boards/${board.id}`}
                      className="text-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                    >
                      Bax
                    </Link>
                    <Link
                      href={`/dashboard/edit/${board.id}`}
                      className="text-center bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition"
                    >
                      Redaktə
                    </Link>
                    <button
                      onClick={() => handleDelete(board.id)}
                      disabled={deleting === board.id}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition disabled:bg-gray-200"
                    >
                      {deleting === board.id ? 'Silinir...' : 'Sil'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Yaradılıb: {new Date(board.createdAt).toLocaleDateString('az-AZ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
