/**
 * Geographic Utility for Coordinate Mapping
 * Logic: Mercator Projection into a fixed SVG viewport (Default 800x800)
 */

const MAP_WIDTH = 800;
const MAP_HEIGHT = 800;

/**
 * Maps Latitude and Longitude to SVG (X, Y) coordinates.
 * Range: Lat [-85.0511, 85.0511], Lon [-180, 180]
 */
export const latLonToXY = (lat: number, lon: number): { x: number, y: number } => {
    // 1. Longitude to X (Linear 0-800)
    const x = (lon + 180) * (MAP_WIDTH / 360);
    
    // 2. Latitude to Y (Mercator 0-800)
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = MAP_HEIGHT / 2 - (MAP_WIDTH / (2 * Math.PI)) * mercN;
    
    return { x, y };
};

/**
 * Reverses SVG (X, Y) back to Latitude and Longitude.
 */
export const XYToLatLon = (x: number, y: number): { lat: number, lon: number } => {
    // 1. X to Longitude
    const lon = (x * 360) / MAP_WIDTH - 180;
    
    // 2. Y to Latitude
    const mercN = (MAP_HEIGHT / 2 - y) / (MAP_WIDTH / (2 * Math.PI));
    const latRad = 2 * Math.atan(Math.exp(mercN)) - Math.PI / 2;
    const lat = (latRad * 180) / Math.PI;
    
    return { lat, lon };
};
