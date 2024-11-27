import React, { useEffect } from 'react';
import { initMap } from '../../public/js/map.js';

const MapView = () => {
  useEffect(() => {
    initMap();
  }, []);

  return <div id="map-container"></div>;
};

export default MapView; 