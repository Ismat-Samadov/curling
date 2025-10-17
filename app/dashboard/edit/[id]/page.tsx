'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

export default function EditBoardPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: 0,
    longitude: 0,
    address: '',
    city: '',
    country: '',
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
        fetchBoard();
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${params.id}`);
      const data = await response.json();

      if (!data.board) {
        alert('Lövhə tapılmadı');
        router.push('/dashboard');
        return;
      }

      const board = data.board;
      setFormData({
        title: board.title,
        description: board.description,
        latitude: board.latitude,
        longitude: board.longitude,
        address: board.address,
        city: board.city,
        country: board.country,
        width: board.width,
        height: board.height,
        boardType: board.boardType,
        images: board.images || [],
        thumbnailImage: board.thumbnailImage || '',
        pricePerDay: board.pricePerDay / 100,
        pricePerWeek: board.pricePerWeek / 100,
        pricePerMonth: board.pricePerMonth / 100,
        ownerName: board.ownerName,
        ownerEmail: board.ownerEmail,
        ownerPhone: board.ownerPhone,
      });
    } catch (error) {
      console.error('Error fetching board:', error);
      alert('Lövhə yüklənmədi');
      router.push('/dashboard');
    } finally {
      setLoading(false);
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
      const compressedFiles = await Promise.all(
        Array.from(files).map(file => compressImage(file))
      );

      const uploadFormData = new FormData();
      compressedFiles.forEach(file => {
        uploadFormData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...data.urls],
          thumbnailImage: prev.thumbnailImage || data.urls[0],
        }));
      } else {
        alert(`Şəkillər yüklənmədi: ${data.error || 'Naməlum xəta'}`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Şəkillər yüklənmədi');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!confirm('Bu şəkli silmək istədiyinizdən əminsiniz?')) {
      return;
    }

    try {
      const response = await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => img !== imageUrl),
          thumbnailImage: prev.thumbnailImage === imageUrl ? prev.images.find(img => img !== imageUrl) || '' : prev.thumbnailImage,
        }));
      } else {
        alert(`Şəkil silinmədi: ${data.error || 'Naməlum xəta'}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Şəkil silinmədi');
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

    if (submitting) return;
    setSubmitting(true);

    try {
      const response = await fetch(`/api/boards/${params.id}/update`, {
        method: 'PUT',
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
        alert('Lövhə uğurla yeniləndi!');
        router.push('/dashboard');
      } else {
        alert(data.error || 'Lövhə yenilənmədi');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error updating board:', error);
      alert('Lövhə yenilənmədi');
      setSubmitting(false);
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
              <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">reklamyeri.az</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/boards" className="text-gray-700 hover:text-indigo-600">
                Lövhələr
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Paneliniz
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            &larr; Panelə qayıt
          </Link>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Lövhəni Redaktə Et</h2>
        <p className="text-gray-600 mb-8">Lövhənizin məlumatlarını yeniləyin</p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lövhə Başlığı *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Təsvir *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">En (metr) *</label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.width || ''}
                onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hündürlük (metr) *</label>
              <input
                type="number"
                required
                step="0.1"
                value={formData.height || ''}
                onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lövhə Növü *</label>
            <select
              required
              value={formData.boardType}
              onChange={(e) => setFormData({ ...formData, boardType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            >
              <option value="billboard">Bilbord</option>
              <option value="digital">Rəqəmsal Ekran</option>
              <option value="poster">Poster Lövhəsi</option>
              <option value="wallscape">Divar Lövhəsi</option>
              <option value="transit">Nəqliyyat Reklamı</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şəhər *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ölkə *</label>
            <input
              type="text"
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ünvan *</label>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLat={formData.latitude || undefined}
              initialLng={formData.longitude || undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Əlavə Şəkillər</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
            {uploading && <p className="text-sm text-gray-500 mt-2">Şəkillər yüklənir...</p>}
            {formData.images.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Şəkil ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Şəkli sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Qiymət (₼) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.pricePerDay || ''}
                onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Həftəlik Qiymət (₼) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.pricePerWeek || ''}
                onChange={(e) => setFormData({ ...formData, pricePerWeek: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aylıq Qiymət (₼) *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.pricePerMonth || ''}
                onChange={(e) => setFormData({ ...formData, pricePerMonth: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adınız *</label>
            <input
              type="text"
              required
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-poçt *</label>
            <input
              type="email"
              required
              value={formData.ownerEmail}
              onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={formData.ownerPhone}
              onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Link
              href="/dashboard"
              className="flex-1 text-center bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Ləğv et
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-300"
            >
              {submitting ? 'Yenilənir...' : 'Dəyişiklikləri Yadda Saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
