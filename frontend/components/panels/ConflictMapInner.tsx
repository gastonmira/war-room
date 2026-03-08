'use client';

// components/panels/ConflictMapInner.tsx
// Client-only Leaflet map — imported via dynamic() with ssr:false

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Circle, Tooltip, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { WeatherData } from '../../lib/types';

interface Zone {
  name: string;
  coords: [number, number];
  status: 'breaking' | 'developing' | 'background';
  radiusKm: number;
}

interface Props {
  weather?: WeatherData[];
}

const CONFLICT_ZONES: Zone[] = [
  { name: 'GAZA STRIP',       coords: [31.35, 34.45], status: 'breaking',   radiusKm: 25  },
  { name: 'S. LEBANON',       coords: [33.3,  35.5 ], status: 'breaking',   radiusKm: 40  },
  { name: 'WESTERN YEMEN',    coords: [15.5,  43.5 ], status: 'developing', radiusKm: 150 },
  { name: 'NE SYRIA',         coords: [36.5,  40.5 ], status: 'developing', radiusKm: 90  },
  { name: 'IRAN-IRAQ BORDER', coords: [33.5,  46.5 ], status: 'background', radiusKm: 70  },
];

const CARTO_URL =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function pathOptions(status: Zone['status']) {
  switch (status) {
    case 'breaking':
      return {
        color: '#ff0040',
        fillColor: 'rgba(255,0,64,0.12)',
        fillOpacity: 1,
        weight: 1.5,
        dashArray: '5 3',
      };
    case 'developing':
      return {
        color: '#ffaa00',
        fillColor: 'rgba(255,170,0,0.10)',
        fillOpacity: 1,
        weight: 1.5,
        dashArray: '5 3',
      };
    case 'background':
      return {
        color: '#00ff41',
        fillColor: 'rgba(0,255,65,0.06)',
        fillOpacity: 1,
        weight: 1,
        dashArray: undefined,
      };
  }
}

function statusIcon(status: Zone['status']) {
  if (status === 'breaking') return '⚡ ';
  if (status === 'developing') return '▶ ';
  return '· ';
}

function getWeatherIcon(condition: WeatherData['condition']): string {
  switch (condition) {
    case 'clear': return '☀️';
    case 'cloudy': return '☁️';
    case 'rain': return '🌧️';
    case 'dust': return '💨';
    case 'sand': return '🌪️';
    case 'fog': return '🌫️';
    default: return '☀️';
  }
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function createWeatherIcon(weather: WeatherData): L.DivIcon {
  const icon = getWeatherIcon(weather.condition);
  const label = `${weather.temperature}°`;
  
  return L.divIcon({
    className: 'weather-marker',
    html: `<div style="
      background: linear-gradient(180deg, #0f1318 0%, #0a0c0f 100%);
      border: 1px solid #00ff41;
      padding: 3px 6px;
      font-size: 11px;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #00ff41;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
    ">${icon}<span>${label}</span></div>`,
    iconSize: [48, 20],
    iconAnchor: [24, 10],
  });
}

export default function ConflictMapInner({ weather = [] }: Props) {
  const middleEastBounds = L.latLngBounds(
    L.latLng(10, 35),   // Southwest corner
    L.latLng(40, 60)   // Northeast corner
  );

  return (
    <MapContainer
      center={[27.0, 41.0]}
      zoom={5}
      zoomControl={true}
      attributionControl={false}
      dragging={true}
      scrollWheelZoom={true}
      minZoom={4}
      maxZoom={10}
      maxBounds={middleEastBounds}
      maxBoundsViscosity={1.0}
      style={{ width: '100%', height: '100%', background: '#0a0c0f' }}
    >
      <TileLayer url={CARTO_URL} className="ops-tile-layer" />
      {CONFLICT_ZONES.map((zone) => (
        <Circle
          key={zone.name}
          center={zone.coords}
          radius={zone.radiusKm * 1000}
          pathOptions={pathOptions(zone.status)}
        >
          <Tooltip permanent className="ops-zone-tooltip">
            {statusIcon(zone.status)}{zone.name}
          </Tooltip>
        </Circle>
      ))}
      {weather.map((w) => (
        <Marker
          key={w.location}
          position={w.coords}
          icon={createWeatherIcon(w)}
        />
      ))}
    </MapContainer>
  );
}
