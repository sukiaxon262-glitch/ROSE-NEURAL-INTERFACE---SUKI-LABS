import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SimulationState } from '../types';
import { hudAudio } from '../lib/audioSynthesizer';
import { Maximize2, RotateCcw, Zap, Eye, Activity, Sparkles, Layers } from 'lucide-react';

interface Props {
  simulationState: SimulationState;
  onSelectNode?: (nodeInfo: { title: string; description: string }) => void;
}

export const HolographicSimulation3D: React.FC<Props> = ({ simulationState, onSelectNode }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animatedGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const [activeNodeInfo, setActiveNodeInfo] = useState<{ title: string; detail: string } | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [cameraZoom, setCameraZoom] = useState<number>(100);

  // Mouse drag control state
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Clear previous DOM elements if any
    mountRef.current.innerHTML = '';

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 400;
    const aspect = height > 0 ? width / height : 1;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a030b, 0.015);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 5, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffb6c1, 0.8);
    scene.add(ambientLight);

    const pinkPointLight = new THREE.PointLight(0xff2a85, 3, 50);
    pinkPointLight.position.set(0, 10, 10);
    scene.add(pinkPointLight);

    const magentaLight = new THREE.PointLight(0xe0115f, 2, 40);
    magentaLight.position.set(-10, -10, -5);
    scene.add(magentaLight);

    // 5. Ambient Holographic Background Grid & Particle Cloud
    const particleCount = 600;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const pinkPalette = [
      new THREE.Color(0xff2a85),
      new THREE.Color(0xff69b4),
      new THREE.Color(0xff1493),
      new THREE.Color(0xffb6c1),
      new THREE.Color(0x39ff14) // GFP Axolotl glow green accent
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const color = pinkPalette[Math.floor(Math.random() * pinkPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // Concentric HUD Telemetry Rings
    const ringGroup = new THREE.Group();
    
    for (let r = 8; r <= 16; r += 4) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.08, 64);
      const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xff69b4, side: THREE.DoubleSide, transparent: true, opacity: 0.25 }));
      ringMesh.rotation.x = Math.PI / 2;
      ringGroup.add(ringMesh);
    }
    scene.add(ringGroup);

    // Main Simulation Group
    const simGroup = new THREE.Group();
    scene.add(simGroup);
    animatedGroupRef.current = simGroup;

    // Build specific simulation structure
    buildSimulationMesh(simGroup, simulationState);

    // Animation loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate particle cloud gently
      particleSystem.rotation.y = elapsedTime * 0.03;
      ringGroup.rotation.z = elapsedTime * 0.05;

      if (simGroup && isRotating) {
        simGroup.rotation.y = elapsedTime * 0.2;
      }

      // Animate specific simulation internal elements
      simGroup.children.forEach((child, index) => {
        if (child.userData.animatedPulse) {
          const scale = 1 + Math.sin(elapsedTime * 3 + index) * 0.12;
          child.scale.set(scale, scale, scale);
        }
        if (child.userData.floatingVesicle) {
          child.position.y += Math.sin(elapsedTime * 2 + index) * 0.02;
        }
        if (child.userData.flowingMolecule) {
          child.position.x += Math.cos(elapsedTime * 1.5 + index) * 0.03;
          child.position.z += Math.sin(elapsedTime * 1.5 + index) * 0.03;
        }
      });

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 600;
      const h = mountRef.current.clientHeight || 400;
      if (w <= 0 || h <= 0) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mountRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(mountRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement) {
          rendererRef.current.domElement.remove();
        }
        rendererRef.current = null;
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = '';
      }
    };
  }, [simulationState.type, simulationState.intensity]);

  // Rebuild Three.js object group depending on current simulation type
  const buildSimulationMesh = (group: THREE.Group, state: SimulationState) => {
    // Clear and dispose existing children
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ('geometry' in child && (child as any).geometry) {
        (child as any).geometry.dispose();
      }
      if ('material' in child && (child as any).material) {
        const mat = (child as any).material;
        if (Array.isArray(mat)) {
          mat.forEach(m => m.dispose && m.dispose());
        } else if (mat.dispose) {
          mat.dispose();
        }
      }
    }

    const { type, intensity = 50 } = state;
    const intensityScale = Math.max(0.5, intensity / 50);

    // Common materials
    const pinkWireMat = new THREE.MeshBasicMaterial({
      color: 0xff2a85,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });

    const hotPinkGlowMat = new THREE.MeshPhongMaterial({
      color: 0xff1493,
      emissive: 0xff2a85,
      emissiveIntensity: 0.6 * intensityScale,
      shininess: 100,
      transparent: true,
      opacity: 0.85
    });

    const gfpGreenMat = new THREE.MeshPhongMaterial({
      color: 0x39ff14,
      emissive: 0x228b22,
      emissiveIntensity: 0.8,
      shininess: 90
    });

    const magentaMat = new THREE.MeshStandardMaterial({
      color: 0xe0115f,
      roughness: 0.3,
      metalness: 0.8
    });

    if (type === 'dopamine_synapse') {
      // Pre-synaptic membrane (top cylinder wireframe)
      const preMembraneGeo = new THREE.CylinderGeometry(5, 4, 3, 32, 1, true);
      const preMembrane = new THREE.Mesh(preMembraneGeo, pinkWireMat);
      preMembrane.position.y = 5;
      group.add(preMembrane);

      // Post-synaptic dendritic spine (bottom cylinder wireframe)
      const postMembraneGeo = new THREE.CylinderGeometry(4, 5, 3, 32, 1, true);
      const postMembrane = new THREE.Mesh(postMembraneGeo, pinkWireMat);
      postMembrane.position.y = -5;
      group.add(postMembrane);

      // Synaptic cleft gap indicator (central glowing ring)
      const cleftGeo = new THREE.TorusGeometry(4.2, 0.1, 16, 64);
      const cleftRing = new THREE.Mesh(cleftGeo, hotPinkGlowMat);
      cleftRing.userData = { animatedPulse: true };
      group.add(cleftRing);

      // Dopamine Vesicles in Pre-Synaptic Terminal
      for (let i = 0; i < 12; i++) {
        const vesicleGeo = new THREE.SphereGeometry(0.6, 16, 16);
        const vesicle = new THREE.Mesh(vesicleGeo, hotPinkGlowMat);
        const angle = (i / 12) * Math.PI * 2;
        vesicle.position.set(Math.cos(angle) * 2.2, 4 + Math.sin(i) * 0.8, Math.sin(angle) * 2.2);
        vesicle.userData = { floatingVesicle: true };
        group.add(vesicle);
      }

      // Releasing Dopamine molecules traversing Synaptic Cleft
      for (let i = 0; i < 25; i++) {
        const moleculeGeo = new THREE.IcosahedronGeometry(0.35, 1);
        const mol = new THREE.Mesh(moleculeGeo, hotPinkGlowMat);
        mol.position.set(
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 6
        );
        mol.userData = { flowingMolecule: true };
        group.add(mol);
      }

    } else if (type === 'axolotl_blastema_regeneration' || type === 'axolotl_spinal_repair') {
      // Axolotl Limb Stump / Blastema Cone Geometry
      const limbBaseGeo = new THREE.CylinderGeometry(3, 2.5, 6, 24);
      const limbBase = new THREE.Mesh(limbBaseGeo, magentaMat);
      limbBase.position.y = -3;
      group.add(limbBase);

      // Regenerating Blastema Tip (Glowing Pink/GFP Green undifferentiated cells)
      const blastemaGeo = new THREE.ConeGeometry(2.5, 5, 32);
      const blastema = new THREE.Mesh(blastemaGeo, type === 'axolotl_blastema_regeneration' ? gfpGreenMat : hotPinkGlowMat);
      blastema.position.y = 2.5;
      blastema.userData = { animatedPulse: true };
      group.add(blastema);

      // Dedifferentiating Mesenchymal Cell Clusters
      for (let i = 0; i < 18; i++) {
        const cellGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const cellMat = i % 3 === 0 ? gfpGreenMat : hotPinkGlowMat;
        const cell = new THREE.Mesh(cellGeo, cellMat);
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2;
        cell.position.set(Math.cos(theta) * radius, (Math.random() - 0.5) * 4, Math.sin(theta) * radius);
        cell.userData = { floatingVesicle: true };
        group.add(cell);
      }

      // Extracellular Matrix Fiber Network lines
      const lineMat = new THREE.LineBasicMaterial({ color: 0xff2a85, transparent: true, opacity: 0.5 });
      const points = [];
      for (let i = 0; i < 20; i++) {
        points.push(new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 5));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
      group.add(lineMesh);

    } else if (type === 'prefrontal_amygdala_axis' || type === 'serotonin_pathway') {
      // 3D Brain Lobe Representation
      // Prefrontal Cortex Lobe (Large Wireframe Sphere)
      const pfcGeo = new THREE.SphereGeometry(3.5, 24, 24);
      const pfcMesh = new THREE.Mesh(pfcGeo, pinkWireMat);
      pfcMesh.position.set(-4, 2, 0);
      group.add(pfcMesh);

      // Amygdala / Limbic Core (Smaller Glowing Sphere)
      const amygdalaGeo = new THREE.SphereGeometry(2.2, 20, 20);
      const amygdalaMesh = new THREE.Mesh(amygdalaGeo, hotPinkGlowMat);
      amygdalaMesh.position.set(4, -1, 0);
      amygdalaMesh.userData = { animatedPulse: true };
      group.add(amygdalaMesh);

      // Hippocampal Memory Arch (Torus Segment)
      const hippoGeo = new THREE.TorusGeometry(3, 0.4, 16, 32, Math.PI);
      const hippoMesh = new THREE.Mesh(hippoGeo, magentaMat);
      hippoMesh.position.set(0, -3, 0);
      hippoMesh.rotation.z = -Math.PI / 4;
      group.add(hippoMesh);

      // Uncinate Fasciculus Signal Tract connecting PFC to Amygdala
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4, 2, 0),
        new THREE.Vector3(0, 1, 2),
        new THREE.Vector3(4, -1, 0)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.25, 12, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, hotPinkGlowMat);
      group.add(tubeMesh);

      // Signal Pulses moving along neural tract
      for (let i = 0; i < 8; i++) {
        const pulseGeo = new THREE.SphereGeometry(0.3, 12, 12);
        const pulse = new THREE.Mesh(pulseGeo, gfpGreenMat);
        const point = curve.getPoint(i / 8);
        pulse.position.copy(point);
        pulse.userData = { flowingMolecule: true };
        group.add(pulse);
      }

    } else {
      // Default: CBT Cognitive Loop / GABA-Glutamate Balance / General Network
      const nodeCount = 8;
      const radius = 6;
      const nodes: THREE.Mesh[] = [];

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(i * 1.5) * 2;

        const nodeGeo = new THREE.DodecahedronGeometry(1.2);
        const nodeMat = i % 2 === 0 ? hotPinkGlowMat : magentaMat;
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.position.set(x, y, z);
        nodeMesh.userData = { animatedPulse: true };
        group.add(nodeMesh);
        nodes.push(nodeMesh);
      }

      // Connect nodes with glowing lines
      const linePoints: THREE.Vector3[] = [];
      for (let i = 0; i < nodeCount; i++) {
        const nextIdx = (i + 1) % nodeCount;
        linePoints.push(nodes[i].position);
        linePoints.push(nodes[nextIdx].position);
        // Cross connections
        if (i % 2 === 0) {
          linePoints.push(nodes[i].position);
          linePoints.push(nodes[(i + 4) % nodeCount].position);
        }
      }

      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xff2a85, transparent: true, opacity: 0.6 });
      const networkLines = new THREE.LineSegments(lineGeo, lineMat);
      group.add(networkLines);
    }

    hudAudio.playScanSweep();
  };

  // Mouse & Touch Orbit Drag Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !animatedGroupRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    animatedGroupRef.current.rotation.y += deltaX * 0.008;
    animatedGroupRef.current.rotation.x += deltaY * 0.008;

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !animatedGroupRef.current || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

    animatedGroupRef.current.rotation.y += deltaX * 0.008;
    animatedGroupRef.current.rotation.x += deltaY * 0.008;

    previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const zoomChange = e.deltaY * 0.02;
    const newZ = Math.min(Math.max(cameraRef.current.position.z + zoomChange, 8), 45);
    cameraRef.current.position.z = newZ;
    setCameraZoom(Math.round((45 - newZ) * 2.7));
  };

  const triggerBurstEffect = () => {
    if (animatedGroupRef.current) {
      animatedGroupRef.current.children.forEach(child => {
        child.scale.set(1.4, 1.4, 1.4);
      });
    }
    hudAudio.playNeuralBurst();
  };

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-xl hud-glass hud-border shadow-[0_0_30px_rgba(236,72,153,0.2)] overflow-hidden flex flex-col">
      {/* Top HUD Visual Overlay Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between pointer-events-auto border-b border-[#ff2a85]/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#ff2a85] animate-ping" />
          <div className="flex flex-col">
            <span className="text-xs font-mono tracking-widest text-[#ff69b4] uppercase font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#ff2a85]" />
              HOLOGRAPHIC 3D MATRIX // {simulationState.simulation_type || simulationState.type || 'NEURAL_SIMULATION'}
            </span>
            <span className="text-[11px] font-mono text-[#ffb6c1]/80">
              TARGET STRUCTURE: {simulationState.targetStructure || 'SYNAPTIC_CLEFT'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1 text-xs font-mono rounded border transition-all flex items-center gap-1.5 ${
              isRotating
                ? 'bg-[#ff2a85]/20 text-[#ff69b4] border-[#ff2a85]/60 hover:bg-[#ff2a85]/40'
                : 'bg-black/60 text-gray-400 border-gray-700 hover:text-white'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCcw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
            {isRotating ? 'ROTATING' : 'PAUSED'}
          </button>

          <button
            onClick={triggerBurstEffect}
            className="px-2.5 py-1 text-xs font-mono bg-[#ff1493]/20 hover:bg-[#ff1493]/40 text-[#ffb6c1] border border-[#ff1493]/50 rounded transition-all flex items-center gap-1.5"
            title="Trigger Neural Energy Burst"
          >
            <Zap className="w-3 h-3 text-[#ff2a85]" />
            BURST
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Mount */}
      <div
        ref={mountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing flex-1 touch-none"
      />

      {/* Bottom Telemetry HUD Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-2.5 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between border-t border-[#ff2a85]/20 backdrop-blur-md">
        <div className="flex items-center gap-4 text-[11px] font-mono text-[#ffb6c1]/80">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#ff2a85] animate-pulse" />
            <span>EXCITATION: {simulationState.intensity}%</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>MOLECULES: {simulationState.keyNeurotransmitters?.join(', ') || 'Dopamine, GABA'}</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-[#ff69b4]/70">
          DRAG TO ROTATE // SCROLL TO ZOOM
        </div>
      </div>

      {/* Clinical Notes Floating Hologram Box if provided */}
      {simulationState.clinicalNotes && (
        <div className="absolute bottom-12 left-4 right-4 z-10 p-3 rounded-lg bg-black/85 border border-[#ff2a85]/50 backdrop-blur-md shadow-lg shadow-[#ff2a85]/20">
          <p className="text-xs font-mono text-[#ffb6c1] leading-relaxed">
            <span className="text-[#ff2a85] font-bold">ROSE CLINICAL ASSESSMENT:</span> {simulationState.clinicalNotes}
          </p>
        </div>
      )}
    </div>
  );
};
