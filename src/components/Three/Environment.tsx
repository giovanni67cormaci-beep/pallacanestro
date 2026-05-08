
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Text, useHelper } from '@react-three/drei';

export function Environment() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Floor / Court */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Court Lines (Simplified) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[28, 15]} />
        <meshStandardMaterial color="#d2691e" transparent opacity={0.8} />
      </mesh>
      
      {/* Grid helper for depth */}
      <gridHelper args={[60, 20, 0x444444, 0x333333]} position={[0, 0.02, 0]} />
    </>
  );
}

export function Hoop() {
  return (
    <group position={[0, 0, -13.5]}>
      {/* Post */}
      <mesh position={[0, 1.5, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 3]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Backboard */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[1.8, 1.2, 0.05]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Backboard Square */}
      <mesh position={[0, 3.3, 0.03]}>
        <boxGeometry args={[0.6, 0.45, 0.01]} />
        <meshStandardMaterial color="white" />
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[0.59, 0.44, 0.005]} />
          <meshStandardMaterial color="red" wireframe />
        </mesh>
      </mesh>

      {/* Rim */}
      <mesh position={[0, 3.05, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.225, 0.02, 16, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </group>
  );
}
