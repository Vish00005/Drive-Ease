import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* ── Wheel ── */
function Wheel({ position }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 1.2;
  });
  return (
    <group position={position} ref={ref}>
      {/* Tyre */}
      <mesh castShadow>
        <torusGeometry args={[0.32, 0.12, 20, 40]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Hub */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.14, 6]} />
        <meshStandardMaterial color="#c0c0d0" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Spokes */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <mesh key={angle} rotation={[0, 0, (angle * Math.PI) / 180]} castShadow>
          <boxGeometry args={[0.28, 0.03, 0.05]} />
          <meshStandardMaterial color="#d0d0e0" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      {/* Brake disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.20, 0.20, 0.02, 32]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

/* ── Headlight glow ── */
function Headlight({ position, color = '#a0c8ff' }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={3} decay={2} />
    </group>
  );
}

/* ── Tail light ── */
function TailLight({ position }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#ff2020" emissive="#ff1010" emissiveIntensity={4} />
      </mesh>
      <pointLight color="#ff2020" intensity={0.8} distance={1.5} decay={2} />
    </group>
  );
}

/* ── Main Car Body ── */
export default function CarModel({ isDark }) {
  const groupRef = useRef();
  const bodyColor  = isDark ? '#3a3aee' : '#4f46e5';
  const glassColor = isDark ? '#80c8ff' : '#a0d8ff';

  // Gentle auto-rotate + slight bob
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.25;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>

      {/* ── Lower body / chassis ── */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[2.0, 0.36, 0.88]} />
        <meshStandardMaterial color={bodyColor} roughness={0.15} metalness={0.7} />
      </mesh>

      {/* ── Side sill / skirt ── */}
      {[-0.46, 0.46].map((z) => (
        <mesh key={z} castShadow position={[0, 0.05, z]}>
          <boxGeometry args={[1.9, 0.12, 0.06]} />
          <meshStandardMaterial color="#222" roughness={0.7} metalness={0.3} />
        </mesh>
      ))}

      {/* ── Upper cabin ── */}
      <mesh castShadow receiveShadow position={[-0.05, 0.55, 0]}>
        <boxGeometry args={[1.1, 0.38, 0.82]} />
        <meshStandardMaterial color={bodyColor} roughness={0.15} metalness={0.7} />
      </mesh>

      {/* ── Roof slope front ── */}
      <mesh castShadow position={[0.46, 0.47, 0]} rotation={[0, 0, -0.52]}>
        <boxGeometry args={[0.36, 0.08, 0.82]} />
        <meshStandardMaterial color={bodyColor} roughness={0.15} metalness={0.7} />
      </mesh>

      {/* ── Roof slope rear ── */}
      <mesh castShadow position={[-0.46, 0.47, 0]} rotation={[0, 0, 0.52]}>
        <boxGeometry args={[0.36, 0.08, 0.82]} />
        <meshStandardMaterial color={bodyColor} roughness={0.15} metalness={0.7} />
      </mesh>

      {/* ── Front hood slope ── */}
      <mesh castShadow position={[0.85, 0.30, 0]} rotation={[0, 0, -0.30]}>
        <boxGeometry args={[0.46, 0.08, 0.82]} />
        <meshStandardMaterial color={bodyColor} roughness={0.15} metalness={0.7} />
      </mesh>

      {/* ── Rear trunk slope ── */}
      <mesh castShadow position={[-0.80, 0.30, 0]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[0.40, 0.08, 0.82]} />
        <meshStandardMaterial color={bodyColor} roughness={0.15} metalness={0.7} />
      </mesh>

      {/* ── Windshield ── */}
      <mesh position={[0.45, 0.54, 0]}>
        <boxGeometry args={[0.02, 0.34, 0.74]} />
        <meshStandardMaterial color={glassColor} roughness={0.0} metalness={0.2} transparent opacity={0.45} />
      </mesh>

      {/* ── Rear glass ── */}
      <mesh position={[-0.44, 0.54, 0]}>
        <boxGeometry args={[0.02, 0.28, 0.74]} />
        <meshStandardMaterial color={glassColor} roughness={0.0} metalness={0.2} transparent opacity={0.35} />
      </mesh>

      {/* ── Side windows ── */}
      {[-0.42, 0.42].map((z) => (
        <mesh key={z} position={[-0.05, 0.55, z]}>
          <boxGeometry args={[0.96, 0.30, 0.02]} />
          <meshStandardMaterial color={glassColor} roughness={0.0} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* ── Front bumper ── */}
      <mesh castShadow position={[1.04, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.20, 0.82]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* ── Grille ── */}
      <mesh position={[1.04, 0.22, 0]}>
        <boxGeometry args={[0.06, 0.10, 0.55]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* ── Rear bumper ── */}
      <mesh castShadow position={[-1.04, 0.12, 0]}>
        <boxGeometry args={[0.08, 0.20, 0.82]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* ── Headlights ── */}
      <Headlight position={[1.02, 0.27, 0.28]} />
      <Headlight position={[1.02, 0.27, -0.28]} />

      {/* ── Tail lights ── */}
      <TailLight position={[-1.02, 0.27, 0.26]} />
      <TailLight position={[-1.02, 0.27, -0.26]} />

      {/* ── Door handles ── */}
      {[-0.42, 0.42].map((z) => (
        <mesh key={z} position={[0.12, 0.36, z]}>
          <boxGeometry args={[0.16, 0.03, 0.02]} />
          <meshStandardMaterial color="#ccc" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* ── Side mirrors ── */}
      {[-0.47, 0.47].map((z) => (
        <group key={z} position={[0.46, 0.54, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.06, 0.04]} />
            <meshStandardMaterial color={bodyColor} roughness={0.2} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ── Wheels ── */}
      <Wheel position={[ 0.70, -0.06,  0.47]} />
      <Wheel position={[ 0.70, -0.06, -0.47]} />
      <Wheel position={[-0.70, -0.06,  0.47]} />
      <Wheel position={[-0.70, -0.06, -0.47]} />

      {/* ── Underbody ── */}
      <mesh receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[1.7, 0.06, 0.78]} />
        <meshStandardMaterial color="#111" roughness={1} metalness={0} />
      </mesh>

      {/* ── Exhaust ── */}
      <mesh position={[-1.0, -0.04, 0.24]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.16, 12]} />
        <meshStandardMaterial color="#888" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  );
}
