"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

// Leaflet's default marker icons resolve to CDN-relative paths that break under
// Next.js bundling. The PNGs are copied into public/leaflet/ (see package's
// node_modules/leaflet/dist/images/) so they're served locally, no CDN needed.
const ownIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Leaflet ships no grey marker variant — reuse the same icon and mute it via
// CSS instead of depending on a third-party asset for the context pins.
const contextIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [22, 36],
  iconAnchor: [11, 36],
  shadowSize: [36, 36],
  className: "opacity-50 grayscale",
});

// Geographic center of Germany — default map view when the quest has no
// positioned station yet (PROJ-7 spec, Tech Design "Karten-Verhalten").
export const GERMANY_CENTER: [number, number] = [51.1657, 10.4515];
export const GERMANY_ZOOM = 6;
export const STATION_ZOOM = 16;

interface ContextPin {
  id: string;
  lat: number;
  lng: number;
}

interface StationMapProps {
  position: { lat: number; lng: number } | null;
  contextPins: ContextPin[];
  center: [number, number];
  zoom: number;
  onPositionChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Recenters the map imperatively when `center`/`zoom` change after mount (e.g.
// "Aktuelle Position verwenden" sets a position after the map already rendered).
function RecenterOnChange({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const prevCenter = useRef(center);

  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      prevCenter.current = center;
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

export function StationMap({ position, contextPins, center, zoom, onPositionChange }: StationMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="w-full h-full rounded-card"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPositionChange={onPositionChange} />
      <RecenterOnChange center={center} zoom={zoom} />
      {contextPins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={contextIcon} interactive={false} />
      ))}
      {position && (
        <Marker
          position={[position.lat, position.lng]}
          icon={ownIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const { lat, lng } = marker.getLatLng();
              onPositionChange(lat, lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
