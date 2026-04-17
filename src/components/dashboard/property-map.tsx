"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

type MapProperty = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
};

const PIN_COLORS: Record<string, { bg: string; glyph: string }> = {
  INDUSTRIAL: { bg: "#f59e0b", glyph: "#78350f" },
  RETAIL:     { bg: "#ef4444", glyph: "#7f1d1d" },
  OFICINA:    { bg: "#3b82f6", glyph: "#1e3a5f" },
  BODEGA:     { bg: "#8b5cf6", glyph: "#3b0764" },
  MIXTO:      { bg: "#10b981", glyph: "#064e3b" },
  OTRO:       { bg: "#6b7280", glyph: "#1f2937" },
};

export function PropertyMap({ properties }: { properties: MapProperty[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const withCoords = properties.filter(p => p.lat && p.lng);

  const center =
    withCoords.length > 0
      ? { lat: withCoords[0].lat, lng: withCoords[0].lng }
      : { lat: 19.4326, lng: -99.1332 };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="colliers360-portfolio"
        defaultCenter={center}
        defaultZoom={5}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full rounded-lg"
      >
        {withCoords.map(p => {
          const colors = PIN_COLORS[p.type] ?? PIN_COLORS.OTRO;
          return (
            <AdvancedMarker key={p.id} position={{ lat: p.lat, lng: p.lng }} title={p.name}>
              <Pin background={colors.bg} glyphColor={colors.glyph} borderColor={colors.glyph} />
            </AdvancedMarker>
          );
        })}
      </Map>
    </APIProvider>
  );
}
