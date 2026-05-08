
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerModelProps {
  position: [number, number, number];
  isShooting: boolean;
  color?: string;
  name?: string;
}

export function PlayerModel({ position, isShooting, color = "#fb923c", name }: PlayerModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const armsRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!armsRef.current || !leftArmRef.current || !rightArmRef.current) return;
    
    // Gesto tecnico del tiro: elevazione delle braccia
    if (isShooting) {
      const targetRotation = -Math.PI / 1.2;
      armsRef.current.rotation.x = THREE.MathUtils.lerp(armsRef.current.rotation.x, targetRotation, 0.12);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.2, 0.1);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.2, 0.1);
    } else {
      // Posizione di attesa (Triple Threat stance)
      armsRef.current.rotation.x = THREE.MathUtils.lerp(armsRef.current.rotation.x, -Math.PI / 4, 0.05);
      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.1, 0.05);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.1, 0.05);
    }
    
    // Lo sguardo è sempre rivolto al canestro (punto focale della prestazione)
    if (groupRef.current) {
      groupRef.current.lookAt(0, 1.5, -13);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Torso con Jersey */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.6, 4, 12]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.5} />
      </mesh>
      
      {/* Pantaloncini */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.28, 0.4, 12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Testa con dettaglio base */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>

      {/* Braccia articolate */}
      <group ref={armsRef} position={[0, 1.6, 0]}>
        {/* Braccio Sinistro */}
        <group ref={leftArmRef} position={[-0.35, 0, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#fcd34d" />
          </mesh>
          {/* Avambraccio */}
          <mesh position={[0, -0.6, 0.1]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#fcd34d" />
          </mesh>
        </group>
        
        {/* Braccio Destro (Principale per il tiro) */}
        <group ref={rightArmRef} position={[0.35, 0, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.05, 0.6, 8]} />
            <meshStandardMaterial color="#fcd34d" />
          </mesh>
          {/* Avambraccio */}
          <mesh position={[0, -0.6, 0.1]} rotation={[0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.5, 8]} />
            <meshStandardMaterial color="#fcd34d" />
          </mesh>
        </group>
      </group>

      {/* Gambe e Scarpe */}
      <group position={[0, 0, 0]}>
        <mesh position={[-0.15, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.7, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        <mesh position={[0.15, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.07, 0.7, 8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        
        {/* Scarpe (Base d'appoggio) */}
        <mesh position={[-0.15, 0.05, 0.1]} castShadow>
          <boxGeometry args={[0.15, 0.12, 0.3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.15, 0.05, 0.1]} castShadow>
          <boxGeometry args={[0.15, 0.12, 0.3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Indicatore di Posizione Biomeccanica */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
