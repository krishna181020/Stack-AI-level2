# AI Weather & Insights Dashboard

A modern, full-stack weather application that provides real-time weather data and uses AI to generate personalized daily insights, clothing recommendations, activity suggestions, and historical facts based on your location and current weather conditions.

## Features

- **Real-time Weather:** Fetches current weather and 7-day forecasts using the Open-Meteo API.
- **AI-Powered Insights:** Uses Google's Gemini AI to provide actionable daily tips, smart clothing suggestions, ideal activities, and interesting historical events for the searched city.
- **Interactive Visualizations:** Includes an interactive 7-day temperature forecast chart using Recharts.
- **Responsive Design:** Beautiful, dynamic user interface built with Tailwind CSS.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Recharts
- **Backend:** Node.js, Express
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Weather Data:** Open-Meteo API

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Google Gemini API Key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory based on `.env.example` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.
