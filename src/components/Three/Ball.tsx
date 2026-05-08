
import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere, Trail } from '@react-three/drei';
import { RIM_POSITION, GRAVITY, BALL_RADIUS } from '../../constants';

interface BallProps {
  onScore: () => void;
  onMiss: () => void;
  shooting: boolean;
  power: number;
  angle: number;
  startPos: [number, number, number];
}

export function Ball({ onScore, onMiss, shooting, power, angle, startPos }: BallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  const [velocity, setVelocity] = useState(new THREE.Vector3());
  const [pos, setPos] = useState(new THREE.Vector3(...startPos));
  const [hasScored, setHasScored] = useState(false);
  const timeRef = useRef(0);

  // Initialize shot
  useEffect(() => {
    if (shooting && !active) {
      const initialPos = new THREE.Vector3(...startPos);
      
      // Calculate target direction (toward the rim)
      const target = new THREE.Vector3(RIM_POSITION.x, RIM_POSITION.y, RIM_POSITION.z);
      const direction = new THREE.Vector3().subVectors(target, initialPos).normalize();
      
      // Apply the shooting angle (vertical inclination)
      const rad = (angle * Math.PI) / 180;
      
      // We want the velocity to have a horizontal component (towards hoop) and vertical component
      // Calculate horizontal direction vector
      const horizDir = new THREE.Vector3(direction.x, 0, direction.z).normalize();
      
      const v0 = power * 1.5; // Scale power
      const vx = horizDir.x * v0 * Math.cos(rad);
      const vz = horizDir.z * v0 * Math.cos(rad);
      const vy = v0 * Math.sin(rad);

      setVelocity(new THREE.Vector3(vx, vy, vz));
      setPos(initialPos);
      setActive(true);
      setHasScored(false);
      timeRef.current = 0;
    }
  }, [shooting, power, angle, startPos]);

  useFrame((state, delta) => {
    if (!active || !meshRef.current) return;

    timeRef.current += delta;
    
    // Simple Euler integration for trajectory
    const newVel = velocity.clone();
    newVel.y -= GRAVITY * delta;
    
    const newPos = pos.clone().add(newVel.clone().multiplyScalar(delta));
    
    setPos(newPos);
    setVelocity(newVel);
    meshRef.current.position.copy(newPos);

    // Collision check with rim
    const distToRim = newPos.distanceTo(new THREE.Vector3(RIM_POSITION.x, RIM_POSITION.y, RIM_POSITION.z));
    if (!hasScored && distToRim < 0.35 && newVel.y < 0) {
      setHasScored(true);
      onScore();
    }

    // Floor collision or Out of bounds
    if (newPos.y < BALL_RADIUS) {
      setActive(false);
      if (!hasScored) onMiss();
    }
    
    // Bounds check
    if (Math.abs(newPos.z) > 30 || Math.abs(newPos.x) > 20) {
       setActive(false);
       if (!hasScored) onMiss();
    }
  });

  if (!active && !shooting) return null;

  return (
    <group>
      <Trail 
        width={1} 
        length={8} 
        color="#fb923c" 
        attenuation={(t) => t * t}
      >
        <Sphere ref={meshRef} args={[BALL_RADIUS, 32, 32]} position={startPos} castShadow>
          <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.1} />
        </Sphere>
      </Trail>
    </group>
  );
}
