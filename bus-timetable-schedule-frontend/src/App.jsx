import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true) // Start with loading true
  const [error, setError] = useState(null)
  const [buses, setBuses] = useState({})
  const stopIdToLocation = {
    "8596-9b3631c6": "To City Centre",
    "7285-77225635": "To Blockhouse",
  };
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  //retrieve the closest bus location of each stop
  const retrieveBusLocation = useCallback(async (vehicleID) => {
    try{
      const response = await fetch(`http://localhost:3000/api/vehicle/${vehicleID}`,{
        method: 'GET',
        headers:{
          'Content-Type': 'application/json'
        }
      })
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // Store bus data with vehicle ID as key
      setBuses(prev => ({
        ...prev,
        [vehicleID]: data
      }))
      console.log(`Bus location for ${vehicleID}:`, data);
    }catch(error) {
      console.error(`Error fetching bus ${vehicleID}:`, error)
      // Don't set global error for individual bus failures
    }
  }, [])

  const retrieveArrivals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:3000/api/arrivals", {
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
      if (data.stops) {
        for (const stopData of data.stops) {
          if (stopData.arrivals && stopData.arrivals.length > 0) {
            // Get the closest bus (first arrival since they're sorted by time)
            const closestBus = stopData.arrivals[0];
            console.log(`Stop ${stopData.stopId}: Route ${closestBus.route}, Vehicle ID: ${closestBus.vehicleId}`);
            
            // Fetch location for the closest bus
            if (closestBus.vehicleId && closestBus.vehicleId !== 'unknown') {
              console.log(`Fetching location for closest bus ${closestBus.vehicleId} at stop ${stopData.stopId}`);
              retrieveBusLocation(closestBus.vehicleId);
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
  }, [retrieveBusLocation])

  // Automatically fetch arrivals when component mounts and every 10 seconds
  useEffect(() => {
    retrieveArrivals(); // Initial fetch
    const interval = setInterval(() => retrieveArrivals(), 10000);
    return () => clearInterval(interval);
  }, [retrieveArrivals])


  //process the stops format


  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-100 px-4">
      <div className="bg-white max-w-3xl w-full rounded-lg shadow-md p-6 mx-auto min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Bus Timetable Schedule</h1>
        <div className="text-4xl font-mono font-extrabold text-black text-center">
          {time.toLocaleTimeString()}
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
          </div>
        )}

        {stops.length > 0 && (
          <div className="stops-container space-y-8">
            {/* <h2 className="text-2xl font-bold mb-6 text-center">Bus Stops and Arrivals</h2> */}
            {stops.map((stopData, index) => (
              <div key={index} className="stop-section">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {stopIdToLocation[stopData.stopId]}
                </h3>

                {stopData.error ? (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>Error: {stopData.error}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Route</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Arrival Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider border-b">Time Left</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stopData.arrivals.length > 0 ? (
                          stopData.arrivals.map((arrival, arrivalIndex) => (
                            <tr key={arrivalIndex} className="hover:bg-blue-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {arrival.route.split("-")[0]}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(arrival.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {(arrival.timeleft)} min
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                              No upcoming buses for this stop
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* <div className="text-center mb-6 mt-6">
          <button 
            onClick={retrieveArrivals} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            {loading ? 'Loading...' : 'Refresh Arrivals'}
          </button>
        </div> */}

        {/* {loading && (
          <p className="text-center text-gray-600 mb-4">Loading bus schedule data...</p>
        )} */}

        {!loading && stops.length === 0 && !error && (
          <p className="text-center text-gray-600">No bus arrivals found at the moment.</p>
        )}
      </div>
    </div>

  )
}

export default App
