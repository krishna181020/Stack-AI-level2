import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini weather recommendations
  app.post("/api/weather-tips", async (req, res) => {
    try {
      const { weatherData } = req.body;
      if (!weatherData) {
        return res.status(400).json({ error: "Weather data is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
         return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a helpful AI weather and history assistant. Based on the following 7-day weather forecast data and the location, provide:
1. A short, simple, and automated daily planning tip for today based dynamically on the weather. For example, "High chance of rain today—bring an umbrella!" or "It's warm and sunny—go out and have a good outside day today!". Keep it under 2 sentences.
2. A very brief clothing or gear recommendation for the current weather (e.g. "Light jacket and sunglasses", "Heavy coat and gloves", "T-shirt and shorts").
3. A very brief ideal activity for today's weather (e.g. "Perfect for a park walk", "Great day for reading indoors").
4. A fascinating historical event that happened on today's date in or around the city of ${weatherData.location?.name || "this location"}. Keep it to one interesting sentence.

Weather data:
${JSON.stringify(weatherData)}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are a helpful and concise weather and history assistant. Always respond in JSON format.",
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    tip: { type: "STRING" },
                    clothing: { type: "STRING" },
                    activity: { type: "STRING" },
                    historicalEvent: { type: "STRING" }
                },
                required: ["tip", "clothing", "activity", "historicalEvent"]
            }
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);

      res.json({ tip: result.tip, clothing: result.clothing, activity: result.activity, historicalEvent: result.historicalEvent });
    } catch (error) {
      console.error("Error generating tips:", error);
      res.status(500).json({ error: "Failed to generate tips" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
