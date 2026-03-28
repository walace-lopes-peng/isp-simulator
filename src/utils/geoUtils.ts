/**
 * Geographic Utility Functions for the Logistic Map
 * v1.0 - Coordinate Bridge (Linear Projection)
 * 
 * Maps between SVG space (0-800) and Geographic space (Lat/Lon)
 */

const MAP_SIZE = 800;

// Coordinate Ranges (Arbitrary for the prototype, centering on a global map)
const MIN_LAT = -60;
const MAX_LAT = 85; 
const MIN_LON = -180;
const MAX_LON = 180;

/**
 * Converts Latitude/Longitude to SVG X/Y coordinates
 */
export const latLonToXY = (lat: number, lon: number): { x: number; y: number } => {
    const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP_SIZE;
    // Y is inverted in SVG
    const y = MAP_SIZE - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * MAP_SIZE;
    
    return { 
        x: Math.round(x), 
        y: Math.round(y) 
    };
};

/**
 * Converts SVG X/Y coordinates back to Latitude/Longitude
 */
export const XYToLatLon = (x: number, y: number): { lat: number; lon: number } => {
    const lon = (x / MAP_SIZE) * (MAX_LON - MIN_LON) + MIN_LON;
    // Invert Y back
    const lat = ((MAP_SIZE - y) / MAP_SIZE) * (MAX_LAT - MIN_LAT) + MIN_LAT;
    
    return { lat, lon };
};
