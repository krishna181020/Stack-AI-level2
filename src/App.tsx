/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { Search, MapPin, Loader2, Sparkles, Droplets, Thermometer, Calendar, Sun, Cloud, CloudLightning, Locate } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { getWeatherDescription, getWeatherIcon } from './lib/weather-utils';
import type { WeatherData, LocationData, CurrentWeather, DailyForecast } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('San Francisco');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [aiTip, setAiTip] = useState<string>('');
  const [aiClothing, setAiClothing] = useState<string>('');
  const [aiActivity, setAiActivity] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setAiTip('');
    setAiClothing('');
    setAiActivity('');
    
    try {
      // 1. Geocoding
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`City "${query}" not found`);
      }
      
      const location = geoData.results[0];
      const locData: LocationData = {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        admin1: location.admin1
      };
      
      // 2. Weather Forecast
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${locData.latitude}&longitude=${locData.longitude}&current=temperature_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
      );
      
      if (!weatherRes.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const wData = await weatherRes.json();
      
      const current: CurrentWeather = {
        temperature: wData.current.temperature_2m,
        feelsLike: wData.current.apparent_temperature,
        weatherCode: wData.current.weather_code,
        description: getWeatherDescription(wData.current.weather_code)
      };
      
      const daily: DailyForecast[] = wData.daily.time.map((time: string, index: number) => ({
        date: time,
        maxTemp: wData.daily.temperature_2m_max[index],
        minTemp: wData.daily.temperature_2m_min[index],
        weatherCode: wData.daily.weather_code[index],
        precipitationProbability: wData.daily.precipitation_probability_max[index]
      }));
      
      const fullWeatherData: WeatherData = { location: locData, current, daily };
      setWeatherData(fullWeatherData);
      
      // 3. Fetch AI Tip
      fetchAiTip(fullWeatherData);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiTip = async (data: WeatherData) => {
    try {
      const res = await fetch('/api/weather-tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weatherData: data })
      });
      
      if (res.ok) {
        const { tip, clothing, activity } = await res.json();
        setAiTip(tip);
        setAiClothing(clothing);
        setAiActivity(activity);
      } else {
        setAiTip("I couldn't generate a tip right now. Enjoy the weather!");
      }
    } catch (err) {
      console.error('Error fetching AI tip:', err);
      setAiTip("I couldn't generate a tip right now. Enjoy the weather!");
    }
  };

  useEffect(() => {
    fetchWeather(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    setLoading(true);
    setError(null);
    setAiTip('');
    setAiClothing('');
    setAiActivity('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          if (revRes.ok) {
            const revData = await revRes.json();
            const cityName = revData.city || revData.locality;
            if (cityName) {
              setSearchQuery(cityName);
              fetchWeather(cityName);
            } else {
              setError("Could not determine city from location.");
              setLoading(false);
            }
          } else {
            setError("Could not determine city from location.");
            setLoading(false);
          }
        } catch (e) {
          setError("Failed to get location data.");
          setLoading(false);
        }
      },
      (err) => {
        setError("Location access denied or failed. Please enable location services.");
        setLoading(false);
      }
    );
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchWeather(searchQuery);
  };

  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.current.weatherCode) : Sun;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:inline text-xl font-bold tracking-tight text-slate-800 uppercase italic">
              Intelligent<span className="text-blue-500">Weather</span>
            </span>
          </div>
          
          <div className="flex-1 max-w-lg flex flex-col items-end gap-2 relative">
            <form onSubmit={handleSearch} className="w-full relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                className="w-full bg-white border border-slate-300 rounded-full py-2.5 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                placeholder="Search city (e.g. London, Tokyo)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (error) setError(null);
                }}
              />
              <button
                type="button"
                onClick={handleCurrentLocation}
                title="Use Current Location"
                className="absolute inset-y-0 right-2 flex items-center justify-center w-10 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Locate className="h-5 w-5" />
              </button>
              <button type="submit" className="hidden">Search</button>
            </form>
            {error && weatherData && (
              <div className="absolute top-full mt-2 right-0 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm shadow-lg z-20 flex items-center gap-2">
                <CloudLightning className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Pins:</span>
              {['New York', 'London', 'Tokyo', 'Sydney'].map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSearchQuery(city);
                    fetchWeather(city);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/60 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-medium text-slate-600 hover:text-blue-600 rounded-full transition-all shadow-sm"
                >
                  <MapPin className="w-3 h-3" />
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        {loading && !weatherData ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="font-medium animate-pulse">Gathering weather data...</p>
          </div>
        ) : error && !weatherData ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 flex flex-col items-center justify-center h-64 gap-3 text-center">
            <CloudLightning className="w-10 h-10 text-red-500" />
            <p className="font-semibold text-lg">{error}</p>
            <p className="text-sm opacity-80">Try searching for a different city.</p>
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* Current Weather Card */}
            <div className="lg:col-span-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 relative overflow-hidden shadow-xl flex flex-col text-white">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex-1 flex flex-col">
                <h2 className="text-3xl font-bold">{weatherData.location.name}</h2>
                <p className="text-blue-100 opacity-80 mt-1">
                  {weatherData.location.country || weatherData.location.admin1} • {format(new Date(), 'EEEE, MMM d')}
                </p>
                
                <div className="mt-12 flex items-baseline gap-2">
                  <span className="text-8xl font-black">{Math.round(weatherData.current.temperature)}°</span>
                  <span className="text-2xl text-blue-200">C</span>
                </div>
                
                <div className="mt-4 flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1">
                    <WeatherIcon className="w-4 h-4" />
                    {weatherData.current.description}
                  </div>
                  <span className="text-sm text-blue-100">Feels like {Math.round(weatherData.current.feelsLike)}°</span>
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <div className="bg-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-blue-200 mb-1">Smart Clothing Suggestion</p>
                    {aiClothing ? (
                      <p className="text-sm font-medium leading-tight">{aiClothing}</p>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-200 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-blue-200 mb-1">Ideal Activity</p>
                    {aiActivity ? (
                      <p className="text-sm font-medium leading-tight">{aiActivity}</p>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-200 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-blue-200">Precipitation</p>
                      <p className="text-xl font-bold">{weatherData.daily[0].precipitationProbability}%</p>
                    </div>
                    <div className="bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/10">
                      <p className="text-[10px] uppercase tracking-wider text-blue-200">Condition</p>
                      <div className="text-lg font-bold mt-0.5">
                        <WeatherIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* AI Planning Recommendation Card */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Intelligence</span>
                </div>
                <div>
                  {aiTip ? (
                    <>
                      <h3 className="text-lg font-bold text-slate-900">Daily Recommendation</h3>
                      <p className="text-sm text-slate-600 mt-1">{aiTip}</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating insight...
                    </div>
                  )}
                </div>
              </div>

              {/* 7-Day Forecast Chart */}
              <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 sm:p-8 flex flex-col">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">7-Day Temperature Forecast</h3>
                    <p className="text-sm text-slate-500">Expected variations for the week ahead</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-slate-500">Highs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <span className="text-xs text-slate-500">Lows</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={weatherData.daily}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => format(parseISO(str), 'EEE')} 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(val) => `${val}°`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', color: '#0f172a', fontWeight: 500 }}
                        itemStyle={{ color: '#0f172a' }}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                        labelFormatter={(label) => format(parseISO(label), 'EEEE, MMM d')}
                        formatter={(value: number, name: string) => [
                          `${Math.round(value)}°`, 
                          name === 'maxTemp' ? 'High' : 'Low'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="maxTemp" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorMax)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="minTemp" 
                        stroke="#94a3b8" 
                        strokeWidth={3}
                        fill="none" 
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#64748b' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Daily Forecast List Minimal */}
                <div className="mt-8 grid grid-cols-7 gap-2 border-t border-slate-200 pt-6">
                  {weatherData.daily.map((day, i) => {
                    const DayIcon = getWeatherIcon(day.weatherCode);
                    return (
                      <div key={day.date} className={`text-center flex flex-col items-center ${i !== 0 ? 'border-l border-slate-200' : ''}`}>
                        <p className="text-[10px] text-slate-500 mb-2 font-medium uppercase tracking-wider">{i === 0 ? 'TDY' : format(parseISO(day.date), 'EEE')}</p>
                        <div className="flex justify-center mb-2">
                          <DayIcon className="w-5 h-5 text-slate-500" />
                        </div>
                        <p className="text-slate-800 font-bold">{Math.round(day.maxTemp)}°</p>
                        <p className="text-[10px] text-slate-500">{Math.round(day.minTemp)}°</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
