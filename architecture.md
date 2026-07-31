# Architecture Overview

This application follows a full-stack architecture using a React frontend and an Express backend, bundled together via Vite.

## High-Level System Architecture

1. **Client (Browser):** A React Single Page Application (SPA) that handles user interactions, location searching, and data visualization.
2. **Server (Express Backend):** A Node.js backend responsible for securely proxying requests to external AI services.
3. **External APIs:**
   - **Open-Meteo API:** Called directly from the client to retrieve fast, free weather forecast data without requiring an API key.
   - **Gemini API:** Called exclusively from the backend to ensure the `GEMINI_API_KEY` remains secure and is never exposed to the client.

## Component Breakdown

### Frontend (`/src`)
- **`App.tsx`:** The main orchestrator component. It manages the global state (current location, weather data, AI tips), handles the search form submission, and renders the dashboard UI.
- **`types.ts`:** Contains TypeScript interfaces for the weather data and forecast structures.
- **`lib/weather-utils.ts`:** Utility functions for mapping Open-Meteo weather codes to human-readable descriptions and Lucide React icons.
- **Styling:** Tailwind CSS is used globally for responsive, utility-first styling.

### Backend (`/server.ts`)
- The Express server provides a single API endpoint: `/api/ai-tips`.
- **`/api/ai-tips`:** Receives the current weather data and location from the client, constructs a structured prompt, and queries the `gemini-2.5-flash` model. It strictly enforces a JSON response schema to reliably extract a daily tip, clothing recommendation, ideal activity, and historical event.
- **Vite Middleware:** In development mode (`NODE_ENV !== "production"`), the server dynamically injects Vite's middleware to serve the React frontend with Hot Module Replacement (HMR). In production, it serves the static files built in the `dist` directory.

## Data Flow (AI Insights)
1. User enters a city name or uses geolocation.
2. Frontend fetches coordinates, then fetches weather data from Open-Meteo.
3. Frontend sends the weather data and location name to `/api/ai-tips`.
4. Backend constructs a prompt and calls the Gemini API.
5. Gemini responds with a structured JSON object.
6. Backend forwards the JSON to the frontend.
7. Frontend updates the UI with the new AI insights and historical facts.
