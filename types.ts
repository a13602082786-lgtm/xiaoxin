export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  FIREWORKS = 'Fireworks',
}

export interface ParticleState {
  expansion: number; // 0.0 to 1.0 (mapped to actual scale later)
  isConnected: boolean;
  isStreaming: boolean;
}

export interface ToolResponse {
  expansion: number;
}