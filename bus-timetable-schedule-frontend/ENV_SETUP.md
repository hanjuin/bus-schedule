# Environment Configuration

This project uses environment variables for configuration. Follow these steps to set up your environment:

## Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your actual values:**
   ```bash
   # API Configuration
   VITE_API_BASE_URL=http://your-api-server:3000
   VITE_WEATHER_API_URL=http://your-api-server:3000/api/weather
   VITE_ARRIVALS_API_URL=http://your-api-server:3000/api/arrivals
   ```

3. **Add API keys if using external services:**
   ```bash
   # Weather API (if using external service)
   VITE_WEATHER_API_KEY=your_actual_api_key_here
   
   # Google Maps (if needed)
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

## Available Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Base URL for your API server | `http://localhost:3000` | ✅ |
| `VITE_WEATHER_API_URL` | Weather API endpoint | `http://localhost:3000/api/weather` | ✅ |
| `VITE_ARRIVALS_API_URL` | Arrivals API endpoint | `http://localhost:3000/api/arrivals` | ✅ |
| `VITE_WEATHER_API_KEY` | External weather service API key | - | ❌ |
| `VITE_APP_NAME` | Application name | `Bus Timetable Schedule` | ❌ |
| `VITE_DEBUG_MODE` | Enable debug logging | `false` | ❌ |
| `VITE_UPDATE_INTERVAL` | Data refresh interval (ms) | `5000` | ❌ |

## Security Notes

- ⚠️ **Never commit `.env` files to version control**
- ✅ The `.env` file is already in `.gitignore`
- ✅ Use `.env.example` as a template for new developers
- 🔒 Only use `VITE_` prefix for variables that are safe to expose to the client
- 🚫 Never put sensitive server-side secrets in frontend environment variables

## Production Deployment

For production deployments, set environment variables through your hosting platform:

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables  
- **Heroku**: Config Vars in dashboard
- **Docker**: Use `-e` flags or `.env` files with docker-compose

## Troubleshooting

1. **Variables not loading?**
   - Ensure they start with `VITE_`
   - Restart the development server after changes
   - Check for syntax errors in `.env`

2. **API calls failing?**
   - Verify URLs in `.env` are correct
   - Check network connectivity
   - Ensure backend server is running

3. **Debug mode not working?**
   - Set `VITE_DEBUG_MODE=true` (not `"true"`)
   - Check browser console for logs
