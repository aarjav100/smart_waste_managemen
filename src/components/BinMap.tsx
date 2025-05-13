import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Bin } from '@/types/bin';
import { getStatusColor } from '@/lib/binUtils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface BinMapProps {
  bins: Bin[];
  center?: [number, number];
  zoom?: number;
}

// Fix for default marker icons in Next.js
const markerIcon = L.icon({
  iconUrl: '/marker-icon.png',
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const BinMap: React.FC<BinMapProps> = ({ bins, center = [51.505, -0.09], zoom = 13 }) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-[600px] rounded-lg shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bins.map((bin) => (
        <Marker
          key={bin.id}
          position={[bin.location.lat, bin.location.lng]}
          icon={markerIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold mb-2">Bin #{bin.id}</h3>
              <p className="text-sm text-gray-600">{bin.address}</p>
              <p className={`text-sm font-medium text-${getStatusColor(bin.status)} mt-2`}>
                {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)} ({Math.round(bin.fillLevel)}% full)
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default BinMap; 