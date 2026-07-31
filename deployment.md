# Deployment Guide

This application is designed to be easily deployed to containerized environments like Google Cloud Run, Docker, or any standard Node.js hosting provider.

## Build Process

The application utilizes a unified build process that handles both the frontend and backend.

To build the application for production, run:
```bash
npm run build
```

This command executes two steps:
1. `vite build`: Compiles the React frontend into static HTML, CSS, and JS files placed in the `dist/` directory.
2. `esbuild`: Bundles the Express backend (`server.ts`) into a single CommonJS file (`dist/server.cjs`), keeping external Node modules out of the bundle.

## Running in Production

After the build process is complete, you can start the production server:

```bash
npm run start
```
This executes `node dist/server.cjs`.

### Environment Variables

Before deploying, ensure the following environment variables are securely configured in your hosting environment:

- `GEMINI_API_KEY`: (Required) Your Google Gemini API key.
- `NODE_ENV`: Should be set to `production` (usually handled automatically by deployment platforms).
- `PORT`: The port the server should listen on. The code is configured to default to `3000` and binds to `0.0.0.0` for container compatibility.

## Docker Deployment (Example)

To deploy using Docker, you can use a standard Node.js `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

## Considerations
- **Stateless Server:** The Express server is entirely stateless, making it safe to horizontally scale across multiple instances.
- **Static Assets:** The production server automatically serves the built Vite assets from the `dist` folder.
