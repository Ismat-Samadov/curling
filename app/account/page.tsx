'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/login');
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== 'sil') {
      alert('Xahiş edirik "SİL" yazın');
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Hesabınız uğurla silindi');
        router.push('/');
      } else {
        alert(data.error || 'Hesab silinərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Hesab silinərkən xəta baş verdi');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">Yüklənir...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const accountAge = user.createdAt
    ? Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <span className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Panelə Qayıt</span>
                <span className="sm:hidden">Geri</span>
              </span>
            </Link>
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                banner.az
              </h1>
            </Link>
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl font-bold border-4 border-white/30">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              {user.name}
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg">
              Hesab İdarəetməsi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            Hesab Məlumatları
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-600 font-semibold mb-1">Ad və Soyad</p>
              <p className="text-lg font-bold text-gray-900">{user.name}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-600 font-semibold mb-1">📧 E-poçt</p>
              <p className="text-lg font-bold text-gray-900">{user.email}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-600 font-semibold mb-1">📞 Telefon</p>
              <p className="text-lg font-bold text-gray-900">{user.phone || 'Əlavə edilməyib'}</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <p className="text-sm text-purple-600 font-semibold mb-1">📅 Hesab Yaradılma Tarixi</p>
              <p className="text-lg font-bold text-gray-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('az-AZ', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Məlumat yoxdur'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {accountAge} gün əvvəl
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Təhlükə Zonası
          </h3>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 sm:p-6 mb-4">
            <h4 className="text-lg font-bold text-red-900 mb-2">Hesabı Sil</h4>
            <p className="text-red-700 text-sm sm:text-base mb-4">
              Bu əməliyyat geri qaytarıla bilməz. Hesabınızı sildikdə:
            </p>
            <ul className="list-disc list-inside text-red-700 text-sm sm:text-base space-y-1 mb-4">
              <li>Bütün şəxsi məlumatlarınız silinəcək</li>
              <li>Yerləşdirdiyiniz bütün elanlar silinəcək</li>
              <li>Yüklədiyiniz bütün şəkillər silinəcək</li>
              <li>Hesabınıza bir daha daxil ola bilməyəcəksiniz</li>
            </ul>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              🗑️ Hesabı Sil
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Hesabı Sil?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Bu əməliyyat geri qaytarıla bilməz. Bütün məlumatlarınız həmişəlik silinəcək.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Təsdiq etmək üçün <span className="text-red-600">SİL</span> yazın:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="SİL"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 font-semibold"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                disabled={deleting}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                Ləğv Et
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmation.toLowerCase() !== 'sil'}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Silinir...' : '🗑️ Hesabı Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
