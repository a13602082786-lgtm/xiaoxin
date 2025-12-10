import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ShapeType } from '../types';
import { 
  Heart, 
  Flower2, 
  Globe2, 
  User, 
  Sparkles, 
  Palette, 
  Maximize2, 
  Minimize2,
  Camera
} from 'lucide-react';

interface InterfaceProps {
  currentShape: ShapeType;
  onShapeChange: (shape: ShapeType) => void;
  color: string;
  onColorChange: (color: string) => void;
  isConnected: boolean;
}

const Interface: React.FC<InterfaceProps> = ({ 
  currentShape, 
  onShapeChange, 
  color, 
  onColorChange,
  isConnected
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const shapes = [
    { type: ShapeType.HEART, icon: <Heart size={20} />, label: "Heart" },
    { type: ShapeType.FLOWER, icon: <Flower2 size={20} />, label: "Flower" },
    { type: ShapeType.SATURN, icon: <Globe2 size={20} />, label: "Saturn" },
    { type: ShapeType.BUDDHA, icon: <User size={20} />, label: "Zen" },
    { type: ShapeType.FIREWORKS, icon: <Sparkles size={20} />, label: "Burst" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header / Status */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10 text-white">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            ZenParticles
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
             <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
             <span>{isConnected ? 'Vision Active' : 'Connecting Camera...'}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 max-w-[200px]">
            Move hands apart to expand. Bring together to contract.
          </div>
        </div>

        <button 
          onClick={toggleFullScreen}
          className="bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/10 transition-colors border border-white/10"
        >
          {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col gap-4 items-center pointer-events-auto w-full md:w-auto md:self-center">
        
        {/* Shape Selector */}
        <div className="flex gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
          {shapes.map((s) => (
            <button
              key={s.type}
              onClick={() => onShapeChange(s.type)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl min-w-[70px] transition-all duration-300 ${
                currentShape === s.type 
                  ? 'bg-gradient-to-b from-purple-600/50 to-blue-600/50 text-white shadow-lg shadow-purple-500/20 border border-white/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.icon}
              <span className="text-[10px] uppercase tracking-wider font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Color Picker Toggle */}
        <div className="relative">
             <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <div 
                className="w-4 h-4 rounded-full border border-white/30" 
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium">Color</span>
              <Palette size={16} className="ml-1 opacity-70" />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                <HexColorPicker color={color} onChange={onColorChange} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Interface;
