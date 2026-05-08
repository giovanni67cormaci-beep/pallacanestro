
import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { GRAVITY } from '../../constants';

interface TrajectoryProps {
  power: number;
  angle: number;
  startPos: [number, number, number];
  visible: boolean;
}

export function Trajectory({ power, angle, startPos, visible }: TrajectoryProps) {
  const points = useMemo(() => {
    if (!visible) return [];
    
    const initialPos = new THREE.Vector3(...startPos);
    // Aim toward the hoop (RIM_POSITION is at [0, 3.05, -13])
    const target = new THREE.Vector3(0, 3.05, -13);
    const direction = new THREE.Vector3().subVectors(target, initialPos);
    const horizDir = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    
    const rad = (angle * Math.PI) / 180;
    const v0 = power * 1.5;
    const vx = horizDir.x * v0 * Math.cos(rad);
    const vz = horizDir.z * v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);

    const pathPoints: THREE.Vector3[] = [];
    const step = 0.05;
    
    // Simulate trajectory for a few seconds or until it hits the floor
    for (let t = 0; t < 2.5; t += step) {
      const x = initialPos.x + vx * t;
      const z = initialPos.z + vz * t;
      const y = initialPos.y + vy * t - 0.5 * GRAVITY * t * t;
      
      pathPoints.push(new THREE.Vector3(x, y, z));
      if (y < 0) break;
    }
    
    return pathPoints;
  }, [power, angle, startPos, visible]);

  if (!visible || points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#fb923c"
      lineWidth={1.5}
      dashed
      dashScale={5}
      dashSize={0.5}
      gapSize={0.3}
      transparent
      opacity={0.4}
    />
  );
}
