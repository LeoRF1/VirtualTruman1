// config.js

// Google Maps Configuration
const GOOGLE_MAPS_CONFIG = {
  apiKey: 'Your-API-Key-Here', 
  
  // Truman State University Campus Center
  campusCenter: {
    lat: 40.1885,   
    lng: -92.5890   
  },
  
  // Default map settings
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
  
  // Map style/type
  mapTypeId: 'roadmap'  
};

// Make it available globally (since you're not using modules/imports)
window.GOOGLE_MAPS_CONFIG = GOOGLE_MAPS_CONFIG;