import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Download, Calculator, Box, CheckCircle, Rotate3D, AlertCircle, Loader2, Palette, Info, Layers, ShieldAlert, Clock, Brush, Coins, ShoppingCart, Lock, Gavel, CheckSquare, Square, Scale } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { supabase } from '../supabaseClient';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types';

// --- Web Worker Code for STL Parsing (Volume + Surface) ---
const workerCode = `
self.onmessage = function(e) {
  const url = e.data;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';

  xhr.onprogress = function(event) {
    if (event.lengthComputable) {
      self.postMessage({ type: 'progress', loaded: event.loaded, total: event.total });
    }
  };

  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        const buffer = xhr.response;
        const view = new DataView(buffer);
        const triangles = view.getUint32(80, true);
        
        // Safety check
        if (buffer.byteLength < 84 + triangles * 50) {
            throw new Error("Fichier STL corrompu.");
        }
        
        const positions = new Float32Array(triangles * 9);
        let offset = 84;
        let posIdx = 0;
        let totalArea = 0;
        let totalVolume = 0;
        
        for (let i = 0; i < triangles; i++) {
          offset += 12; // Skip Normal

          // Vertices extraction
          const v1x = view.getFloat32(offset, true);
          const v1y = view.getFloat32(offset + 4, true);
          const v1z = view.getFloat32(offset + 8, true);
          offset += 12;

          const v2x = view.getFloat32(offset, true);
          const v2y = view.getFloat32(offset + 4, true);
          const v2z = view.getFloat32(offset + 8, true);
          offset += 12;

          const v3x = view.getFloat32(offset, true);
          const v3y = view.getFloat32(offset + 4, true);
          const v3z = view.getFloat32(offset + 8, true);
          offset += 12;

          offset += 2; // Attribute byte count

          // Buffer filling
          positions[posIdx++] = v1x; positions[posIdx++] = v1y; positions[posIdx++] = v1z;
          positions[posIdx++] = v2x; positions[posIdx++] = v2y; positions[posIdx++] = v2z;
          positions[posIdx++] = v3x; positions[posIdx++] = v3y; positions[posIdx++] = v3z;

          // --- SURFACE AREA CALCULATION (Cross Product / 2) ---
          const abx = v2x - v1x; const aby = v2y - v1y; const abz = v2z - v1z;
          const acx = v3x - v1x; const acy = v3y - v1y; const acz = v3z - v1z;
          const crossX = aby * acz - abz * acy;
          const crossY = abz * acx - abx * acz;
          const crossZ = abx * acy - aby * acx;
          totalArea += 0.5 * Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);

          // --- SIGNED VOLUME CALCULATION (Dot Product of V1 . Cross(V2, V3)) / 6 ---
          const cpX = v2y * v3z - v2z * v3y;
          const cpY = v2z * v3x - v2x * v3z;
          const cpZ = v2x * v3y - v2y * v3x;
          totalVolume += (v1x * cpX + v1y * cpY + v1z * cpZ) / 6;
        }

        self.postMessage({ 
            type: 'complete', 
            positions: positions, 
            surfaceArea: totalArea, 
            volume: Math.abs(totalVolume) 
        }, [positions.buffer]);
        
      } catch (err) {
        self.postMessage({ type: 'error', message: err.message });
      }
    } else {
      self.postMessage({ type: 'error', message: 'Erreur réseau.' });
    }
  };
  xhr.send();
};
`;

interface PrintingMaterial {
  id: string;
  name: string;
  type: string;
  density: number;
  cost_per_gram: number;
  color_hex: string;
}

interface QuoteDetails {
    materialCost: number;
    machineCost: number;
    paintCost: number;
    setupFee: number;
    total: number;
    paintHours: number;
    weight: number;
}

const DEFAULT_MATERIALS: PrintingMaterial[] = [
  { id: 'pla-orange', name: 'PLA Premium (Orange)', type: 'STANDARD', density: 1.24, cost_per_gram: 0.15, color_hex: 'F39C12' },
  { id: 'resin-grey', name: 'Résine 8K (Gris)', type: 'RESINE', density: 1.15, cost_per_gram: 0.35, color_hex: '808080' },
];

const FINISHES = [
  { id: 'raw', name: 'Brut (Supports retirés)', painting: false },
  { id: 'primed', name: 'Apprêté (Prêt à peindre)', painting: false },
  { id: 'painted', name: 'Peinture Art (Main)', painting: true },
];

