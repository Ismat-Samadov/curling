'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

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
  viewCount?: number;
}

interface BoardStats {
  totalViews: number;
  uniqueViews: number;
  phoneReveals: number;
  last7Days: number;
  last30Days: number;
  conversionRate: string;
}

type FilterType = 'all' | 'available' | 'reserved';
type SortType = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'views';

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [user, setUser] = useState<any>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [boardStats, setBoardStats] = useState<Record<number, BoardStats>>({});
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');

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
      const fetchedBoards = data.boards || [];
      setBoards(fetchedBoards);

      // Fetch statistics for each board
      fetchedBoards.forEach(async (board: Board) => {
        try {
          const statsResponse = await fetch(`/api/statistics/${board.id}`);
          const statsData = await statsResponse.json();
          setBoardStats(prev => ({
            ...prev,
            [board.id]: statsData,
          }));
        } catch (error) {
          console.error(`Error fetching stats for board ${board.id}:`, error);
        }
      });
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: 'Lövhəni Sil',
      message: 'Bu lövhəni silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.',
      confirmText: 'Bəli, Sil',
      cancelText: 'Xeyr',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    setDeleting(id);

    try {
      const response = await fetch(`/api/boards/${id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBoards(boards.filter(b => b.id !== id));
        toast.success('Lövhə uğurla silindi');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Lövhə silinmədi');
      }
    } catch (error) {
      toast.error('Lövhə silinmədi');
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  // Calculate overview statistics
  const overviewStats = {
    totalBoards: boards.length,
    activeBoards: boards.filter(b => b.status === 'available').length,
    totalViews: Object.values(boardStats).reduce((sum, stats) => sum + stats.totalViews, 0),
    totalPhoneReveals: Object.values(boardStats).reduce((sum, stats) => sum + stats.phoneReveals, 0),
    totalEarnings: boards.reduce((sum, b) => sum + (b.pricePerDay / 100), 0),
    last7DaysViews: Object.values(boardStats).reduce((sum, stats) => sum + stats.last7Days, 0),
  };

  // Filter and sort boards
  const filteredAndSortedBoards = boards
    .filter(board => {
      if (filterType !== 'all' && board.status !== filterType) return false;
      if (searchQuery && !board.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !board.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortType) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price-high':
          return b.pricePerDay - a.pricePerDay;
        case 'price-low':
          return a.pricePerDay - b.pricePerDay;
        case 'views':
          const aViews = boardStats[a.id]?.totalViews || 0;
          const bViews = boardStats[b.id]?.totalViews || 0;
          return bViews - aViews;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const ToastContainer = toast.ToastContainer;

  return (
    <>
      <ToastContainer />
      <ConfirmDialog />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                  banner.az
                </h1>
              </Link>
              <div className="flex items-center gap-2 sm:gap-4">
                {user?.isAdmin && (
                  <Link
                    href="/admin-panel"
                    className="hidden sm:block px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                  >
                    👑 Admin Panel
                  </Link>
                )}
                <Link
                  href="/boards"
                  className="hidden sm:block px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  Lövhələr
                </Link>
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  + Yeni Elan
                </Link>
                <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-300">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg font-semibold transition-all"
                  >
                    Çıxış
                  </button>
                </div>
                <Link
                  href="/account"
                  className="sm:hidden text-gray-700 hover:text-indigo-600 px-2 py-2 rounded-lg font-semibold"
                >
                  👤
                </Link>
                <button
                  onClick={handleLogout}
                  className="sm:hidden text-red-600 hover:text-red-700 px-3 py-2 rounded-lg font-semibold"
                >
                  Çıxış
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <h2 className="text-4xl sm:text-5xl font-bold mb-3">
                Salam, {user.name}! 👋
              </h2>
              <p className="text-indigo-100 text-lg">Reklam lövhələrinizi idarə edin və statistikanızı izləyin</p>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-100 text-sm font-medium">Toplam Elan</span>
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-4xl font-bold">{overviewStats.totalBoards}</p>
                <p className="text-indigo-100 text-sm mt-1">{overviewStats.activeBoards} aktiv</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-100 text-sm font-medium">Toplam Baxış</span>
                  <span className="text-3xl">👁️</span>
                </div>
                <p className="text-4xl font-bold">{overviewStats.totalViews}</p>
                <p className="text-indigo-100 text-sm mt-1">+{overviewStats.last7DaysViews} son 7 gün</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-100 text-sm font-medium">Nömrə Açılışı</span>
                  <span className="text-3xl">📞</span>
                </div>
                <p className="text-4xl font-bold">{overviewStats.totalPhoneReveals}</p>
                <p className="text-indigo-100 text-sm mt-1">Potensial müştəri</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-indigo-100 text-sm font-medium">Gündəlik Qiymət</span>
                  <span className="text-3xl">💰</span>
                </div>
                <p className="text-4xl font-bold">{overviewStats.totalEarnings.toFixed(0)}₼</p>
                <p className="text-indigo-100 text-sm mt-1">Günlük gəlir</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Elan və ya şəhər axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    filterType === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hamısı
                </button>
                <button
                  onClick={() => setFilterType('available')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    filterType === 'available'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aktiv
                </button>
                <button
                  onClick={() => setFilterType('reserved')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    filterType === 'reserved'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rezerv
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-medium"
              >
                <option value="newest">Ən Yeni</option>
                <option value="oldest">Ən Köhnə</option>
                <option value="price-high">Qiymət: Yüksək</option>
                <option value="price-low">Qiymət: Aşağı</option>
                <option value="views">Ən Çox Baxılan</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {filteredAndSortedBoards.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery || filterType !== 'all' ? 'Nəticə tapılmadı' : 'Hələ elanınız yoxdur'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterType !== 'all'
                  ? 'Axtarış kriteriyalarını dəyişdirərək yenidən cəhd edin'
                  : 'İlk reklam lövhənizi yerləşdirin və gəlir əldə etməyə başlayın'}
              </p>
              {!searchQuery && filterType === 'all' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="text-xl">+</span>
                  İlk Elanı Yerləşdir
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredAndSortedBoards.length}</span> elan tapıldı
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedBoards.map((board) => (
                  <div
                    key={board.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 transform hover:-translate-y-2 group"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <Image
                        src={board.thumbnailImage || DEFAULT_PLACEHOLDER}
                        alt={board.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized={!board.thumbnailImage}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                          board.status === 'available'
                            ? 'bg-green-500/90 text-white shadow-lg'
                            : 'bg-orange-500/90 text-white shadow-lg'
                        }`}>
                          {board.status === 'available' ? '✓ Aktiv' : '⏸ Rezerv'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                          {board.boardType}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Title and Location */}
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {board.title}
                        </h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                          <span>📍</span>
                          <span className="font-medium text-gray-700">{board.city}</span>
                          <span className="mx-1">•</span>
                          <span>{board.width}m × {board.height}m</span>
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">{board.description}</p>

                      {/* Price */}
                      <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {(board.pricePerDay / 100).toFixed(0)}
                          </span>
                          <span className="text-2xl font-bold text-gray-400">₼</span>
                          <span className="text-sm text-gray-500 ml-1">/ gün</span>
                        </div>
                      </div>

                      {/* Statistics */}
                      {boardStats[board.id] && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-2xl font-bold text-gray-900">{boardStats[board.id].totalViews}</p>
                              <p className="text-xs text-gray-500 mt-0.5">👁️ Baxış</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-indigo-600">{boardStats[board.id].phoneReveals}</p>
                              <p className="text-xs text-gray-500 mt-0.5">📞 Nömrə</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">{boardStats[board.id].conversionRate}%</p>
                              <p className="text-xs text-gray-500 mt-0.5">📈 Dönüşüm</p>
                            </div>
                          </div>
                          {boardStats[board.id].last7Days > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-center text-gray-600">
                                <span className="font-semibold text-indigo-600">+{boardStats[board.id].last7Days}</span> baxış son 7 gün
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href={`/boards/${board.id}`}
                          className="text-center bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all hover:shadow-md"
                        >
                          👁️ Bax
                        </Link>
                        <Link
                          href={`/dashboard/edit/${board.id}`}
                          className="text-center bg-indigo-100 text-indigo-700 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-200 transition-all hover:shadow-md"
                        >
                          ✏️ Redaktə
                        </Link>
                        <button
                          onClick={() => handleDelete(board.id)}
                          disabled={deleting === board.id}
                          className="bg-red-100 text-red-700 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-200 transition-all disabled:bg-gray-200 disabled:text-gray-400 hover:shadow-md"
                        >
                          {deleting === board.id ? '⏳' : '🗑️'} {deleting === board.id ? 'Silinir' : 'Sil'}
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-xs text-gray-400">
                          📅 {new Date(board.createdAt).toLocaleDateString('az-AZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <Link
                          href={`/boards/${board.id}`}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          Detallı →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
