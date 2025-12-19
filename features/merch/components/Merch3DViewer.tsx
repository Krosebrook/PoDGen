
import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture, Float, Decal, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Spinner } from '@/shared/components/ui/Spinner';

interface Merch3DViewerProps {
  logo: string;
  productName: string;
}

const getProductShape = (name: string): 'cylinder' | 'box' | 'plane' | 'disk' => {
  const n = name.toLowerCase();
  if (n.includes('mug') || n.includes('bottle') || n.includes('tumbler') || n.includes('cup') || n.includes('can')) return 'cylinder';
  if (n.includes('sticker') || n.includes('coaster') || n.includes('pin') || n.includes('button')) return 'disk';
  if (n.includes('poster') || n.includes('canvas') || n.includes('art') || n.includes('print')) return 'plane';
  return 'box'; 
};

const ProductMesh: React.FC<{ logo: string; shape: string }> = ({ logo, shape }) => {
  const texture = useTexture(logo);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
    }
  });

  const materialProps = useMemo(() => ({
    color: "#ffffff",
    roughness: 0.15,
    metalness: 0.05,
    envMapIntensity: 1.5,
  }), []);

  useMemo(() => {
    texture.center.set(0.5, 0.5);
    texture.anisotropy = 16;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
  }, [texture]);

  const decalScale = useMemo(() => {
    switch(shape) {
      case 'cylinder': return [1.2, 1.2, 1.2];
      case 'disk': return [1.4, 1.4, 1.4];
      case 'plane': return [1.8, 1.8, 1.8];
      default: return [1.5, 1.5, 1.5];
    }
  }, [shape]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {shape === 'cylinder' && <cylinderGeometry args={[0.9, 0.9, 2.4, 64]} />}
      {shape === 'disk' && <cylinderGeometry args={[1, 1, 0.1, 64]} />}
      {shape === 'plane' && <boxGeometry args={[2, 2.8, 0.05]} />}
      {shape === 'box' && <boxGeometry args={[2.2, 2.2, 0.5]} />}
      
      <meshStandardMaterial {...materialProps} />
      
      <Decal 
        position={shape === 'disk' ? [0, 0.06, 0] : [0, 0, shape === 'cylinder' ? 0.91 : (shape === 'box' ? 0.26 : 0.03)]} 
        rotation={shape === 'disk' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]} 
        scale={decalScale as [number, number, number]} 
      >
        <meshStandardMaterial 
          map={texture} 
          transparent 
          polygonOffset 
          polygonOffsetFactor={-10} 
          roughness={0.2}
          metalness={0.1}
        />
      </Decal>
    </mesh>
  );
};

export const Merch3DViewer: React.FC<Merch3DViewerProps> = ({ logo, productName }) => {
  const shape = getProductShape(productName);

  return (
    <div className="w-full h-full relative bg-[#05070a] rounded-[2.5rem] overflow-hidden group cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={35} />
        
        <Suspense fallback={null}>
          <Stage 
            environment="studio" 
            intensity={0.8} 
            contactShadow={false}
            adjustCamera={false}
            preset="rembrandt"
          >
            <Float
               speed={2} 
               rotationIntensity={0.2} 
               floatIntensity={0.3} 
            >
               <ProductMesh logo={logo} shape={shape} />
            </Float>
          </Stage>
          
          <ContactShadows 
            opacity={0.6} 
            scale={12} 
            blur={3} 
            far={5} 
            resolution={512} 
            color="#000000" 
            position={[0, -1.5, 0]}
          />

          <Environment preset="city" blur={1} />

          <EffectComposer disableNormalPass multisampling={4}>
            <N8AO 
              halfRes 
              color="black" 
              aoRadius={2} 
              intensity={2} 
            />
            <Bloom 
              luminanceThreshold={1.2} 
              mipmapBlur 
              intensity={0.4} 
              radius={0.3} 
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

          <OrbitControls 
            enableDamping 
            dampingFactor={0.08}
            minDistance={3}
            maxDistance={10}
            autoRotate
            autoRotateSpeed={0.5}
            enablePan={false}
          />
        </Suspense>
      </Canvas>
      
      {/* UI Overlays */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-3 pointer-events-none">
        <div className="bg-blue-600 px-5 py-2 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/30">
          <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">Interactive 3D</span>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-md text-[9px] font-bold text-slate-400 px-4 py-1.5 rounded-xl border border-slate-800 uppercase tracking-widest">
          Geometry: {shape}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-black/40 backdrop-blur-2xl px-8 py-3 rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-700 shadow-2xl scale-95 group-hover:scale-100">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Orbit</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zoom</span>
        </div>
      </div>
    </div>
  );
};
