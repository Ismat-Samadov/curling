'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

// Default to Baku, Azerbaijan coordinates
export default function LocationPicker({ onLocationSelect, initialLat = 40.4093, initialLng = 49.8671 }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState('');

  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || 'Naməlum ünvan';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Naməlum ünvan';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Add click event to place marker
      mapRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;

        // Remove existing marker
        if (markerRef.current) {
          mapRef.current?.removeLayer(markerRef.current);
        }

        // Add new marker
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!);

        // Get address
        const addr = await getAddressFromCoords(lat, lng);
        setAddress(addr);
        onLocationSelect(lat, lng, addr);
      });

      // Add initial marker if coordinates provided
      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng]).addTo(mapRef.current);
        getAddressFromCoords(initialLat, initialLng).then(addr => {
          setAddress(addr);
          onLocationSelect(initialLat, initialLng, addr);
        });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);

            // Remove existing marker
            if (markerRef.current) {
              mapRef.current.removeLayer(markerRef.current);
            }

            // Add new marker
            markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);

            // Get address
            const addr = await getAddressFromCoords(latitude, longitude);
            setAddress(addr);
            onLocationSelect(latitude, longitude, addr);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Məkanınız alınmadı. Xahiş edirik xəritədə klikləyərək məkan seçin.');
        }
      );
    } else {
      alert('Brauzeriniz geolokasiyaya dəstək vermir');
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
      >
        <span className="text-lg">📍</span>
        Cari Mövqeyi İstifadə Et
      </button>
      <div ref={mapContainerRef} style={{ height: '400px', width: '100%' }} className="rounded-xl border-2 border-gray-300 shadow-md" />
      {address && (
        <div className="bg-white rounded-lg p-3 border-2 border-green-200">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-green-700">✓ Seçilmiş:</span> {address}
          </p>
        </div>
      )}
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <span>💡</span>
        <span>Məkan seçmək üçün xəritədə klikləyin</span>
      </p>
    </div>
  );
}
