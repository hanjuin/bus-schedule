const axios = require('axios');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

const API_KEY = '4e808ea49348471087e29a52be43b82d';
// const STOP_ID = '8596-9b3631c6';
const URL = 'https://api.at.govt.nz/realtime/legacy/tripupdates';

const stops = [
  { id: '8596-9b3631c6' },
  { id: '7285-77225635' },
];

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
            });
          }
        });
      }
    });

    stopArrivals.sort((a, b) => a.time - b.time); // Sort by soonest

    const nextArrivals = stopArrivals.slice(0, 4); // Only show next 4

    //console.log(`\n🚌 Next 4 arrivals for stop ${STOP_ID}:\n`);

    if (nextArrivals.length === 0) {
      //console.log('No upcoming buses found.');
    } else {
        nextArrivals.forEach((a, idx) => {
        //console.log(`${idx + 1}. Route ${a.route} at ${a.time.toLocaleTimeString()}`);
      });
    }

    return {
      stopId: STOP_ID,
      arrivals: nextArrivals
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
    // Fetch arrivals for each stop
    const stopResults = await Promise.all(
      stops.map(stop => fetchTripUpdates(stop.id))
    );
    
    // Return the results grouped by stop
    res.status(200).json({
      stops: stopResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching arrivals:', error);
    res.status(500).json({ error: 'Failed to fetch arrivals' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});