"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils/format";

/**
 * DarkLeafletMap — a client-only citi-style map picker.
 *
 * react-leaflet requires a real DOM (MapContainer needs window). This is why
 * the map mounts only after hydration: the first client render returns a
 * placeholder, then a mounted state swaps in the real map. markDraggable
 * controls whether the marker follows the last click (selection mode) or the
 * user can drag it (precision mode).
 */

export interface MapPosition {
  lat: number;
  lng: number;
}

interface DarkLeafletMapProps {
  center: MapPosition;
  position: MapPosition | null;
  onChange: (pos: MapPosition) => void;
  markDraggable?: boolean;
  className?: string;
}

function ClickHandler({
  onPick,
}: {
  onPick: (pos: MapPosition) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onPick({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
    },
  });
  return null;
}

function MapMarker({
  position,
  markDraggable,
  onChange,
}: {
  position: MapPosition;
  markDraggable: boolean;
  onChange: (pos: MapPosition) => void;
}) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      draggable={markDraggable}
      eventHandlers={
        markDraggable
          ? {
              dragend: (e) => {
                const m = e.target as L.Marker;
                const { lat, lng } = m.getLatLng();
                onChange({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
              },
            }
          : undefined
      }
    />
  );
}

export default function DarkLeafletMap({
  center,
  position,
  onChange,
  markDraggable = false,
  className,
}: DarkLeafletMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className={cn(
          "grid h-64 w-full place-items-center rounded-xl border border-white/10 bg-white/[0.03] sm:h-72",
          "font-mono text-xs uppercase tracking-widest text-white/35",
          className,
        )}
      >
        Map loads here…
      </div>
    );
  }

  const mapPosition = position ?? center;

  return (
    <div
      className={cn(
        "relative h-64 w-full overflow-hidden rounded-xl border border-white/10 sm:h-72",
        className,
      )}
    >
      <MapContainer
        center={[mapPosition.lat, mapPosition.lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={onChange} />
        <MapMarker
          position={mapPosition}
          markDraggable={markDraggable}
          onChange={onChange}
        />
      </MapContainer>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c0b13]/85 to-transparent p-2.5 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-citi-lavender/70">
          {markDraggable ? "Drag the pin to fine-tune" : "Click the map to place the pin"}
        </span>
      </div>
    </div>
  );
}