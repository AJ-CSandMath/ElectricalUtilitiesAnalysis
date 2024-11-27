import React, { useEffect } from 'react';
import { initMap } from '../../frontend/public/js/map.js';

const MapView = () => {
  useEffect(() => {
    initMap();
  }, []);

  return <div id="map-container"></div>;
};

export default MapView; 