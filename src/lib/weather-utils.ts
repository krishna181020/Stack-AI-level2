import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudRain, 
  CloudDrizzle,
  CloudLightning,
  Snowflake
} from 'lucide-react';

export function getWeatherDescription(code: number): string {
  switch (code) {
    case 0: return 'Clear sky';
    case 1: return 'Mainly clear';
    case 2: return 'Partly cloudy';
    case 3: return 'Overcast';
    case 45:
    case 48: return 'Fog';
    case 51:
    case 53:
    case 55: return 'Drizzle';
    case 56:
    case 57: return 'Freezing Drizzle';
    case 61:
    case 63:
    case 65: return 'Rain';
    case 66:
    case 67: return 'Freezing Rain';
    case 71:
    case 73:
    case 75: return 'Snow fall';
    case 77: return 'Snow grains';
    case 80:
    case 81:
    case 82: return 'Rain showers';
    case 85:
    case 86: return 'Snow showers';
    case 95: return 'Thunderstorm';
    case 96:
    case 99: return 'Thunderstorm with hail';
    default: return 'Unknown';
  }
}

export function getWeatherIcon(code: number, className: string = "") {
  if (code === 0 || code === 1) return Sun;
  if (code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 67) return CloudRain;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 71 && code <= 77) return Snowflake;
  if (code === 85 || code === 86) return Snowflake;
  if (code >= 95 && code <= 99) return CloudLightning;
  return Sun;
}
