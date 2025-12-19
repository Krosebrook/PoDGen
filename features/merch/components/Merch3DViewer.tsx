
import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture, Float, Decal, ContactShadows, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Spinner } from '@/shared/components/ui/Spinner';
import { AlertCircle, RotateCcw, MonitorX, Box, Cpu } from 'lucide-react';
import { Button } from '@/shared/components/ui';

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

const checkWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

const ProductMesh: React.FC<{ logo: string; shape: string; onError: (err: string) => void }> = ({ logo, shape, onError }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Use raw texture loader for better error control than useTexture hook
  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      logo,
      (tex) => {
        if (isMounted) {
          tex.anisotropy = 16;
          setTexture(tex);
        }
      },
      undefined,
      (err) => {
        if (isMounted) {
          setLoadError(true);
          onError("TEXTURE_MAPPING_ERROR: Asset incompatible with 3D context.");
        }
      }
    );
    return () => { isMounted = false; };
  }, [logo, onError]);

  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
    }
  });

  const decalScale = useMemo(() => {
    switch(shape) {
      case 'cylinder': return [1.2, 1.2, 1.2];
      case 'disk': return [1.4, 1.4, 1.4];
      case 'plane': return [1.8, 1.8, 1.8];
      default: return [1.5, 1.5, 1.5];
    }
  }, [shape]);

  if (loadError) return null;

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {shape === 'cylinder' && <cylinderGeometry args={[0.9, 0.9, 2.4, 64]} />}
      {shape === 'disk' && <cylinderGeometry args={[1, 1, 0.1, 64]} />}
      {shape === 'plane' && <boxGeometry args={[2, 2.8, 0.05]} />}
      {shape === 'box' && <boxGeometry args={[2.2, 2.2, 0.5]} />}
      
      <meshStandardMaterial color="#ffffff" roughness={0.15} metalness={0.05} />
      
      {texture && (
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
      )}
    </mesh>
  );
};

export const Merch3DViewer: React.FC<Merch3DViewerProps> = ({ logo, productName }) => {
  const [error, setError] = useState<string | null>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const shape = getProductShape(productName);

  useEffect(() => {
    if (!checkWebGLSupport()) {
      setHasWebGL(false);
      setError("WEBGL_NOT_SUPPORTED: Hardware acceleration required for 3D inspection.");
    }
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05070a] p-8 text-center animate-fadeIn">
        <div className="mb-8 relative">
           <div className="absolute inset-0 bg-red-500 blur-[80px] opacity-10" />
           <div className="w-24 h-24 bg-slate-900 rounded-3xl border border-red-500/30 flex items-center justify-center relative">
              {hasWebGL ? <Box className="w-10 h-10 text-red-500" /> : <MonitorX className="w-10 h-10 text-red-500" />}
           </div>
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Pipeline Halted</h3>
        <p className="text-slate-500 text-xs max-w-xs mb-8 leading-relaxed font-medium">{error}</p>
        <div className="grid grid-cols-1 gap-4 w-full max-w-xs text-left">
           <DiagnosticTip icon={<Cpu className="w-3.5 h-3.5" />} title="System Conflict" suggestion="Try enabling hardware acceleration in browser settings." />
           <DiagnosticTip icon={<RotateCcw className="w-3.5 h-3.5" />} title="VRAM Exhaustion" suggestion="The logo resolution might be too high for the current GPU buffer." />
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()} className="mt-10" icon={<RotateCcw className="w-4 h-4" />}>
          Reset Engine
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#05070a] rounded-[2.5rem] overflow-hidden group cursor-grab active:cursor-grabbing">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#05070a');
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={35} />
        <Suspense fallback={null}>
          <Stage environment="studio" intensity={0.8} contactShadow={false} adjustCamera={false} preset="rembrandt">
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
               <ProductMesh key={logo.substring(0, 32)} logo={logo} shape={shape} onError={setError} />
            </Float>
          </Stage>
          <ContactShadows opacity={0.6} scale={12} blur={3} far={5} resolution={512} color="#000000" position={[0, -1.5, 0]} />
          <Environment preset="city" blur={1} />
          <EffectComposer disableNormalPass multisampling={4}>
            <N8AO halfRes color="black" aoRadius={2} intensity={2} />
            <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.4} radius={0.3} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
          <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={10} autoRotate autoRotateSpeed={0.5} enablePan={false} />
        </Suspense>
      </Canvas>
      <div className="absolute top-8 right-8 flex flex-col items-end gap-3 pointer-events-none">
        <div className="bg-blue-600 px-5 py-2 rounded-full shadow-xl border border-blue-400/30">
          <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">Active 3D</span>
        </div>
      </div>
    </div>
  );
};

const DiagnosticTip: React.FC<{ icon: React.ReactNode; title: string; suggestion: string }> = ({ icon, title, suggestion }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 shadow-sm group">
     <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-slate-400 group-hover:text-blue-400 transition-colors">
        {icon}
     </div>
     <div>
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">{title}</span>
       <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{suggestion}</p>
     </div>
  </div>
);
