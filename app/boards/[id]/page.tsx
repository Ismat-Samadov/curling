'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
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
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  useEffect(() => {
    fetchBoard();
  }, [params.id]);

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Yüklənir...</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Lövhə tapılmadı</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/boards">
            <span className="text-indigo-600 hover:underline cursor-pointer">&larr; Lövhələrə Qayıt</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - Images */}
          <div>
            <div className="relative h-96 mb-4 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={board.thumbnailImage || DEFAULT_PLACEHOLDER}
                alt={board.title}
                fill
                className="object-cover"
                unoptimized={!board.thumbnailImage}
              />
            </div>
            {board.images && board.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {board.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="relative h-24 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={img || DEFAULT_PLACEHOLDER}
                      alt={`${board.title} ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={!img}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 bg-white p-4 rounded-xl shadow-md" style={{ height: '300px' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ünvan</h3>
              <MapView boards={[board]} center={[board.latitude, board.longitude]} zoom={15} />
            </div>
          </div>

          {/* Right column - Details */}
          <div>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{board.title}</h1>
                  <p className="text-gray-600">{board.address}</p>
                  <p className="text-gray-500">{board.city}, {board.country}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  board.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {board.status}
                </span>
              </div>

              <p className="text-gray-700 mb-6">{board.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Ölçülər</p>
                  <p className="text-lg font-semibold text-gray-900">{board.width}m × {board.height}m</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Növ</p>
                  <p className="text-lg font-semibold text-gray-900">{board.boardType}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Qiymətlər</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Günlük</span>
                    <span className="font-semibold text-xl text-gray-900">{(board.pricePerDay / 100).toFixed(2)} ₼</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Həftəlik</span>
                    <span className="font-semibold text-xl text-gray-900">{(board.pricePerWeek / 100).toFixed(2)} ₼</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aylıq</span>
                    <span className="font-semibold text-xl text-gray-900">{(board.pricePerMonth / 100).toFixed(2)} ₼</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Əlaqə</h3>
                <div className="space-y-3 mb-4">
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Ad:</strong> {board.ownerName}
                  </p>
                  <div>
                    <p className="text-gray-700 mb-2">
                      <strong className="text-gray-900">Telefon:</strong>{' '}
                      {phoneRevealed ? board.ownerPhone : maskPhoneNumber(board.ownerPhone)}
                    </p>
                    {!phoneRevealed && (
                      <button
                        onClick={handleRevealPhone}
                        className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-100 transition text-sm"
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
                    <p className="text-gray-700">
                      <strong className="text-gray-900">E-poçt:</strong> {board.ownerEmail}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleContactOwner}
                    disabled={!phoneRevealed}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    📞 Zəng Et
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    disabled={!phoneRevealed}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
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
