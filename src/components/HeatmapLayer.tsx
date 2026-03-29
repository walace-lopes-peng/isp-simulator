import React, { useEffect, useRef } from 'react';
import { useISPStore } from '../store/useISPStore';

const HeatmapLayer = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bufferRef = useRef<HTMLCanvasElement | null>(null);
    const demandGrid = useISPStore(state => state.demandGrid);
    const rangeLevel = useISPStore(state => state.rangeLevel);

    // Render the demand grid to an offscreen buffer ONCE when it changes
    useEffect(() => {
        if (!demandGrid || demandGrid.length === 0) return;

        const buffer = document.createElement('canvas');
        buffer.width = 800;
        buffer.height = 800;
        const bctx = buffer.getContext('2d');
        if (!bctx) return;

        bctx.clearRect(0, 0, 800, 800);
        bctx.globalCompositeOperation = 'screen';

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
                color = 'rgba(244, 63, 130, 0.3)'; 
                blurColor = 'rgba(244, 63, 130, 0.8)';
            }

            bctx.shadowBlur = Math.max(10, cell.trafficBase / 5);
            bctx.shadowColor = blurColor;
            bctx.fillStyle = color;
            bctx.fillRect(cell.x + 2, cell.y + 2, cell.width - 4, cell.height - 4);
        });

        bufferRef.current = buffer;
        draw();
    }, [demandGrid]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas || !bufferRef.current) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(bufferRef.current, 0, 0);
    };

    // Redraw when the primary canvas mounts or rangeLevel changes (if visibility toggles)
    useEffect(() => {
        draw();
    }, [rangeLevel]);

    return (
        <canvas 
            ref={canvasRef}
            width={800} 
            height={800} 
            className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-80"
            style={{ 
                zIndex: 0,
                display: rangeLevel > 2 ? 'none' : 'block' 
            }}
        />
    );
};

export default React.memo(HeatmapLayer);
