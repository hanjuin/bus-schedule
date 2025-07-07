# Backend Environment Configuration

This backend server uses environment variables for configuration. Follow these steps to set up your environment:

## Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your actual values:**
   ```bash
   # Required API Keys
   GTFS_API_KEY=your_actual_gtfs_api_key
   WEATHER_API_KEY=your_actual_weather_api_key
   
   # Server Configuration
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

## Required Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GTFS_API_KEY` | GTFS API key for transit data | ✅ | `abc123def456` |
| `WEATHER_API_KEY` | Weather API key | ✅ | `xyz789uvw012` |
| `PORT` | Server port | ❌ | `3000` |
| `FRONTEND_URL` | Frontend application URL | ❌ | `http://localhost:5173` |

## Optional Configuration Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment mode | `development` | `production` |
| `HOST` | Server host | `0.0.0.0` | `localhost` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `frontend URL` | `http://localhost:3000,http://app.com` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | `200` |
| `CACHE_TTL_ARRIVALS` | Cache TTL for arrivals (ms) | `30000` | `60000` |
| `LOG_LEVEL` | Logging level | `info` | `debug` |

## API Keys Setup

### 1. GTFS API Key (Auckland Transport)
1. Visit [Auckland Transport Developer Portal](https://dev-portal.at.govt.nz/)
2. Register for an account
3. Create a new application
4. Get your API key
5. Add to `.env`: `GTFS_API_KEY=your_key_here`

### 2. Weather API Key (WeatherAPI.com)
1. Visit [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env`: `WEATHER_API_KEY=your_key_here`

## Configuration Usage in Code

```javascript
const config = require('./config/env');

// Use configuration values
app.listen(config.port, config.host, () => {
  console.log(`Server running on ${config.host}:${config.port}`);
});

// API calls with keys
const response = await fetch(`${config.gtfsApiBaseUrl}/endpoint`, {
  headers: {
    'Ocp-Apim-Subscription-Key': config.gtfsApiKey
  }
});
```

## Environment-Specific Configurations

### Development
- Enable debug logging
- Allow all CORS origins
- Shorter cache TTLs for testing

### Production
- Error-only logging
- Strict CORS origins
- Longer cache TTLs for performance
- Enable metrics and monitoring

## Security Best Practices

- ⚠️ **Never commit `.env` files**
- ✅ Use different API keys for different environments
- 🔒 Rotate API keys regularly
- 🚫 Don't log sensitive environment variables
- ✅ Use HTTPS in production
- 🔐 Set strong CORS policies

## Troubleshooting

### Common Issues

1. **"Missing required environment variables" error:**
   - Check `.env` file exists
   - Verify all required variables are set
   - Ensure no extra spaces around values

2. **CORS errors:**
   - Add frontend URL to `ALLOWED_ORIGINS`
   - Check `CORS_ENABLED=true`
   - Verify frontend URL format

3. **API key errors:**
   - Verify keys are correct and active
   - Check API quota limits
   - Ensure keys have required permissions

4. **Port already in use:**
   - Change `PORT` in `.env`
   - Kill existing processes on the port
   - Use different port for different environments

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

This will show:
- All incoming requests
- API calls to external services
- Cache hits/misses
- Configuration validation warnings
