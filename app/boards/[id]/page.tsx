'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BoardDetailSkeleton } from '@/components/LoadingSkeleton';

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
  country: string;
  width: number;
  height: number;
  boardType: string;
  images: string[];
  thumbnailImage: string;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: string;
}

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchBoard();
  }, [params.id]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in, that's fine
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
  };

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${params.id}`);
      const data = await response.json();
      setBoard(data.board);

      // Track view after board is loaded
      if (data.board) {
        trackEvent('view');
      }
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (eventType: 'view' | 'phone_reveal') => {
    try {
      await fetch('/api/statistics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: parseInt(params.id as string),
          eventType,
        }),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const handleContactOwner = () => {
    if (board?.ownerPhone) {
      window.open(`tel:${board.ownerPhone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (board?.ownerPhone) {
      const message = encodeURIComponent(`Salam! ${board.title} elanınız haqqında məlumat almaq istərdim.`);
      window.open(`https://wa.me/${board.ownerPhone.replace(/\D/g, '')}?text=${message}`, '_blank');
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Show first 3 and last 2 digits, mask the rest
    // Example: +994501234567 -> +994 50 *** ** 67
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 5) return phone;

    const countryCode = phone.startsWith('+') ? '+' + cleaned.substring(0, 3) : cleaned.substring(0, 3);
    const firstPart = cleaned.substring(3, 5);
    const lastPart = cleaned.substring(cleaned.length - 2);

    return `${countryCode} ${firstPart} *** ** ${lastPart}`;
  };

  const handleRevealPhone = () => {
    setPhoneRevealed(true);
    trackEvent('phone_reveal');
  };

  if (loading) {
    return <BoardDetailSkeleton />;
  }

  if (!board) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-6xl mb-4">❌</div>
        <p className="text-gray-600 text-lg font-medium">Lövhə tapılmadı</p>
        <Link
          href="/boards"
          className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
        >
          ← Lövhələrə Qayıt
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/boards">
              <span className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Lövhələrə Qayıt</span>
                <span className="sm:hidden">Geri</span>
              </span>
            </Link>
            <Link href="/">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                reklamyeri.az
              </h1>
            </Link>

            {!authLoading && (
              <div className="flex items-center gap-2 sm:gap-3">
                {user ? (
                  // Authenticated user navigation
                  <>
                    <Link
                      href="/dashboard"
                      className="px-3 sm:px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all font-semibold text-sm sm:text-base"
                    >
                      <span className="hidden sm:inline">🏠 Panelim</span>
                      <span className="sm:hidden">🏠</span>
                    </Link>
                    <Link
                      href="/admin"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base font-semibold"
                    >
                      <span className="hidden sm:inline">+ Elan Yerləşdir</span>
                      <span className="sm:hidden">+ Elan</span>
                    </Link>
                    <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-gray-300">
                      <Link
                        href="/account"
                        className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
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
                      className="sm:hidden text-red-600 hover:text-red-700 px-2 py-2 rounded-lg font-semibold"
                    >
                      🚪
                    </button>
                  </>
                ) : (
                  // Non-authenticated user navigation
                  <>
                    <Link
                      href="/login"
                      className="px-3 sm:px-4 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all font-semibold text-sm sm:text-base border-2 border-transparent hover:border-indigo-200"
                    >
                      <span className="hidden sm:inline">🔐 Daxil ol</span>
                      <span className="sm:hidden">🔐</span>
                    </Link>
                    <Link
                      href="/login"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm sm:text-base font-semibold"
                    >
                      <span className="hidden sm:inline">+ Elan Yerləşdir</span>
                      <span className="sm:hidden">+ Elan</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left column - Images */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
              <Image
                src={board.thumbnailImage || DEFAULT_PLACEHOLDER}
                alt={`${board.title} - ${board.boardType} reklam lövhəsi ${board.city}, ${board.address} - ${board.width}m × ${board.height}m`}
                fill
                className="object-cover"
                priority
                unoptimized={!board.thumbnailImage}
              />
            </div>
            {board.images && board.images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                {board.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative h-20 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-indigo-400 transition-all cursor-pointer group">
                    <Image
                      src={img || DEFAULT_PLACEHOLDER}
                      alt={`${board.title} - Şəkil ${idx + 1} - ${board.boardType} lövhəsi ${board.city}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      unoptimized={!img}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100" style={{ height: '280px', minHeight: '250px' }}>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                Ünvan
              </h3>
              <MapView boards={[board]} center={[board.latitude, board.longitude]} zoom={15} />
            </div>
          </div>

          {/* Right column - Details */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{board.title}</h1>
                  <div className="flex items-start gap-2 text-gray-600 mb-1">
                    <span className="text-lg mt-0.5">📍</span>
                    <p className="text-sm sm:text-base">{board.address}</p>
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base ml-7">
                    <span className="font-semibold text-gray-700">{board.city}</span>, {board.country}
                  </p>
                </div>
                <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap ${
                  board.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {board.status === 'available' ? '✓ Aktiv' : '⏸ Rezerv'}
                </span>
              </div>

              <p className="text-gray-700 text-sm sm:text-base mb-6 leading-relaxed">{board.description}</p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-5 rounded-xl border border-indigo-100">
                  <p className="text-xs sm:text-sm text-indigo-600 font-semibold mb-1">📏 Ölçülər</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{board.width}m × {board.height}m</p>
                  <p className="text-xs text-gray-500 mt-1">{(board.width * board.height).toFixed(1)} m²</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-5 rounded-xl border border-purple-100">
                  <p className="text-xs sm:text-sm text-purple-600 font-semibold mb-1">🎯 Növ</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{board.boardType}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5 sm:pt-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Qiymətlər
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">📅 Günlük</span>
                    <span className="font-bold text-xl sm:text-2xl text-gray-900">{(board.pricePerDay / 100).toFixed(0)} ₼</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">📆 Həftəlik</span>
                    <span className="font-bold text-xl sm:text-2xl text-gray-900">{(board.pricePerWeek / 100).toFixed(0)} ₼</span>
                  </div>
                  <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <span className="text-gray-700 font-medium text-sm sm:text-base">🗓️ Aylıq</span>
                    <span className="font-bold text-xl sm:text-2xl text-gray-900">{(board.pricePerMonth / 100).toFixed(0)} ₼</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-5 sm:pt-6 mt-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  Əlaqə Məlumatları
                </h3>
                <div className="space-y-3 sm:space-y-4 mb-5">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Ad və Soyad</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">{board.ownerName}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <p className="text-xs sm:text-sm text-indigo-600 font-semibold mb-2">📞 Telefon</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                      {phoneRevealed ? board.ownerPhone : maskPhoneNumber(board.ownerPhone)}
                    </p>
                    {!phoneRevealed && (
                      <button
                        onClick={handleRevealPhone}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-100 transition-all border-2 border-indigo-200 shadow-sm text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Nömrəni Göstər
                      </button>
                    )}
                  </div>
                  {board.ownerEmail && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">📧 E-poçt</p>
                      <p className="text-sm sm:text-base font-medium text-gray-900">{board.ownerEmail}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleContactOwner}
                    disabled={!phoneRevealed}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3.5 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-sm sm:text-base"
                  >
                    📞 Zəng Et
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    disabled={!phoneRevealed}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3.5 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none text-sm sm:text-base"
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
