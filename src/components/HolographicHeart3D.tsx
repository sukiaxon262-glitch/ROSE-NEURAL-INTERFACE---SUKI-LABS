import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Heart, RotateCw, ZoomIn, ZoomOut, Zap, Volume2, 
  Activity, Layers, RefreshCcw, Sparkles, Info, Flame, ShieldCheck
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
  const [wireframeOpacity, setWireframeOpacity] = useState<number>(0.8);
  const [displayStyle, setDisplayStyle] = useState<'pink_hologram' | 'neon_magenta' | 'rose_gold' | 'cyan_tactical'>('pink_hologram');
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Animation sync refs for smooth toggling without scene rebuild
  const isAutoRotatingRef = useRef(isAutoRotating);
  const isBeatingRef = useRef(isBeating);

  useEffect(() => {
    isAutoRotatingRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    isBeatingRef.current = isBeating;
  }, [isBeating]);

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

    const wireMat = new THREE.MeshStandardMaterial({
      color: primaryColorHex,
      wireframe: true,
      transparent: true,
      opacity: wireframeOpacity,
      emissive: primaryColorHex,
      emissiveIntensity: 0.85,
      metalness: 0.9,
      roughness: 0.1
    });

    const glowCoreMat = new THREE.MeshBasicMaterial({
      color: primaryColorHex,
      transparent: true,
      opacity: 0.85,
      wireframe: true
    });

    // 5. Main Heart Group
    const heartGroup = new THREE.Group();
    heartGroupRef.current = heartGroup;
    scene.add(heartGroup);

    // --- CREATE BEAUTIFUL 3D CLASSIC HEART SHAPE ---
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;

    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 1.0);
    heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    heartShape.bezierCurveTo(x + 0.8, y, x + 0.5, y, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.16, x + 0.25, y + 0.25);

    const extrudeSettings = {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 16,
      steps: 8,
      bevelSize: 0.25,
      bevelThickness: 0.25,
    };

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    heartGeo.scale(3.2, 3.2, 3.2);
    heartGeo.rotateZ(Math.PI); // Flip upside down so tip points down

    const mainHeartMesh = new THREE.Mesh(heartGeo, wireMat);
    mainHeartMeshRef.current = mainHeartMesh;
    heartGroup.add(mainHeartMesh);

    // Inner Glowing Core Heart
    const innerHeartGeo = heartGeo.clone();
    innerHeartGeo.scale(0.7, 0.7, 0.7);
    const innerHeartMesh = new THREE.Mesh(innerHeartGeo, glowCoreMat);
    heartGroup.add(innerHeartMesh);

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

      // Rhythmic Lub-Dub Pulse Heartbeat
      if (mainHeartMeshRef.current) {
        if (isBeatingRef.current) {
          const bps = bpm / 60; // Beats per second
          const beatCycle = (elapsedTime * bps) % 1;
          let beatScale = 1.0;

          if (beatCycle < 0.15) {
            beatScale = 1.0 + Math.sin((beatCycle / 0.15) * Math.PI) * 0.15; // Lub
          } else if (beatCycle >= 0.22 && beatCycle < 0.35) {
            beatScale = 1.0 + Math.sin(((beatCycle - 0.22) / 0.13) * Math.PI) * 0.22; // Dub
          }
          mainHeartMeshRef.current.scale.set(beatScale, beatScale, beatScale);
        } else {
          mainHeartMeshRef.current.scale.set(1.0, 1.0, 1.0);
        }
      }

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
  }, [displayStyle, wireframeOpacity, bpm]);

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

          {/* Heart Rate (BPM) Slider & Wireframe Opacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-pink-300 pt-1">
            <div className="space-y-1.5 bg-black/40 p-2 rounded-lg border border-pink-500/10">
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 font-bold text-pink-400">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-pink-400" />
                  HEART RATE (BPM)
                </span>
                <span className="text-pink-300 font-bold">{isBeating ? `${bpm} BPM` : 'PAUSED'}</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={bpm}
                disabled={!isBeating}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer h-1.5 rounded-lg bg-pink-950 disabled:opacity-40"
              />
            </div>

            <div className="space-y-1.5 bg-black/40 p-2 rounded-lg border border-pink-500/10">
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-1.5 font-bold text-pink-400">
                  <Layers className="w-3.5 h-3.5" />
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
