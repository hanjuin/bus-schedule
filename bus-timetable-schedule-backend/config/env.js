require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',

  // CORS Configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:5173'],

  // API Keys
  gtfsApiKey: process.env.GTFS_API_KEY || '',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  transitApiKey: process.env.TRANSIT_API_KEY || '',

  // External API URLs
  gtfsApiBaseUrl: process.env.GTFS_API_BASE_URL || 'https://api.at.govt.nz/gtfs',
  weatherApiBaseUrl: process.env.WEATHER_API_BASE_URL || 'https://api.weatherapi.com/v1',
  transitRealtimeUrl: process.env.TRANSIT_REALTIME_URL || 'https://api.at.govt.nz/gtfs-rt',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Caching (in milliseconds)
  cacheTtl: {
    arrivals: parseInt(process.env.CACHE_TTL_ARRIVALS) || 30000,    // 30 seconds
    weather: parseInt(process.env.CACHE_TTL_WEATHER) || 600000,    // 10 minutes
    vehicles: parseInt(process.env.CACHE_TTL_VEHICLES) || 15000    // 15 seconds
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true',

  // Database (for future use)
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'bus_schedule',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || ''
  },

  // Security
  corsEnabled: process.env.CORS_ENABLED !== 'false',
  trustProxy: process.env.TRUST_PROXY === 'true',

  // Monitoring
  healthCheckEnabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
  metricsEnabled: process.env.METRICS_ENABLED === 'true',

  // Environment helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Validation
  validate() {
    const requiredEnvVars = [
      'GTFS_API_KEY',
      'WEATHER_API_KEY'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.warn('⚠️  Missing required environment variables:', missing.join(', '));
      console.warn('⚠️  Please check your .env file and ensure all required variables are set.');
      
      if (this.isProduction) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    }

    // Validate API URLs
    const urlFields = ['gtfsApiBaseUrl', 'weatherApiBaseUrl', 'transitRealtimeUrl'];
    urlFields.forEach(field => {
      try {
        new URL(this[field]);
      } catch (error) {
        console.warn(`⚠️  Invalid URL for ${field}:`, this[field]);
      }
    });

    return missing.length === 0;
  }
};

// Validate configuration on import
config.validate();

module.exports = config;
