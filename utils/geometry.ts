import * as THREE from 'three';
import { ShapeType } from '../types';

export const generateParticles = (shape: ShapeType, count: number = 5000): Float32Array => {
  const positions = new Float32Array(count * 3);
  const dummy = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;

    switch (shape) {
      case ShapeType.HEART: {
        // Parametric Heart
        const t = Math.random() * Math.PI * 2;
        const r = Math.random(); // volume filler
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        const scale = 0.15 * Math.sqrt(r); // spread inside
        x = scale * 16 * Math.pow(Math.sin(t), 3);
        y = scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        z = (Math.random() - 0.5) * 2; // depth
        break;
      }
      case ShapeType.FLOWER: {
        // Rose curve / Rhodonea
        const k = 4; // petals
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        const r = Math.sin(k * theta) + 1.5; // +1.5 to give it volume
        const dist = Math.random() * 2;
        x = dist * r * Math.cos(theta) * Math.cos(phi);
        y = dist * r * Math.sin(theta) * Math.cos(phi);
        z = dist * r * Math.sin(phi);
        break;
      }
      case ShapeType.SATURN: {
        const type = Math.random();
        if (type < 0.6) {
          // Planet Body
          const r = 2 * Math.cbrt(Math.random());
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        } else {
          // Rings
          const angle = Math.random() * Math.PI * 2;
          const dist = 3 + Math.random() * 2.5;
          x = dist * Math.cos(angle);
          z = dist * Math.sin(angle);
          y = (Math.random() - 0.5) * 0.2; // Thin disk
          // Tilt
          const tilt = Math.PI / 6;
          const ty = y * Math.cos(tilt) - z * Math.sin(tilt);
          const tz = y * Math.sin(tilt) + z * Math.cos(tilt);
          y = ty;
          z = tz;
        }
        break;
      }
      case ShapeType.BUDDHA: {
        // Abstract sitting figure approximation
        const section = Math.random();
        if (section < 0.3) {
          // Head
          const r = 0.8 * Math.cbrt(Math.random());
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta) + 2.5; // Offset up
          z = r * Math.cos(phi);
        } else if (section < 0.7) {
          // Body (Conical/Cylindrical volume)
          const h = Math.random() * 2.5; // Height 0 to 2.5
          const r = (1 - h/3) * 1.5 * Math.sqrt(Math.random());
          const theta = Math.random() * Math.PI * 2;
          x = r * Math.cos(theta);
          y = h;
          z = r * Math.sin(theta);
        } else {
          // Legs (Crossed - Torus segment approximation)
          const angle = Math.random() * Math.PI * 2;
          const majorR = 1.8;
          const minorR = 0.6 * Math.sqrt(Math.random());
          // Torus formula
          x = (majorR + minorR * Math.cos(angle)) * Math.cos(angle);
          z = (majorR + minorR * Math.cos(angle)) * Math.sin(angle);
          y = minorR * Math.sin(angle);
        }
        break;
      }
      case ShapeType.FIREWORKS: {
        // Starburst
        const r = 4 * Math.cbrt(Math.random()); // Even distribution in sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Add some "trails" structure
        const trail = Math.floor(Math.random() * 10); 
        // Group particles into lines radiating out
        const lineTheta = (Math.PI * 2 * trail) / 10;
        
        // Combine random sphere with structured rays
        if (Math.random() > 0.5) {
             x = r * Math.sin(phi) * Math.cos(theta);
             y = r * Math.sin(phi) * Math.sin(theta);
             z = r * Math.cos(phi);
        } else {
             const dist = Math.random() * 5;
             const rayTheta = Math.random() * Math.PI * 2;
             const rayPhi = Math.random() * Math.PI;
             x = dist * Math.sin(rayPhi) * Math.cos(rayTheta);
             y = dist * Math.sin(rayPhi) * Math.sin(rayTheta);
             z = dist * Math.cos(rayPhi);
        }
        break;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }
  return positions;
};