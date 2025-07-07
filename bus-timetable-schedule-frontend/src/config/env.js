// Environment configuration utility
const config = {
  // API URLs
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  weatherApiUrl: import.meta.env.VITE_WEATHER_API_URL || 'http://localhost:3000/api/weather',
  arrivalsApiUrl: import.meta.env.VITE_ARRIVALS_API_URL || 'http://localhost:3000/api/arrivals',
  
  // API Keys (when needed)
  weatherApiKey: import.meta.env.VITE_WEATHER_API_KEY || '',
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  transitApiKey: import.meta.env.VITE_TRANSIT_API_KEY || '',
  
  // App configuration
  appName: import.meta.env.VITE_APP_NAME || 'Bus Timetable Schedule',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Development settings
  debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  updateInterval: parseInt(import.meta.env.VITE_UPDATE_INTERVAL) || 5000,
  
  // Environment info
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Validation helper
  validateConfig() {
    const required = ['apiBaseUrl'];
    const missing = required.filter(key => !this[key]);
    
    if (missing.length > 0) {
      console.warn('Missing required environment variables:', missing);
    }
    
    return missing.length === 0;
  }
};

// Validate configuration on import
config.validateConfig();

export default config;
