"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PublicComplaint } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/state/complaint-status";
import { PRIORITY_LABELS } from "@/lib/priority/engine";
import { formatShortDate, timeAgo } from "@/lib/utils/format";

/**
 * ExploreMapInner — connects react-leaflet to the public dataset.
 * Loaded only via dynamic(..., { ssr: false }) from ExploreMap.
 * Every point is perimeter-rounded (see roundPosition) so no exact
 * reporting location is ever rendered publicly.
 */

const CATEGORY_COLORS: Record<string, string> = {
  ROADS: "#f59e0b",
  WASTE: "#84cc16",
  STREETLIGHTS: "#22d3ee",
  WATER: "#38bdf8",
  DRAINAGE: "#a78bfa",
  FOOTPATH: "#f472b6",
  OTHER: "#94a3b8",
};

export default function ExploreMapInner({
  complaints,
}: {
  complaints: PublicComplaint[];
}) {
  if (complaints.length === 0) {
    return (
      <div className="grid h-full w-full place-items-center bg-citi-black font-mono text-xs uppercase tracking-widest text-white/35">
        No complaints to place on the map
      </div>
    );
  }

  const latSum = complaints.reduce((sum, c) => sum + c.latitude, 0);
  const lngSum = complaints.reduce((sum, c) => sum + c.longitude, 0);
  const center: [number, number] = [
    latSum / complaints.length,
    lngSum / complaints.length,
  ];

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {complaints.map((c) => {
        const color = CATEGORY_COLORS[c.category] ?? "#94a3b8";
        return (
          <CircleMarker
            key={c.id}
            center={[c.latitude, c.longitude]}
            radius={6}
            pathOptions={{
              color,
              weight: 1,
              fillColor: color,
              fillOpacity: 0.5,
            }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1.5 font-sans text-[12px] leading-snug">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-citi-lavender">
                    {c.complaint_number}
                  </span>
                  <span className="font-mono text-[9px] uppercase text-white/40">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p className="font-medium text-white">{c.location_label}</p>
                <p className="text-white/55">
                  {STATUS_LABELS[c.status]} · {PRIORITY_LABELS[c.priority]} priority
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/30">
                  Shared {formatShortDate(c.created_at)} · Reporter: Anonymous
                </p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}