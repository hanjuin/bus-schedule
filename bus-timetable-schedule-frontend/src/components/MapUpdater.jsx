import { useEffect } from 'react';
import { TileLayer, Marker, Popup, useMap } from 'react-leaflet';

// Custom component to handle smooth map updates
function MapUpdater({ center, zoom, busPosition, stopPosition, busIcon, stopIcon, stopData, stopIdToLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [map, center, zoom]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {busPosition && (
        <Marker 
          position={busPosition}
          icon={busIcon}
        >
          <Popup>
            Route: {stopData.arrivals[0].route}<br />
            Vehicle ID: {stopData.arrivals[0].vehicleId}<br />
            Stop: {stopIdToLocation[stopData.stopId]}<br />
            ETA: {stopData.arrivals[0].timeleft} min
          </Popup>
        </Marker>
      )}
      {stopPosition && (
        <Marker 
          position={stopPosition}
          icon={stopIcon}
        >
          <Popup>
            Stop: {stopIdToLocation[stopData.stopId]}<br />
            Stop ID: {stopData.stopId}
          </Popup>
        </Marker>
      )}
    </>
  );
}

export default MapUpdater;
