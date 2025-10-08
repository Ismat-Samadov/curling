'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Board {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  pricePerDay: number;
  thumbnailImage: string;
}

interface MapViewProps {
  boards: Board[];
  onBoardClick?: (boardId: number) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapView({ boards, onBoardClick, center = [40.7128, -74.0060], zoom = 12 }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each board
    boards.forEach((board) => {
      const marker = L.marker([board.latitude, board.longitude]).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <img src="${board.thumbnailImage}" alt="${board.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${board.title}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${board.address}</p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #4f46e5;">${(board.pricePerDay / 100).toFixed(2)} ₼/gün</p>
        </div>
      `);

      if (onBoardClick) {
        marker.on('click', () => onBoardClick(board.id));
      }
    });

    // Fit bounds to show all markers if there are any
    if (boards.length > 0) {
      const bounds = L.latLngBounds(boards.map(b => [b.latitude, b.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [boards, onBoardClick]);

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
