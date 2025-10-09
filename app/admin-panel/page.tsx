'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5SZWtsYW0gTMO2dmjJmXNpPC90ZXh0Pjwvc3ZnPg==';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  _count?: {
    boards: number;
  };
}

interface Board {
  id: number;
  title: string;
  description: string;
  city: string;
  boardType: string;
  thumbnailImage: string;
  pricePerDay: number;
  isActive: boolean;
  isAvailable: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface Stats {
  totalUsers: number;
  totalBoards: number;
  activeBoards: number;
  totalViews: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newBoardsThisMonth: number;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'boards'>('overview');

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBoards: 0,
    activeBoards: 0,
    totalViews: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    newBoardsThisMonth: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [boardFilter, setBoardFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user || !data.user.isAdmin) {
        router.push('/dashboard');
        return;
      }

      setUser(data.user);
      fetchStats();
      fetchUsers();
      fetchBoards();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/admin/boards');
      const data = await response.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    if (!confirm(`Bu istifadəçinin admin statusunu ${currentStatus ? 'ləğv' : 'təyin'} etmək istədiyinizə əminsiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('Xəta baş verdi');
      }
    } catch (error) {
      console.error('Error toggling admin:', error);
      alert('Xəta baş verdi');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bu istifadəçini silmək istədiyinizə əminsiniz? Bütün məlumatları silinəcək.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUsers();
        fetchStats();
      } else {
        alert('Xəta baş verdi');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Xəta baş verdi');
    }
  };

  const handleToggleBoardStatus = async (boardId: number, field: 'isActive' | 'isAvailable', currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/boards/${boardId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: !currentStatus }),
      });

      if (response.ok) {
        fetchBoards();
        fetchStats();
      } else {
        alert('Xəta baş verdi');
      }
    } catch (error) {
      console.error('Error toggling board status:', error);
      alert('Xəta baş verdi');
    }
  };

  const handleDeleteBoard = async (boardId: number) => {
    if (!confirm('Bu lövhəni silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/boards/${boardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBoards();
        fetchStats();
      } else {
        alert('Xəta baş verdi');
      }
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Xəta baş verdi');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  // Filter users
  const filteredUsers = users.filter(u => {
    if (userFilter === 'admin' && !u.isAdmin) return false;
    if (userFilter === 'user' && u.isAdmin) return false;
    if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Filter boards
  const filteredBoards = boards.filter(b => {
    if (boardFilter === 'active' && !b.isActive) return false;
    if (boardFilter === 'inactive' && b.isActive) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !b.city.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
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

  if (!user || !user.isAdmin) {
    return null;
  }

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
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/dashboard"
                className="px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold text-sm sm:text-base"
              >
                <span className="hidden sm:inline">🏠 Panelim</span>
                <span className="sm:hidden">🏠</span>
              </Link>
              <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-semibold">
                    👑
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-red-600 font-semibold">Admin</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg font-semibold transition-all"
                >
                  Çıxış
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl mb-4">👑</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
              Admin Panel
            </h2>
            <p className="text-orange-100 text-base sm:text-lg">
              Bütün sistemi idarə edin
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Ümumi Baxış
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              👥 İstifadəçilər ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('boards')}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'boards'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📋 Lövhələr ({boards.length})
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Toplam İstifadəçi</span>
                  <span className="text-3xl">👥</span>
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-green-600 text-sm mt-1">+{stats.newUsersThisMonth} bu ay</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Toplam Lövhə</span>
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-4xl font-bold text-gray-900">{stats.totalBoards}</p>
                <p className="text-green-600 text-sm mt-1">+{stats.newBoardsThisMonth} bu ay</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Aktiv Lövhə</span>
                  <span className="text-3xl">✅</span>
                </div>
                <p className="text-4xl font-bold text-green-600">{stats.activeBoards}</p>
                <p className="text-gray-500 text-sm mt-1">Hazırda aktiv</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Toplam Baxış</span>
                  <span className="text-3xl">👁️</span>
                </div>
                <p className="text-4xl font-bold text-indigo-600">{stats.totalViews}</p>
                <p className="text-gray-500 text-sm mt-1">Bütün lövhələr</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="🔍 İstifadəçi axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      userFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Hamısı
                  </button>
                  <button
                    onClick={() => setUserFilter('admin')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      userFilter === 'admin' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => setUserFilter('user')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      userFilter === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    İstifadəçi
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ad</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">E-poçt</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Telefon</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Elanlar</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarix</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Əməliyyatlar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{u.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                              u.isAdmin ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                            }`}>
                              {u.isAdmin ? '👑' : u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{u.email}</td>
                        <td className="py-3 px-4 text-gray-700">{u.phone || '-'}</td>
                        <td className="py-3 px-4 text-gray-700">{u._count?.boards || 0}</td>
                        <td className="py-3 px-4">
                          {u.isAdmin ? (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
                              👑 Admin
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                              ✓ İstifadəçi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">
                          {new Date(u.createdAt).toLocaleDateString('az-AZ')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                              disabled={u.id === user.id}
                              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                u.id === user.id
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : u.isAdmin
                                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {u.isAdmin ? '↓ Admin Ləğv' : '↑ Admin Et'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.id === user.id}
                              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                u.id === user.id
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Boards Tab */}
        {activeTab === 'boards' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <input
                  type="text"
                  placeholder="🔍 Lövhə axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setBoardFilter('all')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      boardFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Hamısı
                  </button>
                  <button
                    onClick={() => setBoardFilter('active')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      boardFilter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Aktiv
                  </button>
                  <button
                    onClick={() => setBoardFilter('inactive')}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      boardFilter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Qeyri-aktiv
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBoards.map((board) => (
                  <div key={board.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl overflow-hidden border border-gray-100 transition-all">
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <Image
                        src={board.thumbnailImage || DEFAULT_PLACEHOLDER}
                        alt={board.title}
                        fill
                        className="object-cover"
                        unoptimized={!board.thumbnailImage}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                          board.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                        }`}>
                          {board.isActive ? '✓ Aktiv' : '✗ Qeyri-aktiv'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{board.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{board.description}</p>
                      <p className="text-gray-500 text-sm mb-3">
                        📍 {board.city} • {board.boardType}
                      </p>
                      <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                        <p className="text-2xl font-bold text-indigo-600">
                          {(board.pricePerDay / 100).toFixed(0)} ₼
                          <span className="text-sm text-gray-500 ml-1">/ gün</span>
                        </p>
                      </div>
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">
                          👤 <span className="font-semibold">{board.user.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">{board.user.email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleToggleBoardStatus(board.id, 'isActive', board.isActive)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            board.isActive
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {board.isActive ? '⏸ Deaktiv Et' : '▶ Aktiv Et'}
                        </button>
                        <button
                          onClick={() => handleDeleteBoard(board.id)}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                      <Link
                        href={`/boards/${board.id}`}
                        className="block mt-2 text-center text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Detallı Bax →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBoards.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Heç bir nəticə tapılmadı</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
