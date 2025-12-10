import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateParticles } from '../utils/geometry';

interface ParticlesProps {
  shape: ShapeType;
  color: string;
  expansion: number;
}

const Particles: React.FC<ParticlesProps> = ({ shape, color, expansion }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Memoize particle geometry generation so it only regenerates when shape changes
  const positions = useMemo(() => generateParticles(shape, 8000), [shape]);
  
  // Create BufferGeometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    // Add a 'target' attribute if we wanted to morph, but simple replacement is fine for this demo
    return geo;
  }, [positions]);

  // Animation Frame
  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const points = pointsRef.current;
    
    // Rotate the whole system slowly
    points.rotation.y = time * 0.1;
    
    // Breathing/Expansion effect based on Prop + Sine wave for life
    // Base scale is driven by 'expansion' prop (0.0 to 1.0)
    // Map 0.0->0.5 scale, 1.0->2.5 scale
    const targetScale = 0.5 + (expansion * 2.0);
    
    // Smooth lerp for scale
    points.scale.x = THREE.MathUtils.lerp(points.scale.x, targetScale, 0.1);
    points.scale.y = THREE.MathUtils.lerp(points.scale.y, targetScale, 0.1);
    points.scale.z = THREE.MathUtils.lerp(points.scale.z, targetScale, 0.1);
    
    // Optional: Add some individual particle jitter based on shape (if we used shader material)
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

interface VisualizerProps {
  shape: ShapeType;
  color: string;
  expansion: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ shape, color, expansion }) => {
  return (
    <div className="w-full h-full relative bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ antialias: true }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 5, 20]} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Particles shape={shape} color={color} expansion={expansion} />
        
        <OrbitControls enableZoom={true} enablePan={false} maxDistance={20} minDistance={2} />
      </Canvas>
    </div>
  );
};

export default Visualizer;
