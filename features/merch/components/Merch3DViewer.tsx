import React, { Suspense, useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, useTexture, Float, Decal, ContactShadows, PerspectiveCamera, Environment, Html } from '@react-three/drei';
import { EffectComposer, N8AO, Bloom, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { Spinner } from '@/shared/components/ui/Spinner';
import { AlertCircle, RotateCcw, MonitorX, Box, Cpu, Palette, Upload, Trash2, Layers, Download, Check, Sparkles, Smartphone, Grid3X3, Ruler } from 'lucide-react';
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
  { id: 'leather', label: 'Fine Leather', roughness: 0.9, metalness: 0.0, color: '#2a1a10', map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/floors/FloorsCheckerboard_S_Diffuse.jpg' },
  { id: 'fabric', label: 'Woven Fabric', roughness: 1.0, metalness: 0.0, color: '#4a4a4a', map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/lava/lavatile.jpg' }
];

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
  const [loadError, setLoadError] = useState(false);

  // Logo Texture Loader
  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(logo, (tex) => {
      if (isMounted) {
        tex.anisotropy = 16;
        setLogoTexture(tex);
      }
    }, undefined, () => {
      if (isMounted) {
        setLoadError(true);
        onError("TEXTURE_MAPPING_ERROR: Logo asset incompatible.");
      }
    });
    return () => { isMounted = false; };
  }, [logo, onError]);

  // Custom Texture Loader
  useEffect(() => {
    if (!textureMap) {
      setCustomTexture(null);
      return;
    }
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.load(textureMap, (tex) => {
      if (isMounted) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(tiling, tiling);
        tex.anisotropy = 16;
        setCustomTexture(tex);
      }
    }, undefined, () => {
      if (isMounted) onError("MATERIAL_ERROR: Texture map failed.");
    });
    return () => { isMounted = false; };
  }, [textureMap, tiling, onError]);

  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
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

  if (loadError) return null;

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
        envMapIntensity={1.5}
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
            roughness={0.1}
            metalness={0.05}
          />
        </Decal>
      )}
    </mesh>
  );
};

