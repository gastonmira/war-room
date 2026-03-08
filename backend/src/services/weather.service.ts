import axios from 'axios';
import { WeatherData } from '../../../contracts/api.types';

interface LocationConfig {
  location: string;
  coords: [number, number];
}

const LOCATIONS: LocationConfig[] = [
  { location: 'TEHRAN', coords: [35.6892, 51.3890] },
  { location: 'BAGHDAD', coords: [33.3128, 44.3615] },
  { location: 'DAMASCUS', coords: [33.5138, 36.2765] },
  { location: 'JERUSALEM', coords: [31.7683, 35.2137] },
  { location: 'RIYADH', coords: [24.7136, 46.6753] },
  { location: 'DUBAI', coords: [25.2048, 55.2708] },
];

function mapWeatherCode(code: number): WeatherData['condition'] {
  if (code === 0 || code === 1) return 'clear';
  if (code >= 2 && code <= 3) return 'cloudy';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'sand';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'sand';
  if (code >= 95 && code <= 99) return 'sand';
  return 'clear';
}

const lastKnown: Record<string, WeatherData> = {};

async function fetchLocation(config: LocationConfig): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${config.coords[0]}&longitude=${config.coords[1]}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,visibility,weather_code&wind_speed_unit=kmh`;
    const response = await axios.get(url, { timeout: 10000 });

    const current = response.data?.current;
    if (!current) throw new Error(`No current data for ${config.location}`);

    const result: WeatherData = {
      location: config.location,
      coords: config.coords,
      temperature: Math.round(current.temperature_2m ?? 0),
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      windDirection: current.wind_direction_10m ?? 0,
      visibility: Math.round((current.visibility ?? 10000) / 1000),
      condition: mapWeatherCode(current.weather_code ?? 0),
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      updatedAt: new Date().toISOString(),
    };

    lastKnown[config.location] = result;
    return result;
  } catch (err) {
    console.warn(`[Weather] Failed to fetch ${config.location}:`, (err as Error).message);
    if (lastKnown[config.location]) {
      return lastKnown[config.location];
    }
    return {
      location: config.location,
      coords: config.coords,
      temperature: 0,
      windSpeed: 0,
      windDirection: 0,
      visibility: 10,
      condition: 'clear',
      humidity: 0,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function fetchWeather(): Promise<WeatherData[]> {
  return Promise.all(LOCATIONS.map(fetchLocation));
}
