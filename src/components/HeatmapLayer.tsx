import React, { useEffect, useRef } from 'react';
import { useISPStore } from '../store/useISPStore';

const HeatmapLayer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const demandGrid = useISPStore(state => state.demandGrid);
    const rangeLevel = useISPStore(state => state.rangeLevel);

    if (rangeLevel > 2) return null;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !demandGrid || demandGrid.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cyber-Noir screen bending
        ctx.globalCompositeOperation = 'screen';

        demandGrid.forEach(cell => {
            if (cell.type === 'empty') return;

            let color = 'rgba(0,0,0,0)';
            let blurColor = 'rgba(0,0,0,0)';
            
            if (cell.type === 'residential') {
                color = 'rgba(16, 185, 129, 0.2)'; 
                blurColor = 'rgba(16, 185, 129, 0.5)';
            } else if (cell.type === 'commercial') {
                color = 'rgba(59, 130, 246, 0.25)'; 
                blurColor = 'rgba(59, 130, 246, 0.6)';
            } else if (cell.type === 'industrial') {
                color = 'rgba(244, 63, 94, 0.3)'; 
                blurColor = 'rgba(244, 63, 94, 0.8)';
            }

            // Glow 
            ctx.shadowBlur = Math.max(10, cell.trafficBase / 5);
            ctx.shadowColor = blurColor;
            ctx.fillStyle = color;

            ctx.fillRect(cell.x + 2, cell.y + 2, cell.width - 4, cell.height - 4);
        });

        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';
    }, [demandGrid, rangeLevel]);

    return (
        <canvas 
            ref={canvasRef}
            width={800} 
            height={800} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen opacity-80"
            style={{ zIndex: 0 }}
        />
    );
};

export default HeatmapLayer;
