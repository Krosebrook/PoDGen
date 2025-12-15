
import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture, Float, Decal, RenderTexture, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Spinner } from '@/shared/components/ui';

interface Merch3DViewerProps {
  logo: string;
  productName: string;
}

// Helper to infer shape from product name
const getProductShape = (name: string): 'cylinder' | 'box' | 'plane' | 'disk' => {
  const n = name.toLowerCase();
  if (n.includes('mug') || n.includes('bottle') || n.includes('tumbler') || n.includes('cup') || n.includes('can')) return 'cylinder';
  if (n.includes('sticker') || n.includes('coaster') || n.includes('pin') || n.includes('button')) return 'disk';
  if (n.includes('poster') || n.includes('canvas') || n.includes('art') || n.includes('print')) return 'plane';
  return 'box'; // Default for shirts (folded), hoodies, packaging, generic
};

const ProductMesh: React.FC<{ logo: string; shape: string }> = ({ logo, shape }) => {
  const texture = useTexture(logo);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Rotate mesh slowly
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  const materialProps = {
    color: "#ffffff",
    roughness: 0.5,
    metalness: 0.1,
  };

  // Center the texture
  texture.center.set(0.5, 0.5);

  switch (shape) {
    case 'cylinder':
      return (
        <mesh ref={meshRef} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 2.2, 32]} />
          <meshStandardMaterial {...materialProps} />
          <Decal 
            position={[0, 0, 0.8]} 
            rotation={[0, 0, 0]} 
            scale={[1, 1, 1]} 
            map={texture} 
          />
        </mesh>
      );
    case 'disk':
        return (
          <mesh ref={meshRef} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1, 1, 0.1, 32]} />
            <meshStandardMaterial {...materialProps} />
            <Decal 
              position={[0, 0.06, 0]} 
              rotation={[-Math.PI / 2, 0, 0]} 
              scale={[1.2, 1.2, 1.2]} 
              map={texture} 
            />
          </mesh>
        );
    case 'plane':
        return (
          <mesh ref={meshRef} castShadow receiveShadow>
            <boxGeometry args={[2, 2.8, 0.05]} />
            <meshStandardMaterial {...materialProps} />
            <Decal 
              position={[0, 0, 0.03]} 
              rotation={[0, 0, 0]} 
              scale={[1.5, 1.5, 1.5]} 
              map={texture} 
            />
          </mesh>
        );
    default: // Box
      return (
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial {...materialProps} />
          <Decal 
            position={[0, 0, 1]} 
            rotation={[0, 0, 0]} 
            scale={[1.2, 1.2, 1.2]} 
            map={texture} 
          />
        </mesh>
      );
  }
};

export const Merch3DViewer: React.FC<Merch3DViewerProps> = ({ logo, productName }) => {
  const shape = getProductShape(productName);

  return (
    <div className="w-full h-full relative bg-slate-900 rounded-lg overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} castShadow={false}>
            <Float
               speed={2} 
               rotationIntensity={0.5} 
               floatIntensity={0.5} 
            >
               <ProductMesh logo={logo} shape={shape} />
            </Float>
          </Stage>
          <OrbitControls autoRotate autoRotateSpeed={0.5} makeDefault />
        </Suspense>
      </Canvas>
      
      {/* Loading Overlay (handled by Suspense fallback usually, but explicit here for initial load) */}
      <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-mono backdrop-blur-md pointer-events-none">
        3D Inspector • {shape.toUpperCase()}
      </div>
    </div>
  );
};
