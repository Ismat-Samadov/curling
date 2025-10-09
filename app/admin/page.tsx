'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/useToast';
import { AZERBAIJAN_CITIES, BOARD_TYPES, CITY_COORDINATES } from '@/lib/regions';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: 40.4093, // Baku default
    longitude: 49.8671, // Baku default
    address: '',
    city: '',
    country: 'Azərbaycan',
    width: 0,
    height: 0,
    boardType: 'billboard',
    images: [] as string[],
    thumbnailImage: '',
    pricePerDay: 0,
    pricePerWeek: 0,
    pricePerMonth: 0,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
  });

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!data.user) {
          router.push('/login');
        } else {
          setUser(data.user);
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            ownerName: data.user.name,
            ownerEmail: data.user.email,
            ownerPhone: data.user.phone || '',
          }));
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

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

  // Calculate completion percentage
  const calculateProgress = () => {
    if (step === 1) {
      const step1Fields = formData.title && formData.description && formData.width && formData.height;
      return step1Fields ? 33 : 10;
    } else if (step === 2) {
      return formData.images.length > 0 ? 66 : 50;
    } else {
      return formData.pricePerDay > 0 ? 100 : 80;
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Compress images before upload
      const compressedFiles = await Promise.all(
        Array.from(files).map(file => compressImage(file))
      );

      const formData = new FormData();
      compressedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...data.urls],
          thumbnailImage: prev.thumbnailImage || data.urls[0],
        }));
        toast.success('Şəkillər uğurla yükləndi');
      } else {
        toast.error(`Şəkillər yüklənmədi: ${data.error || 'Naməlum xəta'}`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Şəkillər yüklənmədi');
    } finally {
      setUploading(false);
    }
  };

  // Handle city selection and update map coordinates
  const handleCityChange = (city: string) => {
    setFormData(prev => ({
      ...prev,
      city,
    }));

    // Update map coordinates if city has predefined coordinates
    if (CITY_COORDINATES[city]) {
      const coords = CITY_COORDINATES[city];
      setFormData(prev => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
      }));
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerDay: Math.round(formData.pricePerDay * 100),
          pricePerWeek: Math.round(formData.pricePerWeek * 100),
          pricePerMonth: Math.round(formData.pricePerMonth * 100),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Lövhə uğurla yerləşdirildi!');
        setTimeout(() => {
          window.location.href = `/boards/${data.board.id}`;
        }, 1000);
      } else {
        toast.error(data.error || 'Lövhə yerləşdirilmədi');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Lövhə yerləşdirilmədi');
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const ToastContainer = toast.ToastContainer;

  return (
    <>
      <ToastContainer />
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

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/boards"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  Lövhələr
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  Panelim
                </Link>
                <div className="flex items-center gap-3 pl-3 ml-2 border-l border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg font-semibold transition-all"
                  >
                    Çıxış
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-indigo-50 transition-all"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-indigo-100 animate-in slide-in-from-top">
                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">{user.name}</span>
                  </div>
                  <Link
                    href="/boards"
                    className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📋 Lövhələr
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🏠 Panelim
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg font-semibold transition-all"
                  >
                    🚪 Çıxış
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                🎯 Yeni Elan Yarat
              </h2>
              <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                Reklam lövhənizi yerləşdirin və minlərlə potensial müştəriyə çatın
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress indicator */}
          <div className="mb-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Tamamlanma</span>
                <span className="text-sm font-bold text-indigo-600">{calculateProgress()}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between">
              {[
                { num: 1, title: 'Əsas Məlumat', icon: '📝' },
                { num: 2, title: 'Ünvan & Şəkillər', icon: '📍' },
                { num: 3, title: 'Qiymət & Əlaqə', icon: '💰' }
              ].map((item, index) => (
                <div key={item.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all duration-300 ${
                      step >= item.num
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-110'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step > item.num ? '✓' : item.icon}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium text-center transition-colors ${
                      step >= item.num ? 'text-indigo-600' : 'text-gray-500'
                    }`}>
                      {item.title}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`h-1 w-full mx-2 rounded-full transition-all duration-500 ${
                      step > item.num ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-2xl">
                  📝
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Əsas Məlumat</h3>
                  <p className="text-sm text-gray-500">Lövhəniz haqqında əsas məlumatları daxil edin</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lövhə Başlığı *</label>
                  <input
                    type="text"
                    required
                    minLength={10}
                    maxLength={100}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="məs., Ana Yolda Premium Bilbord"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">Minimum 10 simvol</p>
                    <p className={`text-xs ${formData.title.length > 100 ? 'text-red-500' : formData.title.length > 80 ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {formData.title.length}/100
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Təsvir *</label>
                  <textarea
                    required
                    minLength={30}
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Reklam lövhənizi, görünməsini, trafiki və xüsusi xüsusiyyətlərini təsvir edin..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-xs ${formData.description.length < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {formData.description.length < 30 ? `Daha ${30 - formData.description.length} simvol lazımdır` : '✓ Kifayət qədər məlumat'}
                    </p>
                    <p className={`text-xs ${formData.description.length > 500 ? 'text-red-500' : formData.description.length > 450 ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {formData.description.length}/500
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📏 En (metr) *</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="0"
                      value={formData.width || ''}
                      onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all bg-white"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📐 Hündürlük (metr) *</label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      min="0"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all bg-white"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                {formData.width > 0 && formData.height > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-800">
                      ✓ Ölçü: <span className="font-bold">{formData.width}m × {formData.height}m</span> ({(formData.width * formData.height).toFixed(2)} m²)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lövhə Növü *</label>
                  <select
                    required
                    value={formData.boardType}
                    onChange={(e) => setFormData({ ...formData, boardType: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all bg-white"
                  >
                    <option value="">Növ seçin</option>
                    {BOARD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {formData.boardType && (
                    <p className="text-xs text-gray-500 mt-1">
                      {BOARD_TYPES.find(t => t.value === formData.boardType)?.description}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const isValid = formData.title && formData.description && formData.width > 0 && formData.height > 0 && formData.boardType;
                  if (isValid) {
                    setStep(2);
                  } else {
                    toast.warning('Zəhmət olmasa bütün məcburi sahələri doldurun');
                  }
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Növbəti: Ünvan və Şəkillər →
              </button>
            </div>
          )}

          {/* Step 2: Location & Images */}
          {step === 2 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-2xl">
                  📍
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Ünvan və Şəkillər</h3>
                  <p className="text-sm text-gray-500">Lövhənizin yeri və şəkilləri</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* City/District Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">🏙️ Şəhər / Rayon *</label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all bg-white"
                  >
                    <option value="">Şəhər və ya rayon seçin</option>
                    {AZERBAIJAN_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Azərbaycanda yerləşən bütün şəhər və rayonlar
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">📌 Xəritədə Dəqiq Ünvan *</label>
                  <p className="text-xs text-gray-500 mb-3">
                    {formData.city
                      ? `${formData.city} şəhəri üçün xəritədə dəqiq məkanı seçin`
                      : 'Əvvəlcə şəhər seçin, sonra xəritədə dəqiq məkanı göstərin'}
                  </p>
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLat={formData.latitude}
                    initialLng={formData.longitude}
                    key={`${formData.latitude}-${formData.longitude}`}
                  />
                  {formData.address && (
                    <div className="mt-3 bg-white rounded-lg p-3 border border-indigo-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Seçilmiş ünvan:</span> {formData.address}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">📸 Şəkillər Yüklə *</label>
                  <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 hover:border-indigo-500 transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-gray-700"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer block text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm text-gray-600 font-medium">Şəkilləri buraya sürüşdürün və ya seçin</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG (max. 10MB)</p>
                    </label>
                  </div>

                  {uploading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      <p className="text-sm font-medium">Şəkillər yüklənir...</p>
                    </div>
                  )}

                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        ✓ {formData.images.length} şəkil yükləndi
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Şəkil ${idx + 1}`}
                              className="w-full h-28 object-cover rounded-xl border-2 border-gray-200 group-hover:border-indigo-400 transition-all"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all flex items-center justify-center">
                              <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                #{idx + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  ← Geri
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.images.length === 0) {
                      toast.warning('Ən azı bir şəkil yükləyin');
                      return;
                    }
                    if (!formData.city) {
                      toast.warning('Şəhər seçin');
                      return;
                    }
                    if (!formData.address) {
                      toast.warning('Xəritədə məkanı seçin');
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Növbəti: Qiymətlər →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Contact */}
          {step === 3 && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Qiymət və Əlaqə</h3>
                  <p className="text-sm text-gray-500">Qiymətləri müəyyənləşdirin və əlaqə məlumatlarını daxil edin</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Pricing Cards */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Qiymət Paketləri</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                      <div className="text-2xl mb-2">📅</div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Günlük Qiymət *</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.pricePerDay || ''}
                          onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all bg-white"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₼</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                      <div className="text-2xl mb-2">📆</div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Həftəlik Qiymət *</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.pricePerWeek || ''}
                          onChange={(e) => setFormData({ ...formData, pricePerWeek: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all bg-white"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₼</span>
                      </div>
                      {formData.pricePerDay > 0 && formData.pricePerWeek > 0 && (
                        <p className="text-xs text-blue-700 mt-2">
                          {((formData.pricePerWeek / (formData.pricePerDay * 7)) * 100 - 100).toFixed(0)}% endirim
                        </p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
                      <div className="text-2xl mb-2">🗓️</div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Aylıq Qiymət *</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.pricePerMonth || ''}
                          onChange={(e) => setFormData({ ...formData, pricePerMonth: parseFloat(e.target.value) })}
                          className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all bg-white"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₼</span>
                      </div>
                      {formData.pricePerDay > 0 && formData.pricePerMonth > 0 && (
                        <p className="text-xs text-purple-700 mt-2">
                          {((formData.pricePerMonth / (formData.pricePerDay * 30)) * 100 - 100).toFixed(0)}% endirim
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                  <p className="text-sm font-semibold text-gray-700 mb-4">👤 Əlaqə Məlumatları</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ad və Soyad *</label>
                      <input
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all bg-white"
                        placeholder="Ad Soyad"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">📧 E-poçt *</label>
                        <input
                          type="email"
                          required
                          value={formData.ownerEmail}
                          onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all bg-white"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">📱 Telefon</label>
                        <input
                          type="tel"
                          value={formData.ownerPhone}
                          onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all bg-white"
                          placeholder="+994 XX XXX XX XX"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                {formData.title && formData.pricePerDay > 0 && (
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white">
                    <h4 className="text-lg font-bold mb-4">📋 Elanın Xülasəsi</h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-indigo-200 mb-1">Başlıq</p>
                        <p className="font-semibold">{formData.title}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-indigo-200 mb-1">Ölçü</p>
                        <p className="font-semibold">{formData.width}m × {formData.height}m</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-indigo-200 mb-1">Ünvan</p>
                        <p className="font-semibold">{formData.city}, {formData.country}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-indigo-200 mb-1">Şəkillər</p>
                        <p className="font-semibold">{formData.images.length} şəkil</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Geri
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Yerləşdirilir...
                    </span>
                  ) : (
                    <span>✓ Elanı Yerləşdir</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
    </>
  );
}
