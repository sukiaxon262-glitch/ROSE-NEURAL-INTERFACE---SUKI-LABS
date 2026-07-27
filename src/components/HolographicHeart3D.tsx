import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Heart, RotateCw, ZoomIn, ZoomOut, Zap, Volume2, VolumeX,
  Activity, Layers, RefreshCcw, Sparkles, Info, Flame, ShieldCheck,
  Plus, Minus
} from 'lucide-react';
import { hudAudio } from '../lib/audioSynthesizer';
import { speechEngine } from '../lib/speechEngine';

export interface HeartFactCategory {
  id: string;
  title: string;
  icon: string;
  fact: string;
  detail: string;
  stat: string;
}

const HUMAN_HEART_FACTS: HeartFactCategory[] = [
  {
    id: 'beats',
    title: 'DAILY BEAT FREQUENCY',
    icon: '❤️',
    fact: 'Beats ~100,000 times every single day',
    detail: 'In a single day, the human heart contracts over 100,000 times, pumping approximately 2,000 gallons (7,570 liters) of blood through the circulatory network without a second of rest.',
    stat: '100k Beats/Day'
  },
  {
    id: 'lifespan',
    title: 'LIFESPAN PUMP VOLUME',
    icon: '🚀',
    fact: 'Over 2.5 billion beats in a average lifetime',
    detail: 'Over an average 75-year human lifespan, the myocardium contracts more than 2.5 billion times, moving enough blood to fill three supertankers.',
    stat: '2.5B Total Beats'
  },
  {
    id: 'pacemaker',
    title: 'AUTONOMOUS PACEMAKER',
    icon: '⚡',
    fact: 'Generates its own electrical impulses',
    detail: 'The Sinoatrial (SA) node acts as an intrinsic electrical pacemaker. Because it generates its own bio-electricity, the heart can continue beating independently if supplied with oxygen.',
    stat: 'SA Node Active'
  },
  {
    id: 'vessels',
    title: 'CIRCULATORY NETWORK LENGTH',
    icon: '🌐',
    fact: '60,000 miles of blood vessels in the body',
    detail: 'If stretched end-to-end, the network of blood vessels (arteries, veins, and capillaries) pumped by the heart would wrap around the Earth more than two and a half times!',
    stat: '60,000+ Miles'
  },
  {
    id: 'pressure',
    title: 'HYDRAULIC PRESSURE',
    icon: '💥',
    fact: 'Creates pressure to squirt blood 30 feet',
    detail: 'During peak left ventricular systole, the muscle generates enough hydraulic force to propel a stream of blood up to 30 feet (9 meters) across a room.',
    stat: '120 mmHg Pressure'
  },
  {
    id: 'heart_brain',
    title: 'INTRINSIC CARDIAC BRAIN',
    icon: '🧠',
    fact: 'Contains ~40,000 sensory neurons',
    detail: 'The heart possesses an intrinsic nervous system known as the "heart brain." Around 40,000 neurites sense hormones and pressure changes, sending direct signals back to the brain.',
    stat: '40,000 Neurons'
  },
  {
    id: 'size_weight',
    title: 'ANATOMICAL SIZE & WEIGHT',
    icon: '✊',
    fact: 'Roughly the size of an adult fist',
    detail: 'An adult human heart weighs between 250 to 350 grams (8-12 ounces). It is located in the thoracic cavity between the lungs, tilted slightly to the left side.',
    stat: '300g Average'
  }
];

