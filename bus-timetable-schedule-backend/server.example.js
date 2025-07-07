// Example: How to update your server.js to use environment configuration

const express = require('express');
const cors = require('cors');
const config = require('./config/env'); // Import configuration

const app = express();

// CORS configuration using environment variables
app.use(cors({
  origin: config.corsEnabled ? config.allowedOrigins : false,
  credentials: true
}));

app.use(express.json());

// Request logging middleware (conditional)
if (config.enableRequestLogging) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint (conditional)
if (config.healthCheckEnabled) {
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0'
    });
  });
}

// Example API endpoints using configuration
app.get('/api/arrivals', async (req, res) => {
  try {
    // Use configured API URL and key
    const response = await fetch(`${config.gtfsApiBaseUrl}/arrivals`, {
      headers: {
        'Ocp-Apim-Subscription-Key': config.gtfsApiKey,
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching arrivals:', error);
    res.status(500).json({ error: 'Failed to fetch arrivals' });
  }
});

app.get('/api/weather', async (req, res) => {
  try {
    // Use configured weather API
    const response = await fetch(
      `${config.weatherApiBaseUrl}/current.json?key=${config.weatherApiKey}&q=Auckland&aqi=no`
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// Start server with configuration
app.listen(config.port, config.host, () => {
  console.log(`🚀 Server running on ${config.host}:${config.port}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS enabled: ${config.corsEnabled}`);
  console.log(`📝 Request logging: ${config.enableRequestLogging}`);
  
  if (config.isDevelopment) {
    console.log(`🔧 Frontend URL: ${config.frontendUrl}`);
    console.log(`⚡ Debug mode enabled`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
