import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapUpdater from './components/MapUpdater';
import Weather from './components/Weather';
import { installApp, isPWA } from './utils/pwa.js';
import config from './config/env.js';

function App() {
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState(null)
  const [weather, setWeather] = useState([]);

  const stopIdToLocation = {
    "8596-9b3631c6": "Towards City Centre",
    "7285-77225635": "Towards Blockhouse",
  };

  // Stop coordinates mapping
  const stopIdToCoordinates = {
    "8596-9b3631c6": [-36.90854478306579, 174.73620033480188],
    "7285-77225635": [-36.90854478306579, 174.73620033480188], 
  };
  const [time, setTime] = useState(new Date());

  // Function to calculate appropriate zoom level based on distance between two points
  const calculateZoom = (lat1, lon1, lat2, lon2) => {
    // Calculate distance between two points using Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers

    // Map distance to zoom level (adjust these values as needed)
    if (distance < 0.5) return 16;      // Very close - high zoom
    if (distance < 1) return 15;        // Close - medium-high zoom
    if (distance < 2) return 14;        // Medium distance
    if (distance < 5) return 13;        // Far - medium zoom
    if (distance < 10) return 12;       // Very far - low zoom
    return 11;                          // Default for very long distances
  };

  // Function to calculate center point - always center on the stop
  const calculateCenter = (lat1, lon1, lat2, lon2) => {
    return [lat2, lon2]; // Return stop coordinates (lat2, lon2)
  };

  const busIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const stopIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  const retrieveArrivals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(config.arrivalsApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStops(data.stops || [])
      
      // Debug logging and fetch closest bus locations
      if (config.debugMode && data.stops) {
        for (const stopData of data.stops) {
          if (stopData.arrivals && stopData.arrivals.length > 0) {
            // Get the closest bus (first arrival since they're sorted by time)
            const closestBus = stopData.arrivals[0];
            console.log(`Stop ${stopData.stopId}: Route ${closestBus.route}, Vehicle ID: ${closestBus.vehicleId}`);
            
            // Fetch location for the closest bus
            if (closestBus.vehicleId && closestBus.vehicleId !== 'unknown') {
              console.log(`Fetching location for closest bus ${closestBus.vehicleId} at stop ${stopData.stopId}`);
              //retrieveBusLocation(closestBus.vehicleId);
            }
            
            // Log all other arrivals
            for (let i = 1; i < stopData.arrivals.length; i++) {
              const arrival = stopData.arrivals[i];
              console.log(`Stop ${stopData.stopId}: Route ${arrival.route}, Vehicle ID: ${arrival.vehicleId}`);
            }
          } else {
            console.log(`Stop ${stopData.stopId}: No arrivals`);
          }
        }
      }

    } catch (error) {
      console.error('Error fetching arrivals:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Automatically fetch arrivals when component mounts and every 10 seconds
  useEffect(() => {
    retrieveArrivals(); // Initial fetch
    const interval = setInterval(() => retrieveArrivals(), config.updateInterval);
    return () => clearInterval(interval);
  }, [retrieveArrivals])

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(config.weatherApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setWeather(data)
      } catch (error) {
        console.error('Error fetching weather:', error)
        setError(error.message)
      }
    }
    fetchWeather();
  }, [])

  return (
    <div className="min-h-screen w-full flex justify-center items-start bg-white">
      <div className="bg-gray-100 w-full rounded-lg shadow-md p-6 mx-auto min-h-screen">
        <div className='flex flex-col lg:flex-row gap-4 items-start'>
          <div className='basis-2/3'>
            <h1 className="text-5xl font-bold mb-2 text-blue-900">{config.appName}</h1>
            <div className="text-4xl font-mono font-extrabold text-gray-800">
              {time.toLocaleTimeString()}
            </div>
          </div>
          <div className='basis-1/3 flex flex-col gap-2'>
            <Weather weatherData={weather} />
            {!isPWA() && (
              <button
                id="install-button"
                onClick={installApp}
                className="hidden bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📱 Install App
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        {stops.length > 0 && (
          <div className="stops-container">
            {stops.map((stopData, index) => (
              <div key={index} className="stop-section">
                <h3 className="text-3xl font-semibold p-2 text-blue-900">
                  ➡️ {stopIdToLocation[stopData.stopId]}
                </h3>

                {stopData.error ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error: {stopData.error}</p>
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="basis-1/2">
                    <table className="min-w-full bg-white  rounded-lg shadow-md overflow-hidden">
                      <thead className="bg-blue-300 text-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xl font-medium uppercase tracking-wider border-b rounded-tl-lg">Route</th>
                          <th className="px-6 py-3 text-left text-xl font-medium uppercase tracking-wider border-b">Arrival Time</th>
                          <th className="px-6 py-3 text-left text-xl font-medium uppercase tracking-wider border-b rounded-tr-lg">Time Left</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stopData.arrivals.length > 0 ? (
                          stopData.arrivals.map((arrival, arrivalIndex) => (
                            <tr key={arrivalIndex} className="hover:bg-blue-50 transition-colors">
                              <td className={`px-6 py-4 whitespace-nowrap text-xl font-medium text-gray-800 ${arrivalIndex === stopData.arrivals.length - 1 ? 'rounded-bl-lg' : ''}`}>
                                {arrival.route.split("-")[0]}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-xl text-gray-800 ">
                                {new Date(arrival.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-xl text-gray-800 ${arrivalIndex === stopData.arrivals.length - 1 ? 'rounded-br-lg' : ''}`}>
                                {(arrival.timeleft)} min
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic rounded-b-lg">
                              No upcoming buses for this stop
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                    <div className="basis-1/2">
                    {stopData.arrivals.length > 0 && stopData.arrivals[0].vehiclePosition && (
                      (() => {
                        const busLat = stopData.arrivals[0].vehiclePosition.position.latitude;
                        const busLon = stopData.arrivals[0].vehiclePosition.position.longitude;
                        const stopCoords = stopIdToCoordinates[stopData.stopId];
                        const [stopLat, stopLon] = stopCoords;
                        const zoom = calculateZoom(busLat, busLon, stopLat, stopLon);
                        const center = calculateCenter(busLat, busLon, stopLat, stopLon);
                        
                        return (
                          <MapContainer 
                            key={`map-${stopData.stopId}`} // Only recreate when stop changes, not on position updates
                            center={center} 
                            dragging={false} 
                            zoom={zoom} 
                            scrollWheelZoom="center" 
                            className="h-[360px] w-full rounded-lg shadow-md"
                            zoomControl={false}
                            attributionControl={false}
                          >
                            <MapUpdater 
                              center={center}
                              zoom={zoom}
                              busPosition={[busLat, busLon]}
                              stopPosition={[stopLat, stopLon]}
                              busIcon={busIcon}
                              stopIcon={stopIcon}
                              stopData={stopData}
                              stopIdToLocation={stopIdToLocation}
                            />
                          </MapContainer>
                        );
                      })()
                    )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && stops.length === 0 && !error && (
          <p className="text-center text-gray-600">No bus arrivals found at the moment.</p>
        )}
      </div>
      
      
    </div>

  )
}

export default App
