export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  description: string;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  precipitationProbability: number;
}

export interface WeatherData {
  location: LocationData;
  current: CurrentWeather;
  daily: DailyForecast[];
}