const STLViewer: React.FC<{ url: string; color: string; onAnalyzed?: (area: number, volume: number) => void }> = ({ url, color, onAnalyzed }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const workerRef = useRef<Worker | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).color.setHex(parseInt(color, 16));
    }
  }, [color]);

  useEffect(() => {
    if (!mountRef.current) return;

    setLoading(true);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151921);
    
    // Lighting
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(50, 50, 100);
    scene.add(dirLight);
    scene.add(new THREE.AmbientLight(0x404040));

    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;

    // Worker Init
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, positions, surfaceArea, volume, loaded, total } = e.data;
      if (type === 'progress') setProgress((loaded / total) * 100);
      else if (type === 'complete') {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.computeVertexNormals();
        geometry.center();
        
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
            const size = new THREE.Vector3();
            geometry.boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            camera.position.z = maxDim * 2.5;
        }

        const material = new THREE.MeshStandardMaterial({ 
            color: parseInt(color, 16), 
            roughness: 0.5, 
            metalness: 0.1 
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        meshRef.current = mesh;
        scene.add(mesh);
        
        setLoading(false);
        if (onAnalyzed) onAnalyzed(surfaceArea, volume);
      }
    };
    worker.postMessage(url);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      worker.terminate();
      if (mountRef.current) mountRef.current.innerHTML = '';
      renderer.dispose();
    };
  }, [url]);

  return (
    <div ref={mountRef} className="w-full h-full relative">
       {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white">
             <Loader2 className="animate-spin mb-2 text-manu-orange" />
             <span className="text-xs">Analyse géométrique {Math.round(progress)}%</span>
          </div>
       )}
    </div>
  );
};