// Helper to construct a smooth, mathematically clean 3D Parametric Holographic Heart
function createSleek3DHeartGeometry(uSegs = 56, vSegs = 56) {
  const geo = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * Math.PI * 2 - Math.PI; // -PI to PI around the heart shape
    const sinU = Math.sin(u);
    const cosU = Math.cos(u);
    const cos2U = Math.cos(2 * u);
    const cos3U = Math.cos(3 * u);
    const cos4U = Math.cos(4 * u);

    // Smooth mathematical 2D Heart cross-section
    const hx = 16 * Math.pow(sinU, 3);
    const hy = 13 * cosU - 5 * cos2U - 2 * cos3U - cos4U;

    for (let j = 0; j <= vSegs; j++) {
      const v = (j / vSegs) * Math.PI - Math.PI / 2; // -PI/2 to PI/2 for 3D depth expansion
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);

      const scale = 0.22;
      const x = hx * cosV * scale;
      const y = (hy + 2.5) * cosV * scale; // Center y-axis balance
      const z = sinV * 3.2 * (0.85 + 0.15 * Math.abs(cosU)) * scale;

      positions.push(x, y, z);
      uvs.push(i / uSegs, j / vSegs);
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const a = i * (vSegs + 1) + j;
      const b = (i + 1) * (vSegs + 1) + j;
      const c = (i + 1) * (vSegs + 1) + (j + 1);
      const d = i * (vSegs + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return geo;
}

/**
 * Real-time Electrocardiogram (ECG) Waveform Canvas Monitor
 * Draws a P-QRS-T wave tracing synchronized to the exact set BPM frequency.
 */
function EcgWaveformCanvas({ bpm, isBeating }: { bpm: number; isBeating: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const points: number[] = [];

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        const w = canvas.parentElement.clientWidth;
        if (w > 0 && canvas.width !== w) {
          canvas.width = w;
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const draw = (now: number) => {
      animId = requestAnimationFrame(draw);
      
      const width = canvas.width || 380;
      const height = canvas.height || 60;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Background HUD grid pattern
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isBeating) {
        // Calculate beat cycle phase based on exact BPM
        const periodSeconds = 60 / bpm;
        const normT = ((now / 1000) % periodSeconds) / periodSeconds; // 0 to 1

        let val = 0;
        // P-wave (Atrial Depolarization)
        if (normT > 0.08 && normT < 0.16) {
          val = Math.sin(((normT - 0.08) / 0.08) * Math.PI) * 0.18;
        }
        // QRS Complex (Ventricular Depolarization - Lub-Dub surge)
        else if (normT >= 0.18 && normT < 0.20) {
          val = -0.15; // Q wave dip
        } else if (normT >= 0.20 && normT < 0.24) {
          val = 0.95; // R peak spike
        } else if (normT >= 0.24 && normT < 0.27) {
          val = -0.35; // S wave rebound
        }
        // T-wave (Ventricular Repolarization)
        else if (normT >= 0.36 && normT < 0.52) {
          val = Math.sin(((normT - 0.36) / 0.16) * Math.PI) * 0.32;
        }

        points.push(val);
      } else {
        // Flatline
        points.push(0);
      }

      while (points.length > width) {
        points.shift();
      }

      // Draw glowing ECG Line
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const x = i;
        const y = centerY - points[i] * (height * 0.42);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw leading scanner pulse dot
      if (points.length > 0) {
        const lastX = points.length - 1;
        const lastY = centerY - points[lastX] * (height * 0.42);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [bpm, isBeating]);

  return (
    <div className="w-full bg-black/80 rounded-lg p-2.5 border border-pink-500/20 relative overflow-hidden space-y-1">
      <div className="flex justify-between items-center text-[10px] text-pink-300 font-mono">
        <span className="flex items-center gap-1.5 text-pink-400 font-bold">
          <Activity className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          CARDIAC ECG MONITORED RHYTHM
        </span>
        <span className="text-pink-300 font-bold font-mono px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/30">
          {isBeating ? `${bpm} BPM` : 'ASYS (FLATLINE)'}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={380}
        height={60}
        className="w-full h-14 rounded border border-pink-500/15 bg-black/95 shadow-inner"
      />
    </div>
  );
}

export function HolographicHeart3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const mainHeartMeshRef = useRef<THREE.Mesh | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);

  // Component UI States
  const [selectedFact, setSelectedFact] = useState<HeartFactCategory>(HUMAN_HEART_FACTS[0]);
  const [bpm, setBpm] = useState<number>(72);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isBeating, setIsBeating] = useState<boolean>(true);
  const [isCardiacAudioEnabled, setIsCardiacAudioEnabled] = useState<boolean>(false);
  const [wireframeOpacity, setWireframeOpacity] = useState<number>(0.8);
  const [displayStyle, setDisplayStyle] = useState<'pink_hologram' | 'neon_magenta' | 'rose_gold' | 'cyan_tactical'>('pink_hologram');
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Animation sync refs for smooth toggling without scene rebuild
  const isAutoRotatingRef = useRef(isAutoRotating);
  const isBeatingRef = useRef(isBeating);
  const bpmRef = useRef(bpm);
  const isCardiacAudioRef = useRef(isCardiacAudioEnabled);
  const lastBeatCycleIndexRef = useRef(-1);

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    isBeatingRef.current = isBeating;
  }, [isBeating]);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    isCardiacAudioRef.current = isCardiacAudioEnabled;
  }, [isCardiacAudioEnabled]);

  // Mouse interaction variables
  const prevMousePos = useRef({ x: 0, y: 0 });
  const heartRotation = useRef({ x: 0.15, y: 0 });

  // Voice narration trigger
  const handleVoiceReadout = (fact: HeartFactCategory) => {
    hudAudio.playJarvisChime();
    const narrationText = `Human Heart Fact. ${fact.title}. ${fact.fact}. ${fact.detail}`;
    speechEngine.speak(narrationText);
  };

  // Trigger Heartbeat Sound & Pulse Effect
  const triggerManualBeat = () => {
    hudAudio.playNeuralBurst();
    if (mainHeartMeshRef.current) {
      mainHeartMeshRef.current.scale.set(1.3, 1.3, 1.3);
      setTimeout(() => {
        if (mainHeartMeshRef.current) {
          mainHeartMeshRef.current.scale.set(1, 1, 1);
        }
      }, 200);
    }
  };

  // Build Procedural 3D Classic Holographic Pink Heart Mesh
  useEffect(() => {
    if (!mountRef.current) return;

    mountRef.current.innerHTML = '';
    const width = mountRef.current.clientWidth || 700;
    const height = mountRef.current.clientHeight || 520;
    const aspect = height > 0 ? width / height : 1.3;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 0.5, zoomLevel);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xff2a85, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xff66b2, 3.0);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff007f, 2.5);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Color definitions
    let primaryColorHex = 0xff2a85; // Signature Pink
    if (displayStyle === 'neon_magenta') primaryColorHex = 0xff007f;
    if (displayStyle === 'rose_gold') primaryColorHex = 0xffb3c6;
    if (displayStyle === 'cyan_tactical') primaryColorHex = 0x00f0ff;

    // Inner Chamber Pulsing Point Light
    const heartPointLight = new THREE.PointLight(primaryColorHex, 2.5, 12);
    heartPointLight.position.set(0, 0, 0);
    scene.add(heartPointLight);

    // Materials
    const wireMat = new THREE.MeshStandardMaterial({
      color: primaryColorHex,
      wireframe: true,
      transparent: true,
      opacity: wireframeOpacity,
      emissive: primaryColorHex,
      emissiveIntensity: 0.9,
      metalness: 0.85,
      roughness: 0.15
    });

    const glassShellMat = new THREE.MeshStandardMaterial({
      color: primaryColorHex,
      transparent: true,
      opacity: Math.min(0.35, wireframeOpacity * 0.5),
      emissive: primaryColorHex,
      emissiveIntensity: 0.35,
      metalness: 0.9,
      roughness: 0.1,
      side: THREE.DoubleSide
    });

    const glowCoreMat = new THREE.MeshBasicMaterial({
      color: primaryColorHex,
      transparent: true,
      opacity: 0.75,
      wireframe: true
    });

    // 5. Main Heart Group
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    // --- CREATE SLEEK 3D PARAMETRIC HEART MESH ---
    const heartGeo = createSleek3DHeartGeometry(60, 60);

    // Outer Glass Holographic Shell
    const glassShellMesh = new THREE.Mesh(heartGeo, glassShellMat);
    heartGroup.add(glassShellMesh);

    // Main Holographic Wireframe Cage
    const mainHeartMesh = new THREE.Mesh(heartGeo, wireMat);
    mainHeartMeshRef.current = mainHeartMesh;
    heartGroup.add(mainHeartMesh);

    // Inner Glowing Core Heart
    const innerHeartGeo = heartGeo.clone();
    innerHeartGeo.scale(0.58, 0.58, 0.58);
    const innerHeartMesh = new THREE.Mesh(innerHeartGeo, glowCoreMat);
    heartGroup.add(innerHeartMesh);

    // --- SLEEK ORBITING HOLO ENERGY HALO RINGS ---
    const haloGroup = new THREE.Group();
    const haloRingMat = new THREE.LineBasicMaterial({
      color: primaryColorHex,
      transparent: true,
      opacity: 0.45
    });

    const haloGeo1 = new THREE.RingGeometry(2.8, 2.84, 64);
    const haloRing1 = new THREE.LineLoop(haloGeo1, haloRingMat);
    haloRing1.rotation.x = Math.PI / 3;
    haloRing1.rotation.y = Math.PI / 6;
    haloGroup.add(haloRing1);

    const haloGeo2 = new THREE.RingGeometry(3.2, 3.24, 64);
    const haloRing2 = new THREE.LineLoop(haloGeo2, haloRingMat);
    haloRing2.rotation.x = -Math.PI / 4;
    haloRing2.rotation.y = -Math.PI / 5;
    haloGroup.add(haloRing2);

    heartGroup.add(haloGroup);

    // --- HOLOGRAPHIC TARGET RINGS & FLOOR GRID ---
    const baseGroup = new THREE.Group();
    baseGroup.position.set(0, -3.2, 0);

    const ringLineMat = new THREE.LineBasicMaterial({ color: primaryColorHex, transparent: true, opacity: 0.35 });
    for (let r = 3; r <= 7; r += 1.5) {
      const ringGeo = new THREE.RingGeometry(r, r + 0.04, 64);
      const ringMesh = new THREE.LineLoop(ringGeo, ringLineMat);
      ringMesh.rotation.x = Math.PI / 2;
      baseGroup.add(ringMesh);
    }

    const gridHelper = new THREE.GridHelper(16, 16, primaryColorHex, 0x330022);
    baseGroup.add(gridHelper);
    scene.add(baseGroup);

    // --- AMBIENT FLOATING PARTICLES ---
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: primaryColorHex,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleField = new THREE.Points(particleGeo, particleMat);
    particleSystemRef.current = particleField;
    scene.add(particleField);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera Z Zoom smoothness
      if (cameraRef.current) {
        cameraRef.current.position.z += (zoomLevel - cameraRef.current.position.z) * 0.1;
      }

      // Auto rotation
      if (heartGroupRef.current) {
        if (isAutoRotatingRef.current && !isDragging) {
          heartRotation.current.y += 0.01;
        }
        heartGroupRef.current.rotation.x = heartRotation.current.x;
        heartGroupRef.current.rotation.y = heartRotation.current.y;
      }

      // Rhythmic Lub-Dub Pulse Heartbeat & Internal Chamber Glow (Physiologically Accurate to set BPM)
      if (mainHeartMeshRef.current) {
        if (isBeatingRef.current) {
          const currentBpm = bpmRef.current;
          const cyclePeriod = 60 / currentBpm; // Total cycle period in seconds (e.g., 0.833s at 72 BPM)
          const currentCycleIndex = Math.floor(elapsedTime / cyclePeriod);

          // Trigger acoustic "Lub-Dub" sound on every beat boundary if cardiac audio is active
          if (currentCycleIndex > lastBeatCycleIndexRef.current) {
            lastBeatCycleIndexRef.current = currentCycleIndex;
            if (isCardiacAudioRef.current) {
              hudAudio.playLubDubSound(0.20);
            }
          }

          // Offset inside the current beat cycle (0 to cyclePeriod seconds)
          const tCycle = elapsedTime - currentCycleIndex * cyclePeriod;

          // Systole contraction phase duration (Wiggers diagram ratio)
          const systoleDuration = Math.min(cyclePeriod * 0.70, Math.max(0.18, 0.30 - (currentBpm - 60) * 0.00075));
          const diastoleDuration = cyclePeriod - systoleDuration;

          let beatScale = 1.0;
          let lightIntensity = 2.0;

          if (tCycle < systoleDuration) {
            // Active Systole Contraction Phase (Double-bump "Lub-Dub" atrial and ventricular pump)
            const sysProgress = tCycle / systoleDuration; // 0 to 1
            if (sysProgress < 0.40) {
              // "Lub" (S1 - Atrial contraction & AV valves closure surge)
              const factor = Math.sin((sysProgress / 0.40) * Math.PI);
              beatScale = 1.0 + factor * 0.16;
              lightIntensity = 2.0 + factor * 3.2;
            } else if (sysProgress >= 0.40 && sysProgress < 0.52) {
              // Isovolumetric brief recoil transition
              beatScale = 1.02;
              lightIntensity = 2.2;
            } else {
              // "Dub" (S2 - Ventricular contraction & Semilunar Aortic valves closure)
              const factor = Math.sin(((sysProgress - 0.52) / 0.48) * Math.PI);
              beatScale = 1.0 + factor * 0.24;
              lightIntensity = 2.0 + factor * 4.2;
            }
          } else {
            // Diastole Phase (Gentle cardiac muscle relaxation & blood refilling)
            const diasProgress = (tCycle - systoleDuration) / diastoleDuration;
            const factor = Math.sin(diasProgress * Math.PI);
            beatScale = 1.0 + factor * 0.03;
            lightIntensity = 2.0;
          }

          mainHeartMeshRef.current.scale.set(beatScale, beatScale, beatScale);
          heartPointLight.intensity = lightIntensity;
        } else {
          mainHeartMeshRef.current.scale.set(1.0, 1.0, 1.0);
          heartPointLight.intensity = 2.0;
        }
      }

      // Rotate Orbiting Halo Rings
      haloRing1.rotation.z = elapsedTime * 0.25;
      haloRing2.rotation.z = -elapsedTime * 0.35;

      // Particle circulation movement
      if (particleSystemRef.current) {
        particleSystemRef.current.rotation.y = elapsedTime * 0.15;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Resize Handler with ResizeObserver
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 700;
      const h = mountRef.current.clientHeight || 520;
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
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
  }, [displayStyle, wireframeOpacity]);

  // Mouse & Touch Drag Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;

    heartRotation.current.y += deltaX * 0.01;
    heartRotation.current.x += deltaY * 0.008;

    heartRotation.current.x = Math.max(-0.8, Math.min(0.8, heartRotation.current.x));
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMousePos.current.x;
    const deltaY = e.touches[0].clientY - prevMousePos.current.y;

    heartRotation.current.y += deltaX * 0.012;
    heartRotation.current.x += deltaY * 0.01;

    prevMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const resetCamera = () => {
    hudAudio.playClick();
    heartRotation.current = { x: 0.15, y: 0 };
    setZoomLevel(12);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5 w-full min-h-[700px]">
      {/* LEFT / MAIN 3D WIREFRAME CANVASES & DISPLAY MODE SELECTION */}
      <div className="flex-1 flex flex-col gap-3 rounded-xl hud-glass hud-border p-4 relative overflow-hidden min-h-[580px]">
        {/* Header Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 z-10 border-b border-pink-500/20 pb-3 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400">
              <Heart className="w-5 h-5 animate-pulse text-pink-400 fill-pink-500/30" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-widest text-pink-300 uppercase glow-pink flex items-center gap-2">
                3D HOLOGRAPHIC PINK HEART
                <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  FULLY ROTATABLE 360°
                </span>
              </h2>
              <p className="text-[10px] text-pink-200/70">
                Interactive 3D Holographic Heart Matrix & Human Physiology Codex
              </p>
            </div>
          </div>

          {/* Color Style Modes */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-lg border border-pink-500/30 text-xs">
            <button
              onClick={() => { setDisplayStyle('pink_hologram'); hudAudio.playClick(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                displayStyle === 'pink_hologram' ? 'bg-pink-500 text-black shadow-[0_0_10px_#ff2a85]' : 'text-pink-300/70 hover:text-white'
              }`}
            >
              ROSE PINK
            </button>
            <button
              onClick={() => { setDisplayStyle('neon_magenta'); hudAudio.playClick(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                displayStyle === 'neon_magenta' ? 'bg-[#ff007f] text-black shadow-[0_0_10px_#ff007f]' : 'text-pink-300/70 hover:text-white'
              }`}
            >
              MAGENTA
            </button>
            <button
              onClick={() => { setDisplayStyle('rose_gold'); hudAudio.playClick(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                displayStyle === 'rose_gold' ? 'bg-[#ffb3c6] text-black shadow-[0_0_10px_#ffb3c6]' : 'text-pink-300/70 hover:text-white'
              }`}
            >
              ROSE GOLD
            </button>
            <button
              onClick={() => { setDisplayStyle('cyan_tactical'); hudAudio.playClick(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                displayStyle === 'cyan_tactical' ? 'bg-[#00f0ff] text-black shadow-[0_0_10px_#00f0ff]' : 'text-pink-300/70 hover:text-white'
              }`}
            >
              CYAN
            </button>
          </div>
        </div>

        {/* Three.js Interactive 3D Canvas */}
        <div
          ref={mountRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="flex-1 w-full h-full min-h-[350px] sm:min-h-[420px] cursor-grab active:cursor-grabbing relative select-none rounded-lg bg-gradient-to-b from-black/50 via-pink-950/10 to-black/80 border border-pink-500/10 touch-none"
        >
          {/* Overlay Telemetry HUD */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start text-[10px] font-mono text-pink-400/70">
              <div className="space-y-0.5">
                <p>ROTATION X: {(heartRotation.current.x * (180 / Math.PI)).toFixed(1)}°</p>
                <p>ROTATION Y: {(heartRotation.current.y * (180 / Math.PI)).toFixed(1)}°</p>
                <p>PULSE RATE: {bpm} BPM</p>
              </div>
              <div className="text-right space-y-0.5">
                <p>SYSTEM STATUS: 100% NOMINAL</p>
                <p className="text-green-400 font-bold">DRAG CANVAS TO ROTATE 360°</p>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-black/80 backdrop-blur-md p-2.5 rounded-xl border border-pink-500/30 font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setZoomLevel(prev => Math.max(6, prev - 2)); hudAudio.playClick(); }}
                  className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/40 transition-all flex items-center gap-1 text-xs font-bold"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span>ZOOM +</span>
                </button>
                <button
                  onClick={() => { setZoomLevel(prev => Math.min(20, prev + 2)); hudAudio.playClick(); }}
                  className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/40 transition-all flex items-center gap-1 text-xs font-bold"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                  <span>ZOOM -</span>
                </button>
                <button
                  onClick={resetCamera}
                  className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/40 transition-all flex items-center gap-1 text-xs font-bold"
                  title="Reset Angle"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span>RESET</span>
                </button>
              </div>

              {/* Quick Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsAutoRotating(!isAutoRotating); hudAudio.playClick(); }}
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                    isAutoRotating ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                  }`}
                >
                  <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin' : ''}`} />
                  <span>{isAutoRotating ? 'SPIN ON' : 'SPIN OFF'}</span>
                </button>

                <button
                  onClick={() => { setIsBeating(!isBeating); hudAudio.playClick(); }}
                  className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                    isBeating ? 'bg-pink-500/30 border-pink-500 text-pink-300' : 'bg-pink-950/40 border-pink-500/30 text-pink-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isBeating ? 'animate-pulse text-pink-400 fill-pink-400' : 'text-pink-400'}`} />
                  <span>{isBeating ? 'BEATING ON' : 'BEATING OFF'}</span>
                </button>

                <button
                  onClick={triggerManualBeat}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_#ff2a85] hover:brightness-125 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 animate-bounce" />
                  <span className="hidden sm:inline">PULSE</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated Toggle Switches & Sliders Control Panel */}
        <div className="bg-black/70 backdrop-blur-md p-3.5 rounded-xl border border-pink-500/30 font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-pink-500/20 pb-2">
            <span className="text-xs font-bold text-pink-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              HEART ANIMATION TOGGLES
            </span>
            <span className="text-[10px] text-pink-400/80">REAL-TIME CONTROL</span>
          </div>

          {/* Toggle Switches Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-pink-950/20 p-2.5 rounded-lg border border-pink-500/20">
            {/* Heart Rotation Toggle Switch */}
            <div className="flex items-center justify-between bg-black/50 p-2 rounded-md border border-pink-500/20">
              <div className="flex items-center gap-2">
                <RotateCw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin text-green-400' : 'text-pink-400'}`} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-pink-200">HEART ROTATION</span>
                  <span className="text-[9px] text-pink-400/70">360° Continuous Spin</span>
                </div>
              </div>
              <button
                onClick={() => { setIsAutoRotating(!isAutoRotating); hudAudio.playClick(); }}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none border ${
                  isAutoRotating ? 'bg-green-500/30 border-green-500' : 'bg-pink-950/60 border-pink-500/40'
                }`}
                title="Toggle Heart Rotation"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    isAutoRotating ? 'translate-x-6 bg-green-400 shadow-[0_0_8px_#22c55e]' : 'translate-x-1 bg-pink-400'
                  }`}
                />
              </button>
            </div>

            {/* Heart Beating Toggle Switch */}
            <div className="flex items-center justify-between bg-black/50 p-2 rounded-md border border-pink-500/20">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${isBeating ? 'animate-pulse text-pink-500 fill-pink-500' : 'text-pink-400'}`} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-pink-200">HEART BEATING</span>
                  <span className="text-[9px] text-pink-400/70">Lub-Dub Rhythmic Pulse</span>
                </div>
              </div>
              <button
                onClick={() => { setIsBeating(!isBeating); hudAudio.playClick(); }}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none border ${
                  isBeating ? 'bg-pink-500/30 border-pink-500' : 'bg-pink-950/60 border-pink-500/40'
                }`}
                title="Toggle Heart Beating"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                    isBeating ? 'translate-x-6 bg-pink-400 shadow-[0_0_8px_#ec4899]' : 'translate-x-1 bg-pink-400'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Advanced Heart Rate (BPM) & Cardiac Rhythm Control Panel */}
          <div className="space-y-3 bg-black/60 p-3 rounded-lg border border-pink-500/20 text-xs text-pink-300">
            {/* Header with State Badge & Cardiac Audio Switch */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-pink-400 animate-pulse" />
                <span className="text-xs font-bold text-pink-200">CARDIAC RHYTHM CONTROL</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                  bpm < 60
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : bpm <= 85
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : bpm <= 115
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : bpm <= 155
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {isBeating
                    ? bpm < 60
                      ? 'BRADYCARDIA / SLEEP'
                      : bpm <= 85
                      ? 'RESTING RHYTHM'
                      : bpm <= 115
                      ? 'MODERATE EXERCISE'
                      : bpm <= 155
                      ? 'CARDIO / INTENSE'
                      : 'MAXIMUM / TACHYCARDIA'
                    : 'PAUSED'}
                </span>
              </div>

              {/* Cardiac Sound Effect Toggle */}
              <button
                onClick={() => {
                  const nextState = !isCardiacAudioEnabled;
                  setIsCardiacAudioEnabled(nextState);
                  hudAudio.playClick();
                  if (nextState) hudAudio.playLubDubSound(0.25);
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  isCardiacAudioEnabled
                    ? 'bg-pink-500/30 border-pink-400 text-pink-200 shadow-[0_0_10px_#ec4899]'
                    : 'bg-black/50 border-pink-500/30 text-pink-400 hover:bg-pink-500/20'
                }`}
                title="Synthesize real acoustic Lub-Dub heartbeat sound"
              >
                {isCardiacAudioEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-pink-300 animate-bounce" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-pink-400/60" />
                )}
                <span>{isCardiacAudioEnabled ? 'CARDIAC AUDIO: ON' : 'CARDIAC AUDIO: OFF'}</span>
              </button>
            </div>

            {/* Live ECG Waveform Monitor */}
            <EcgWaveformCanvas bpm={bpm} isBeating={isBeating} />

            {/* BPM Controls: Steppers + Input + Range Slider + Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Stepper Buttons & Manual Input */}
              <div className="space-y-2 bg-black/40 p-2.5 rounded-lg border border-pink-500/10">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-pink-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    HEART RATE FREQUENCY
                  </span>
                  <span className="text-pink-300 font-bold font-mono">{isBeating ? `${bpm} BPM` : 'PAUSED'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setBpm((prev) => Math.max(30, prev - 5));
                      hudAudio.playClick();
                    }}
                    disabled={!isBeating}
                    className="px-2.5 py-1.5 rounded-lg bg-pink-950/80 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 font-bold text-xs transition-colors shrink-0 disabled:opacity-40"
                    title="Decrease 5 BPM"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="30"
                      max="220"
                      value={bpm}
                      disabled={!isBeating}
                      onChange={(e) => {
                        const val = Math.min(220, Math.max(30, Number(e.target.value) || 30));
                        setBpm(val);
                      }}
                      className="w-full bg-black/80 border border-pink-500/40 rounded-lg px-3 py-1.5 text-center text-sm font-bold font-mono text-pink-300 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 disabled:opacity-50"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-pink-400/60 font-bold">BPM</span>
                  </div>

                  <button
                    onClick={() => {
                      setBpm((prev) => Math.min(220, prev + 5));
                      hudAudio.playClick();
                    }}
                    disabled={!isBeating}
                    className="px-2.5 py-1.5 rounded-lg bg-pink-950/80 border border-pink-500/30 text-pink-300 hover:bg-pink-500/30 font-bold text-xs transition-colors shrink-0 disabled:opacity-40"
                    title="Increase 5 BPM"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="range"
                  min="30"
                  max="220"
                  value={bpm}
                  disabled={!isBeating}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer h-1.5 rounded-lg bg-pink-950 disabled:opacity-40"
                />
              </div>

              {/* Preset BPM Frequency Buttons & Mesh Opacity */}
              <div className="space-y-2 bg-black/40 p-2.5 rounded-lg border border-pink-500/10">
                <span className="text-[11px] text-pink-400 font-bold block">PHYSIOLOGICAL PRESETS</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {[
                    { label: 'SLEEP (50)', val: 50 },
                    { label: 'REST (72)', val: 72 },
                    { label: 'WALK (95)', val: 95 },
                    { label: 'WORK (120)', val: 120 },
                    { label: 'RUN (155)', val: 155 },
                    { label: 'PEAK (185)', val: 185 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => {
                        setBpm(preset.val);
                        setIsBeating(true);
                        hudAudio.playClick();
                      }}
                      className={`py-1 px-1 rounded border font-bold transition-all text-center truncate ${
                        bpm === preset.val && isBeating
                          ? 'bg-pink-500 text-black border-pink-400 shadow-[0_0_8px_#ec4899]'
                          : 'bg-black/50 border-pink-500/30 text-pink-300 hover:bg-pink-500/20'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Mesh Opacity */}
                <div className="space-y-1 pt-1 border-t border-pink-500/10">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-pink-400 font-bold flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      MESH OPACITY
                    </span>
                    <span className="text-pink-300 font-bold">{Math.round(wireframeOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={wireframeOpacity}
                    onChange={(e) => setWireframeOpacity(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-1.5 rounded-lg bg-pink-950"
                  />
                </div>
              </div>
            </div>

            {/* Cardiac Rhythm Physiological Metrics Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-pink-500/15 text-[10px] font-mono text-center">
              <div className="bg-black/50 p-1.5 rounded border border-pink-500/20">
                <span className="text-pink-400/70 block">BEAT PERIOD</span>
                <span className="text-white font-bold">{isBeating ? `${Math.round(60000 / bpm)} ms` : '—'}</span>
              </div>
              <div className="bg-black/50 p-1.5 rounded border border-pink-500/20">
                <span className="text-pink-400/70 block">SYSTOLE PHASE</span>
                <span className="text-white font-bold">
                  {isBeating ? `${Math.round(Math.min((60000 / bpm) * 0.7, Math.max(180, 300 - (bpm - 60) * 0.75)))} ms` : '—'}
                </span>
              </div>
              <div className="bg-black/50 p-1.5 rounded border border-pink-500/20">
                <span className="text-pink-400/70 block">DIASTOLE REST</span>
                <span className="text-white font-bold">
                  {isBeating
                    ? `${Math.round(
                        60000 / bpm - Math.min((60000 / bpm) * 0.7, Math.max(180, 300 - (bpm - 60) * 0.75))
                      )} ms`
                    : '—'}
                </span>
              </div>
              <div className="bg-black/50 p-1.5 rounded border border-pink-500/20">
                <span className="text-pink-400/70 block">EST. OUTPUT</span>
                <span className="text-pink-300 font-bold">{isBeating ? `${((bpm * 70) / 1000).toFixed(1)} L/m` : '0 L/m'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT / HUMAN HEART FACTS CODEX & TELEMETRY */}
      <div className="w-full xl:w-[460px] flex flex-col gap-4 font-mono">
        {/* Fact Selector Pills */}
        <div className="p-4 rounded-xl hud-glass hud-border flex flex-col gap-3">
          <h3 className="text-xs font-bold text-pink-300 uppercase tracking-widest glow-pink flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-pink-400" />
              HUMAN HEART FACTS CODEX
            </span>
            <span className="text-[10px] text-pink-400">SELECT TO EXPLORE</span>
          </h3>

          <div className="flex flex-col gap-2">
            {HUMAN_HEART_FACTS.map((fact) => {
              const isSelected = selectedFact.id === fact.id;
              return (
                <button
                  key={fact.id}
                  onClick={() => {
                    setSelectedFact(fact);
                    hudAudio.playClick();
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs font-bold transition-all border flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-pink-500 text-black border-pink-400 shadow-[0_0_12px_#ff2a85]'
                      : 'bg-black/50 border-pink-500/30 text-pink-300 hover:bg-pink-500/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">{fact.icon}</span>
                    <span className="truncate">{fact.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono shrink-0 ${
                    isSelected ? 'bg-black text-pink-300' : 'bg-pink-500/20 text-pink-300'
                  }`}>
                    {fact.stat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Fact Detail Card */}
        <div className="flex-1 p-5 rounded-xl hud-glass hud-border flex flex-col gap-4 text-xs text-pink-200 border-l-4 border-pink-500">
          <div className="flex justify-between items-start border-b border-pink-500/20 pb-3">
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40">
                {selectedFact.stat}
              </span>
              <h3 className="text-base font-bold text-pink-300 mt-1.5 uppercase tracking-wide glow-pink flex items-center gap-2">
                <span>{selectedFact.icon}</span>
                <span>{selectedFact.title}</span>
              </h3>
            </div>

            <button
              onClick={() => handleVoiceReadout(selectedFact)}
              className="px-3 py-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/40 transition-all flex items-center gap-1.5 font-bold shrink-0 text-[11px]"
              title="Voice Diagnostic Readout"
            >
              <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>VOICE READOUT</span>
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] scrollbar-none pr-1">
            <div className="p-3 bg-black/60 rounded-lg border border-pink-500/20 space-y-1">
              <span className="text-[10px] text-pink-400 font-bold uppercase block">KEY FACT SUMMARY</span>
              <p className="text-white font-bold text-sm leading-snug">{selectedFact.fact}</p>
            </div>

            <div className="p-3 bg-black/60 rounded-lg border border-pink-500/20 space-y-1">
              <span className="text-[10px] text-pink-400 font-bold uppercase block">PHYSIOLOGICAL INSIGHT</span>
              <p className="leading-relaxed text-pink-100 text-[11px]">{selectedFact.detail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
