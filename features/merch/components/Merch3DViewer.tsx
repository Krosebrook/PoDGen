import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Float, Decal, ContactShadows, PerspectiveCamera, Environment, Html } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { Spinner } from '@/shared/components/ui/Spinner';
import { MonitorX, Upload, Trash2, Layers, Download, Grid3X3, Smartphone, RotateCcw } from 'lucide-react';
import { Button, Tooltip } from '@/shared/components/ui';
import { readImageFile } from '@/shared/utils/file';

interface Merch3DViewerProps {
  logo: string;
  productName: string;
}

const MATERIAL_PRESETS = [
  { id: 'matte', label: 'Matte Plastic', roughness: 0.8, metalness: 0.1, color: '#f0f0f0' },
  { id: 'glossy', label: 'Glossy Ceramic', roughness: 0.1, metalness: 0.2, color: '#ffffff' },
  { id: 'brushed', label: 'Brushed Metal', roughness: 0.4, metalness: 0.9, color: '#cccccc' },
  { id: 'leather', label: 'Fine Leather', roughness: 0.9, metalness: 0.0, color: '#2a1a10' },
  { id: 'fabric', label: 'Woven Fabric', roughness: 1.0, metalness: 0.0, color: '#4a4a4a' }
];

const getProductShape = (name: string): 'cylinder' | 'box' | 'plane' | 'disk' => {
  const n = name.toLowerCase();
  if (n.includes('mug') || n.includes('bottle') || n.includes('tumbler')) return 'cylinder';
  if (n.includes('sticker') || n.includes('coaster') || n.includes('pin')) return 'disk';
  if (n.includes('poster') || n.includes('canvas')) return 'plane';
  return 'box'; 
};

/**
 * ProductMesh: The core 3D object renderer.
 * Optimized to update texture tiling without re-loading the image data.
 */
