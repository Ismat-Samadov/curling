'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

export default function AdminPage() {
  const [step, setStep] = useState(1);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
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
      } else {
        alert('Şəkillər yüklənmədi');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Şəkillər yüklənmədi');
    } finally {
      setUploading(false);
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
        alert('Lövhə uğurla yerləşdirildi!');
        window.location.href = `/boards/${data.board.id}`;
      } else {
        alert(data.error || 'Lövhə yerləşdirilmədi');
      }
    } catch (error) {
      console.error('Error creating board:', error);
      alert('Lövhə yerləşdirilmədi');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer">banner.az</h1>
            </Link>
            <Link href="/boards" className="text-gray-700 hover:text-indigo-600">
              Lövhələr
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reklam Lövhənizi Yerləşdirin</h2>
        <p className="text-gray-600 mb-8">Fiziki reklam sahənizi pula çevirməyə başlayın</p>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map(num => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {num}
                </div>
                {num < 3 && <div className={`h-1 w-20 mx-2 ${step > num ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Əsas Məlumat</span>
            <span>Ünvan və Şəkillər</span>
            <span>Qiymət və Əlaqə</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Əsas Məlumat</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lövhə Başlığı *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="məs., Ana Yolda Premium Bilbord"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Təsvir *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Reklam lövhənizi, görünməsini, trafiki və xüsusi xüsusiyyətlərini təsvir edin..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lövhə Növü *</label>
                <select
                  required
                  value={formData.boardType}
                  onChange={(e) => setFormData({ ...formData, boardType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="billboard">Bilbord</option>
                  <option value="digital">Rəqəmsal Ekran</option>
                  <option value="poster">Poster Lövhəsi</option>
                  <option value="wallscape">Divar Lövhəsi</option>
                  <option value="transit">Nəqliyyat Reklamı</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Növbəti: Ünvan və Şəkillər
              </button>
            </div>
          )}

          {/* Step 2: Location & Images */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Ünvan və Şəkillər</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şəhər *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="məs., Bakı"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ölkə *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="məs., Azərbaycan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ünvan *</label>
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şəkil Yüklə *</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {uploading && <p className="text-sm text-gray-500 mt-2">Şəkillər yüklənir...</p>}
                {formData.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {formData.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Şəkil ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={formData.images.length === 0}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-300"
                >
                  Növbəti: Qiymətlər
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Contact */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Qiymət və Əlaqə Məlumatları</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Qiymət (₼) *</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.pricePerDay || ''}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-poçt *</label>
                <input
                  type="email"
                  required
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Lövhəmi Yerləşdir
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
