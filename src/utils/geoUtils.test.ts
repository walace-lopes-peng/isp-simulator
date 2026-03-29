import { describe, it, expect } from 'vitest';
import { latLonToXY, XYToLatLon } from './geoUtils';

describe('geoUtils Coordinate Mapping', () => {
    describe('latLonToXY', () => {
        it('should map 0,0 Lat/Lon exactly to the center of the 800x800 SVG', () => {
            const { x, y } = latLonToXY(0, 0);
            
            // Expected center of an 800x800 map is 400, 400
            expect(x).toBe(400);
            expect(y).toBe(400);
        });

        it('should map minimum bounds (-85.0511 Lat, -180 Lon) to origin near bottom-left', () => {
            const { x, y } = latLonToXY(-85.0511, -180);
            expect(x).toBe(0);
            // Y will be near 800 due to inverted SVG coordinates (bottom correlates to high Y)
            expect(y).toBeCloseTo(800, -1); 
        });

        it('should map maximum bounds (85.0511 Lat, 180 Lon) to origin near top-right', () => {
            const { x, y } = latLonToXY(85.0511, 180);
            expect(x).toBe(800);
            // Y will be near 0
            expect(y).toBeCloseTo(0, -1);
        });
    });

    describe('XYToLatLon', () => {
        it('should map the center (400, 400) back to 0,0 Lat/Lon', () => {
            const { lat, lon } = XYToLatLon(400, 400);
            expect(lat).toBeCloseTo(0, 1);
            expect(lon).toBeCloseTo(0, 1);
        });
    });
});