const B2BService: React.FC = () => {
  const { addToCart } = useCart();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  // Data from DB
  const [materials, setMaterials] = useState<PrintingMaterial[]>(DEFAULT_MATERIALS);
  const [config, setConfig] = useState<any>({
      hourly_rate_painting: 35,
      hourly_rate_machine: 2.5,
      setup_fee: 5,
      paint_speed_cm2_per_hour: 150
  });

  // User Selection
  const [selectedMat, setSelectedMat] = useState<PrintingMaterial>(DEFAULT_MATERIALS[0]);
  const [selectedFinish, setSelectedFinish] = useState(FINISHES[0]);
  const [quantity, setQuantity] = useState(1);
  const [surfaceMm2, setSurfaceMm2] = useState(0);
  const [volumeMm3, setVolumeMm3] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // LEGAL & COMPLIANCE
  const [legalAccepted, setLegalAccepted] = useState(false);

  // Calculated Quote
  const [quote, setQuote] = useState<QuoteDetails>({
      materialCost: 0, machineCost: 0, paintCost: 0, setupFee: 0, total: 0, paintHours: 0, weight: 0
  });

  // 1. Fetch Config
  useEffect(() => {
      const loadConfig = async () => {
          const { data: mats } = await supabase.from('printing_materials').select('*').eq('active', true);
          const { data: conf } = await supabase.from('site_config').select('*');
          
          if (mats && mats.length > 0) {
             const mappedMats = mats.map((m:any) => ({
                 ...m,
                 color_hex: m.color_hex || 'FFFFFF', // fallback
                 density: Number(m.density),
                 cost_per_gram: Number(m.cost_per_gram)
             }));
             setMaterials(mappedMats);
             setSelectedMat(mappedMats[0]);
          }

          if (conf) {
              const newConfig = { ...config };
              conf.forEach((row:any) => {
                  if(newConfig[row.key] !== undefined) newConfig[row.key] = parseFloat(row.value);
              });
              setConfig(newConfig);
          }
      };
      loadConfig();
  }, []);

  // 2. Handle File
  const processFile = (f: File) => {
      setFile(f);
      setFileUrl(URL.createObjectURL(f));
      setIsAnalyzing(true);
      // Reset
      setSurfaceMm2(0); setVolumeMm3(0);
      setLegalAccepted(false); // Reset legal consent on new file
  };

  const handleAnalysis = (areaMm2: number, volMm3: number) => {
      setSurfaceMm2(areaMm2);
      setVolumeMm3(volMm3);
      setIsAnalyzing(false);
  };

  // 3. Calculate Price
  useEffect(() => {
      if (volumeMm3 === 0) return;

      const volumeCm3 = volumeMm3 / 1000;
      const surfaceCm2 = surfaceMm2 / 100;
      const weightG = volumeCm3 * selectedMat.density;

      // Costs
      const matCost = weightG * selectedMat.cost_per_gram;
      const estimatedPrintHours = Math.max(0.5, weightG / 15); 
      const machineCost = estimatedPrintHours * config.hourly_rate_machine;

      let paintCost = 0;
      let paintHours = 0;

      if (selectedFinish.painting) {
          paintHours = 1 + (surfaceCm2 / config.paint_speed_cm2_per_hour);
          paintCost = paintHours * config.hourly_rate_painting;
      } else if (selectedFinish.id === 'primed') {
          paintCost = 5 + (surfaceCm2 * 0.05);
      }

      const subTotal = matCost + machineCost + paintCost + config.setup_fee;
      const finalTotal = subTotal * quantity;

      setQuote({
          materialCost: matCost * quantity,
          machineCost: machineCost * quantity,
          paintCost: paintCost * quantity,
          setupFee: config.setup_fee,
          total: finalTotal,
          paintHours: paintHours,
          weight: weightG
      });

  }, [volumeMm3, selectedMat, selectedFinish, quantity, config]);

  const handleAddToCart = () => {
      if (!file) return;
      if (!legalAccepted) {
          alert("Veuillez accepter les conditions légales sur la propriété intellectuelle.");
          return;
      }

      const customItem: CartItem = {
          id: Date.now(), // ID temporaire unique
          title: `Projet Unique - ${file.name}`,
          category: 'Service',
          price: `${(quote.total / quantity).toFixed(2)}€`,
          numericPrice: quote.total / quantity,
          image: 'https://via.placeholder.com/150?text=3D+File', // Placeholder pour fichier
          description: `${selectedMat.name} - ${selectedFinish.name}`,
          quantity: quantity,
          type: 'custom',
          weightG: quote.weight,
          customConfig: {
              fileName: file.name,
              materialName: selectedMat.name,
              finishName: selectedFinish.name,
              volumeCm3: volumeMm3 / 1000,
              printHours: 0, // Estimatif
              paintHours: quote.paintHours
          }
      };
      
      addToCart(customItem);
      // Reset after add
      setFile(null);
      setFileUrl(null);
      setVolumeMm3(0);
      setQuantity(1);
      setLegalAccepted(false);
  };

  return (
    <section id="b2b" className="py-12 bg-[#0B0D10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-manu-orange/10 text-manu-orange border border-manu-orange/20 text-xs font-bold uppercase tracking-widest mb-4">
            <Calculator size={14} /> Option Atelier
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Projet <span className="text-manu-orange">Unique</span> & Upload</h2>
          <p className="text-gray-400 text-sm">Téléchargez votre modèle 3D (STL) et obtenez un devis immédiat.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT: UPLOAD & VIEWER (Cols 7) */}
            <div className="lg:col-span-7 space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-xl h-[500px] relative transition-colors ${file ? 'border-gray-700 bg-black' : 'border-gray-700 hover:border-manu-orange bg-[#151921] flex flex-col items-center justify-center cursor-pointer'}`}
                >
                    {!file ? (
                       <>
                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} accept=".stl" />
                         <Upload size={48} className="text-gray-500 mb-4" />
                         <h3 className="text-white font-bold text-lg">Déposez votre fichier STL</h3>
                         <p className="text-gray-500 text-sm mt-2">Glissez-déposez ou cliquez (Max 50MB)</p>
                       </>
                    ) : (
                       <div className="w-full h-full rounded-xl overflow-hidden">
                          {fileUrl && <STLViewer url={fileUrl} color={selectedMat.color_hex} onAnalyzed={handleAnalysis} />}
                          <button onClick={() => { setFile(null); setFileUrl(null); setVolumeMm3(0); setLegalAccepted(false); }} className="absolute top-4 right-4 bg-red-900/80 p-2 rounded text-white hover:bg-red-700 z-10" title="Changer de fichier"><Info size={16}/></button>
                       </div>
                    )}
                </div>

                {/* Analysis Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#151921] p-4 rounded-lg border border-gray-800 text-center">
                        <Box className="mx-auto text-blue-500 mb-2" size={20} />
                        <div className="text-xs text-gray-500 uppercase">Volume Matière</div>
                        <div className="text-lg font-bold text-white">{(volumeMm3 / 1000).toFixed(2)} <span className="text-xs">cm³</span></div>
                    </div>
                    <div className="bg-[#151921] p-4 rounded-lg border border-gray-800 text-center">
                        <Layers className="mx-auto text-purple-500 mb-2" size={20} />
                        <div className="text-xs text-gray-500 uppercase">Surface Totale</div>
                        <div className="text-lg font-bold text-white">{(surfaceMm2 / 100).toFixed(0)} <span className="text-xs">cm²</span></div>
                    </div>
                    <div className="bg-[#151921] p-4 rounded-lg border border-gray-800 text-center">
                        <Scale className="mx-auto text-green-500 mb-2" size={20} />
                        <div className="text-xs text-gray-500 uppercase">Poids Estimé</div>
                        <div className="text-lg font-bold text-white">{quote.weight.toFixed(1)} <span className="text-xs">g</span></div>
                    </div>
                </div>
            </div>

            {/* RIGHT: CONFIG & PRICE & LEGAL (Cols 5) */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Materiau */}
                <div className="bg-[#151921] p-6 rounded-xl border border-gray-800">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Palette size={18}/> Matériau</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {materials.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setSelectedMat(m)}
                                className={`p-3 rounded text-left border transition-all ${selectedMat.id === m.id ? 'bg-manu-orange/10 border-manu-orange text-white' : 'bg-black/20 border-gray-700 text-gray-400 hover:bg-black/40'}`}
                            >
                                <div className="font-bold text-sm">{m.name}</div>
                                <div className="text-[10px] opacity-70">{m.type}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Finition (Peinture) */}
                <div className="bg-[#151921] p-6 rounded-xl border border-gray-800">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Brush size={18}/> Finition</h3>
                    <div className="space-y-2">
                        {FINISHES.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setSelectedFinish(f)}
                                className={`w-full flex justify-between items-center p-3 rounded border transition-all ${selectedFinish.id === f.id ? 'bg-purple-500/10 border-purple-500 text-white' : 'bg-black/20 border-gray-700 text-gray-400'}`}
                            >
                                <span className="text-sm">{f.name}</span>
                                {f.painting && <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full">Artisanat</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Quote Block WITH LEGAL RESERVE */}
                <div className="bg-black border border-gray-700 p-6 rounded-xl shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-manu-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                        <Coins className="text-manu-orange" /> Estimation
                    </h3>

                    <div className="space-y-3 text-sm mb-6 relative z-10">
                        <div className="flex justify-between text-gray-400">
                            <span>Matière ({quote.weight.toFixed(0)}g)</span>
                            <span>{quote.materialCost.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Temps Machine & Setup</span>
                            <span>{(quote.machineCost + quote.setupFee).toFixed(2)}€</span>
                        </div>
                        {selectedFinish.painting && (
                            <div className="flex justify-between text-purple-400 font-bold bg-purple-900/10 p-2 rounded">
                                <span className="flex items-center gap-1"><Clock size={12}/> Peinture (~{quote.paintHours.toFixed(1)}h)</span>
                                <span>{quote.paintCost.toFixed(2)}€</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-400 items-center pt-2">
                            <span>Quantité</span>
                            <div className="flex items-center gap-2 bg-gray-800 rounded px-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity-1))}>-</button>
                                <span className="text-white w-4 text-center">{quantity}</span>
                                <button onClick={() => setQuantity(quantity+1)}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-800 flex justify-between items-end mb-6">
                        <span className="text-gray-500 text-xs uppercase">Total Estimé</span>
                        <span className="text-4xl font-bold text-manu-orange font-display">{quote.total.toFixed(2)}€</span>
                    </div>

                    {/* --- RESERVE LEGALE & IP CHECKBOX --- */}
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 mb-4 text-[10px] text-gray-400">
                        <h4 className="flex items-center gap-1 text-manu-orange font-bold mb-2">
                            <Gavel size={12} /> Réserve Légale & Copyright
                        </h4>
                        <p className="mb-2">
                           Manu3D agit en tant que prestataire technique. Nous ne sommes pas responsables du contenu des fichiers fournis.
                           <span className="block mt-1 text-red-400">
                               <ShieldAlert size={10} className="inline mr-1" />
                               Refus strict d'impression d'armes réelles ou objets illégaux.
                           </span>
                        </p>
                        
                        <label className={`flex items-start gap-2 cursor-pointer p-2 rounded transition-colors ${legalAccepted ? 'bg-green-900/20 border border-green-500/30' : 'bg-black border border-red-500/30'}`}>
                            <div className="relative flex items-center pt-0.5">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only"
                                    checked={legalAccepted}
                                    onChange={(e) => setLegalAccepted(e.target.checked)}
                                />
                                {legalAccepted ? <CheckSquare size={16} className="text-green-500" /> : <Square size={16} className="text-red-500" />}
                            </div>
                            <span className={`leading-tight ${legalAccepted ? 'text-green-200' : 'text-gray-300'}`}>
                                Je certifie sur l'honneur détenir les droits de propriété intellectuelle de ce fichier et qu'il ne contrevient à aucune loi en vigueur.
                            </span>
                        </label>
                    </div>

                    <button 
                         disabled={volumeMm3 === 0 || !legalAccepted}
                         onClick={handleAddToCart}
                         className={`w-full bg-manu-orange text-black font-bold py-3 rounded transition-all flex items-center justify-center gap-2 ${
                            (volumeMm3 === 0 || !legalAccepted) ? 'opacity-50 cursor-not-allowed bg-gray-600' : 'hover:bg-white'
                         }`}
                    >
                        {volumeMm3 === 0 ? "En attente de fichier..." : 
                         !legalAccepted ? "Validez la réserve légale" : 
                         <><ShoppingCart size={18}/> Ajouter le projet au panier</>}
                    </button>
                </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default B2BService;