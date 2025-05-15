"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

function MapEvents({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const position: [number, number] = [
    latitude || 34.8021, // Default to Syria
    longitude || 38.9968,
  ];

  return (
    <div className="h-[300px] w-full rounded-md border">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapEvents onChange={onChange} />
      </MapContainer>
    </div>
  );
}