const Scene = ({ logo, productName, textureMap, preset, tiling, onError, isExporting, onExportComplete }: any) => {
  const { scene } = useThree();
  const shape = getProductShape(productName);

  useEffect(() => {
    if (isExporting) {
      const exporter = new GLTFExporter();
      exporter.parse(scene, (result) => {
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${productName.replace(/\s+/g, '-').toLowerCase()}-mockup.glb`;
        link.click();
        onExportComplete();
      }, (error) => {
        console.error('Export failed', error);
        onExportComplete();
      }, { binary: true });
    }
  }, [isExporting, scene, productName, onExportComplete]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.5, 5]} fov={35} />
      <Stage environment="studio" intensity={0.5} contactShadow={false} adjustCamera={false} preset="rembrandt">
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
          <ProductMesh 
            logo={logo} 
            textureMap={textureMap}
            shape={shape} 
            preset={preset}
            tiling={tiling}
            onError={onError} 
          />
        </Float>
      </Stage>
      <ContactShadows 
        opacity={0.4} 
        scale={10} 
        blur={2.5} 
        far={4} 
        resolution={1024} 
        color="#000000" 
        position={[0, -1.6, 0]} 
      />
      <Environment preset="city" blur={0.8} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.1} 
        minDistance={3} 
        maxDistance={8} 
        autoRotate={!isExporting} 
        autoRotateSpeed={0.5} 
        enablePan={false}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
      <EffectComposer disableNormalPass multisampling={4}>
        <N8AO halfRes color="black" aoRadius={2} intensity={1.5} />
        <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.3} radius={0.2} />
        {textureMap && <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={3} height={480} />}
        <Noise opacity={0.015} />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer>
    </>
  );
};

export const Merch3DViewer: React.FC<Merch3DViewerProps> = ({ logo, productName }) => {
  const [error, setError] = useState<string | null>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [textureMap, setTextureMap] = useState<string | null>(null);
  const [textureTiling, setTextureTiling] = useState(2);
  const [currentPreset, setCurrentPreset] = useState(MATERIAL_PRESETS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!checkWebGLSupport()) {
      setHasWebGL(false);
      setError("WEBGL_NOT_SUPPORTED: 3D context unavailable.");
    }
  }, []);

  const handleTextureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const b64 = await readImageFile(file);
      setTextureMap(b64);
    } catch (err) {
      setError("UPLOAD_FAILURE: Could not process texture map.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#05070a] p-8 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl border border-red-500/30 flex items-center justify-center mb-6">
          <MonitorX className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">Engine Halt</h3>
        <p className="text-slate-500 text-xs mb-8 font-medium">{error}</p>
        <Button variant="secondary" onClick={() => window.location.reload()} icon={<RotateCcw className="w-4 h-4" />}>
          Reload Simulator
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#05070a] rounded-[2.5rem] overflow-hidden group">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => gl.setClearColor('#05070a')}
      >
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

      {/* Material Presets Floating UI */}
      <div className="absolute top-24 left-8 flex flex-col gap-3 pointer-events-auto max-w-[140px] z-30">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Material Finish</span>
        <div className="flex flex-col gap-2">
          {MATERIAL_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setCurrentPreset(p)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-left transition-all border ${
                currentPreset.id === p.id 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Control Panel */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none z-30">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 p-4 rounded-3xl shadow-2xl flex flex-col gap-4 pointer-events-auto min-w-[320px]">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400 border border-blue-500/20 shadow-inner">
                  <Layers className="w-4 h-4" />
              </div>
              <div className="px-1 flex-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Surface Engineering</span>
                  <span className="text-[10px] text-slate-300 font-black uppercase tracking-wider">{textureMap ? 'Custom UV Map Active' : 'Procedural Shader'}</span>
              </div>
              <div className="flex gap-1.5">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleTextureUpload} />
                  <Tooltip content="Upload custom PBR surface texture to replace current material">
                    <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg shadow-blue-600/20">
                      {isUploading ? <Spinner className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                    </button>
                  </Tooltip>
                  {textureMap && (
                    <Tooltip content="Remove custom texture and revert to base material">
                      <button onClick={() => setTextureMap(null)} className="w-10 h-10 bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-xl flex items-center justify-center transition-all border border-slate-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  )}
              </div>
           </div>

           {textureMap && (
             <div className="px-1 pb-1 space-y-3 border-t border-white/5 pt-4 animate-fadeIn">
               <div className="flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Grid3X3 className="w-3.5 h-3.5 text-blue-500/60" /> Texture Tiling (Repeat)
                 </span>
                 <span className="text-[10px] font-mono text-blue-400 font-black bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{textureTiling.toFixed(1)}x</span>
               </div>
               <div className="relative group/slider">
                 <input 
                    type="range" min="1" max="10" step="0.5" value={textureTiling}
                    onChange={(e) => setTextureTiling(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-slate-800 rounded-lg cursor-pointer appearance-none hover:accent-blue-400 transition-all"
                 />
                 <div className="flex justify-between px-1 mt-2">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">1x</span>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">10x</span>
                 </div>
               </div>
             </div>
           )}
        </div>

        <div className="flex flex-col gap-3 items-end pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 p-2 rounded-2xl flex gap-2 shadow-2xl">
             <Tooltip content="Export the current scene as a .glb asset for professional 3D pipelines">
                <button 
                  onClick={() => setIsExporting(true)}
                  disabled={isExporting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center gap-2.5 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                >
                  {isExporting ? <Spinner className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  Export GLB
                </button>
             </Tooltip>
          </div>
          <div className="bg-blue-600/20 backdrop-blur-md px-4 py-2 rounded-full border border-blue-500/30 flex items-center gap-2.5 shadow-xl">
             <Smartphone className="w-3.5 h-3.5 text-blue-400" />
             <span className="text-[9px] font-black tracking-[0.2em] text-blue-200 uppercase">Interactive Viewport</span>
          </div>
        </div>
      </div>
    </div>
  );
};