const ProductMesh: React.FC<{ 
  logo: string; 
  textureMap: string | null;
  shape: string; 
  preset: typeof MATERIAL_PRESETS[0];
  tiling: number;
  onError: (err: string) => void 
}> = ({ logo, textureMap, shape, preset, tiling, onError }) => {
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);
  const [customTexture, setCustomTexture] = useState<THREE.Texture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Logo Texture Handling
  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(logo, (tex) => {
      if (!isMounted) return;
      tex.anisotropy = 16;
      setLogoTexture(tex);
    }, undefined, () => {
      if (isMounted) onError("TEXTURE_LOAD_FAILURE: Could not map logo asset to 3D surface.");
    });
    return () => {
      isMounted = false;
      logoTexture?.dispose();
    };
  }, [logo]);

  // Custom Texture Map Handling
  useEffect(() => {
    if (!textureMap) {
      setCustomTexture(null);
      return;
    }
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(textureMap, (tex) => {
      if (!isMounted) return;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(tiling, tiling);
      tex.anisotropy = 16;
      setCustomTexture(tex);
    }, undefined, () => {
      if (isMounted) onError("MATERIAL_ERROR: Custom texture mapping failed.");
    });
    return () => {
      isMounted = false;
      customTexture?.dispose();
    };
  }, [textureMap]);

  // Reactive tiling updates (no reload)
  useEffect(() => {
    if (customTexture) {
      customTexture.repeat.set(tiling, tiling);
      customTexture.needsUpdate = true;
    }
  }, [tiling, customTexture]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle atmospheric rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.04;
    }
  });

  const decalScale = useMemo(() => {
    switch(shape) {
      case 'cylinder': return [1.1, 1.1, 1.1];
      case 'disk': return [1.4, 1.4, 1.4];
      case 'plane': return [1.8, 1.8, 1.8];
      default: return [1.5, 1.5, 1.5];
    }
  }, [shape]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {shape === 'cylinder' && <cylinderGeometry args={[0.9, 0.9, 2.4, 64]} />}
      {shape === 'disk' && <cylinderGeometry args={[1, 1, 0.2, 64]} />}
      {shape === 'plane' && <boxGeometry args={[2, 2.8, 0.05]} />}
      {shape === 'box' && <boxGeometry args={[2.2, 2.2, 0.5]} />}
      
      <meshStandardMaterial 
        color={customTexture ? "#ffffff" : preset.color} 
        map={customTexture}
        roughness={preset.roughness} 
        metalness={preset.metalness} 
      />
      
      {logoTexture && (
        <Decal 
          position={shape === 'disk' ? [0, 0.11, 0] : [0, 0, shape === 'cylinder' ? 0.91 : (shape === 'box' ? 0.26 : 0.031)]} 
          rotation={shape === 'disk' ? [-Math.PI / 2, 0, 0] : [0, 0, 0]} 
          scale={decalScale as [number, number, number]} 
        >
          <meshStandardMaterial 
            map={logoTexture} 
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

const Scene = ({ logo, productName, textureMap, preset, tiling, onError, isExporting, onExportComplete }: any) => {
  const { scene } = useThree();

  useEffect(() => {
    if (isExporting) {
      const exporter = new GLTFExporter();
      exporter.parse(scene, (result) => {
        const output = result instanceof ArrayBuffer ? result : JSON.stringify(result);
        const blob = new Blob([output], { type: result instanceof ArrayBuffer ? 'model/gltf-binary' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${productName.replace(/\s+/g, '-').toLowerCase()}-mockup.glb`;
        link.click();
        onExportComplete();
      }, () => onExportComplete(), { binary: true });
    }
  }, [isExporting, scene, productName, onExportComplete]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={35} />
      <Stage environment="studio" intensity={0.5} contactShadow={false} adjustCamera={false}>
        <Float speed={1.5} rotationIntensity={0.2}>
          <ProductMesh 
            logo={logo} 
            textureMap={textureMap} 
            shape={getProductShape(productName)} 
            preset={preset} 
            tiling={tiling} 
            onError={onError} 
          />
        </Float>
      </Stage>
      <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} position={[0, -1.6, 0]} />
      <Environment preset="city" />
      <OrbitControls 
        enableDamping 
        autoRotate={!isExporting} 
        autoRotateSpeed={0.5} 
        minDistance={3} 
        maxDistance={8} 
        enablePan={false}
      />
      <EffectComposer multisampling={4}>
        <N8AO halfRes intensity={1.5} />
        <Bloom luminanceThreshold={1.2} intensity={0.3} />
        <Noise opacity={0.015} />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer>
    </>
  );
};

export const Merch3DViewer: React.FC<Merch3DViewerProps> = ({ logo, productName }) => {
  const [error, setError] = useState<string | null>(null);
  const [textureMap, setTextureMap] = useState<string | null>(null);
  const [textureTiling, setTextureTiling] = useState(2);
  const [currentPreset, setCurrentPreset] = useState(MATERIAL_PRESETS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05070a] p-8 text-center animate-fadeIn">
        <MonitorX className="w-12 h-12 text-red-500 mb-6" />
        <h3 className="text-white font-black uppercase tracking-tighter mb-4">Simulator Halt</h3>
        <p className="text-slate-500 text-xs mb-8 leading-relaxed">{error}</p>
        <Button variant="secondary" onClick={() => setError(null)} icon={<RotateCcw className="w-4 h-4" />}>
          Retry Simulator
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#05070a] rounded-[2.5rem] overflow-hidden group">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <Suspense fallback={<Html center><Spinner className="w-10 h-10 text-blue-500" /></Html>}>
          <Scene 
            logo={logo} 
            productName={productName} 
            textureMap={textureMap} 
            preset={currentPreset} 
            tiling={textureTiling} 
            onError={setError}
            isExporting={isExporting} 
            onExportComplete={() => setIsExporting(false)}
          />
        </Suspense>
      </Canvas>

      {/* Preset Controls */}
      <div className="absolute top-24 left-8 flex flex-col gap-2 z-30">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Material Base</span>
        {MATERIAL_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentPreset(p)}
            className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
              currentPreset.id === p.id 
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg' 
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Surface Engineering Panel */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-30 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 p-4 rounded-3xl min-w-[320px] pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-4 h-4 text-blue-400" />
            <div className="flex-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Surface Engineering</span>
              <span className="text-[10px] text-slate-300 font-black uppercase tracking-wider">{textureMap ? 'Custom UV Active' : 'Procedural Shader'}</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setIsUploading(true);
                  try { 
                    setTextureMap(await readImageFile(file)); 
                  } catch (err) {
                    setError("UPLOAD_FAILURE: Could not process texture file.");
                  } finally { 
                    setIsUploading(false); 
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }
              }} 
            />
            <Tooltip content="Upload custom PBR texture map">
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all active:scale-95">
                {isUploading ? <Spinner className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              </button>
            </Tooltip>
            {textureMap && (
              <Tooltip content="Revert to base material">
                <button onClick={() => setTextureMap(null)} className="p-2.5 bg-slate-800 text-red-500 hover:bg-red-500/10 rounded-xl border border-slate-700 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>
            )}
          </div>
          {textureMap && (
            <div className="space-y-3 pt-3 border-t border-white/5 animate-fadeIn">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-400">
                <span className="flex items-center gap-2"><Grid3X3 className="w-3.5 h-3.5" /> Texture Tiling</span>
                <span className="bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">{textureTiling.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="1" max="10" step="0.5" 
                value={textureTiling} 
                onChange={(e) => setTextureTiling(parseFloat(e.target.value))} 
                className="w-full accent-blue-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:accent-blue-400 transition-all" 
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 items-end pointer-events-auto">
          <Tooltip content="Export the current 3D scene as a GLB asset">
            <button 
              onClick={() => setIsExporting(true)} 
              disabled={isExporting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              {isExporting ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              Export GLB Asset
            </button>
          </Tooltip>
          <div className="bg-blue-600/20 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2.5 shadow-xl">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[9px] font-black tracking-[0.2em] text-blue-200 uppercase">Interactive Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};