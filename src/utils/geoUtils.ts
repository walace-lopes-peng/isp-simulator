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
 * Converts Latitude/Longitude to SVG X/Y coordinates (Mercator)
 */
export const latLonToXY = (lat: number, lon: number): { x: number; y: number } => {
    const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP_SIZE;
    
    const MAX_MERCATOR_LAT = 85.0511;
    let clampedLat = Math.max(Math.min(lat, MAX_MERCATOR_LAT), -MAX_MERCATOR_LAT);
    const latRad = (clampedLat * Math.PI) / 180;

    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = (MAP_SIZE / 2) - (MAP_SIZE * mercN / (2 * Math.PI));
    
    return { 
        x: Math.round(x), 
        y: Math.round(y) 
    };
};

/**
 * Converts SVG X/Y coordinates back to Latitude/Longitude (Inverse Mercator)
 */
export const XYToLatLon = (x: number, y: number): { lat: number; lon: number } => {
    const lon = (x / MAP_SIZE) * (MAX_LON - MIN_LON) + MIN_LON;
    
    const mercN = ((MAP_SIZE / 2) - y) * (2 * Math.PI) / MAP_SIZE;
    const latRad = 2 * Math.atan(Math.exp(mercN)) - Math.PI / 2;
    const lat = (latRad * 180) / Math.PI;
    
    return { lat, lon };
};
