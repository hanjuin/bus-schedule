const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

const API_KEY = '4e808ea49348471087e29a52be43b82d';
// const STOP_ID = '8596-9b3631c6';
const URL = 'https://api.at.govt.nz/realtime/legacy/tripupdates';
const URL_position = 'https://api.at.govt.nz/realtime/legacy/vehiclelocations'
const stops = [
  { id: '8596-9b3631c6' },
  { id: '7285-77225635' },
];

const weatherApiKey = '9a5f28965b71458180f40722250707';
const weatherApiUrl = 'https://api.weatherapi.com/v1/forecast.json';
const weatherLocation = 'Auckland'; // Default location for weather

async function fetchWeatherForecast() {
  try {
    const response = await axios.get(weatherApiUrl, {
      params: {
        key: weatherApiKey,
        q: weatherLocation,
        days: 3
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message);
    return null;
  }
}

async function fetchTripUpdates(STOP_ID) {
  const stopArrivals = []; // Create a separate array for each stop
  
  try {
    const response = await axios.get(URL, {
      responseType: 'arraybuffer',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Accept': 'application/x-protobuf'
      }
    });

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(response.data)
    );

    feed.entity.forEach(entity => {
      const update = entity.tripUpdate;
      if (update?.stopTimeUpdate) {
        update.stopTimeUpdate.forEach(stop => {
          if (stop.stopId === STOP_ID && stop.arrival?.time) {
            const arrivalTime = stop.arrival.time.toNumber() * 1000;
            stopArrivals.push({
              route: update.trip.routeId,
              time: new Date(arrivalTime),
              stopId: STOP_ID,
              timeleft: Math.floor(Math.max(0, arrivalTime - Date.now())/60000), // Calculate time left in minutes
              vehicleId: update.vehicle?.id || update.vehicle?.vehicle?.id || 'unknown'
            });
          }
        });
      }
    });

    stopArrivals.sort((a, b) => a.time - b.time); // Sort by soonest

    const nextArrivals = stopArrivals.slice(0, 4); // Only show next 4
    
    // Fetch vehicle positions for each arrival
    const arrivalsWithPositions = await Promise.all(
      nextArrivals.map(async (arrival) => {
        if (arrival.vehicleId && arrival.vehicleId !== 'unknown') {
          const vehiclePosition = await fetchVehiclePositions(arrival.vehicleId);
          return {
            ...arrival,
            vehiclePosition: vehiclePosition
          };
        }
        return arrival;
      })
    );

    return {
      stopId: STOP_ID,
      arrivals: arrivalsWithPositions
    };

  } catch (error) {
    console.error('Error fetching trip updates:', error.message);
    return {
      stopId: STOP_ID,
      arrivals: [],
      error: error.message
    };
  }
}

async function fetchVehiclePositions(vehicleId) {
  try {
    const response = await axios.get(URL_position, {
      responseType: 'arraybuffer',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Accept': 'application/x-protobuf'
      }
    });

    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(response.data)
    );
    
    console.log(`Looking for vehicle ID: ${vehicleId}`);
    console.log(`Total entities in feed: ${feed.entity.length}`);
    
    // Check different possible vehicle ID structures
    const vehicleEntity = feed.entity.find(entity => {
      if (!entity.vehicle) return false;
      
      // Try different possible structures
      const possibleIds = [
        entity.vehicle.vehicle?.id,
        entity.vehicle.id,
        entity.id
      ];
      
      //console.log(`Entity vehicle IDs:`, possibleIds.filter(id => id));
      return possibleIds.includes(vehicleId);
    });
    
    if (vehicleEntity) {
      console.log(`Found vehicle:`, vehicleEntity.vehicle);
      return vehicleEntity.vehicle;
    } else {
      console.log(`Vehicle ${vehicleId} not found`);
      return null;
    }

  } catch (error) {
    console.error('Error fetching vehicle positions:', error.message);
    return null;
  }
}



/// GET request handler for /api/arrivals
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

app.get('/api/arrivals', async (req, res) => {
  try {
    // Fetch arrivals for each stop (now includes vehicle positions)
    const stopResults = await Promise.all(
      stops.map(stop => fetchTripUpdates(stop.id))
    );
    
    // Return the results grouped by stop with vehicle positions included
    res.status(200).json({
      stops: stopResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching arrivals:', error);
    res.status(500).json({ error: 'Failed to fetch arrivals' });
  }
});

app.get('/api/weather', async (req, res) => {
  try {
    const weatherData = await fetchWeatherForecast();
    if (weatherData) {
      res.status(200).json(weatherData);
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});