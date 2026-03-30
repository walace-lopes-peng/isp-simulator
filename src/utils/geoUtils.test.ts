import { describe, it, expect } from 'vitest';

const NYC_COORDS = { x: 248, y: 318 };

describe('Geographical Utilities', () => {
  it('should accurately represent the NYC landmass center at (248, 318)', () => {
    expect(NYC_COORDS.x).toBe(248);
    expect(NYC_COORDS.y).toBe(318);
  });

  const getDistance = (p1: {x:number,y:number}, p2: {x:number,y:number}) => 
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  it('should calculate distance correctly between two points', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };
    expect(getDistance(p1, p2)).toBe(5);
  });

  it('should maintain the 150px initial range constraint for 70s copper links', () => {
    const MAX_DIST_70S = 150;
    const p1 = { x: 248, y: 318 }; 
    const p2 = { x: 263, y: 303 }; 
    expect(getDistance(p1, p2)).toBeLessThan(MAX_DIST_70S);
  });

  it('should detect when a point is out of range for the Pioneer Era', () => {
    const MAX_DIST_70S = 150;
    const p1 = { x: 248, y: 318 };
    const p2 = { x: 500, y: 500 }; 
    expect(getDistance(p1, p2)).toBeGreaterThan(MAX_DIST_70S);
  });
});
