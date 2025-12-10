import React, { useState, useCallback } from 'react';
import CameraHandler from './components/CameraHandler';
import Visualizer from './components/Visualizer';
import Interface from './components/Interface';
import { ShapeType } from './types';

const App: React.FC = () => {
  const [expansion, setExpansion] = useState<number>(0.5); // 0.0 to 1.0
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [shape, setShape] = useState<ShapeType>(ShapeType.HEART);
  const [color, setColor] = useState<string>('#cdb4db');

  const handleExpansionChange = useCallback((val: number) => {
    // Smooth out jitter slightly if needed, but direct mapping feels more responsive
    setExpansion(val);
  }, []);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black text-white font-sans selection:bg-purple-500/30">
      
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Visualizer shape={shape} color={color} expansion={expansion} />
      </div>

      {/* Camera & Logic (Hidden) */}
      <CameraHandler 
        onExpansionChange={handleExpansionChange} 
        onConnectionChange={setIsConnected}
      />

      {/* UI Overlay */}
      <Interface 
        currentShape={shape}
        onShapeChange={setShape}
        color={color}
        onColorChange={setColor}
        isConnected={isConnected}
      />
      
    </div>
  );
};

export default App;
