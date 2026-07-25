import React, { useState } from 'react';
import { Brain, Volume2, Sparkles, Eye, Shield, Activity, Info, CheckCircle2 } from 'lucide-react';
import { speechEngine } from '../lib/speechEngine';
import { hudAudio } from '../lib/audioSynthesizer';

export interface BrainRegion {
  id: string;
  name: string;
  category: 'Cortical Lobe' | 'Limbic System' | 'Subcortical & Stem';
  simpleDefinition: string; // The required simple one sentence definition
  detailedFunction: string;
  coordinates: { x: number; y: number }; // Percentage coordinates for diagram pin
  color: string;
  simulationType?: string;
  associatedDisorders: string[];
}

const BRAIN_REGIONS: BrainRegion[] = [
  {
    id: 'prefrontal_cortex',
    name: 'Prefrontal Cortex',
    category: 'Cortical Lobe',
    simpleDefinition: 'The prefrontal cortex is responsible for executive function, impulse control, decision-making, and complex goal-directed planning.',
    detailedFunction: 'Acts as the command center for working memory, abstract reasoning, social regulation, and personality expression.',
    coordinates: { x: 22, y: 35 },
    color: '#ec4899', // Pink
    simulationType: 'cbt_restructuring',
    associatedDisorders: ['ADHD', 'Major Depressive Disorder', 'Obsessive-Compulsive Disorder']
  },
  {
    id: 'frontal_lobe',
    name: 'Frontal Lobe',
    category: 'Cortical Lobe',
    simpleDefinition: 'The frontal lobe is responsible for voluntary motor control, speech production, and high-level cognitive processing.',
    detailedFunction: 'Contains the primary motor cortex and Broca\'s area, coordinating voluntary movement and articulate speech execution.',
    coordinates: { x: 38, y: 28 },
    color: '#f43f5e', // Rose
    simulationType: 'cbt_restructuring',
    associatedDisorders: ['Broca\'s Aphasia', 'Frontotemporal Dementia']
  },
  {
    id: 'parietal_lobe',
    name: 'Parietal Lobe',
    category: 'Cortical Lobe',
    simpleDefinition: 'The parietal lobe is responsible for processing sensory inputs like touch, temperature, pain, and spatial orientation.',
    detailedFunction: 'Houses the somatosensory cortex, enabling proprioception, spatial navigation, and mapping tactile sensations across the body.',
    coordinates: { x: 60, y: 24 },
    color: '#a855f7', // Purple
    associatedDisorders: ['Apraxia', 'Spatial Hemineglect']
  },
  {
    id: 'occipital_lobe',
    name: 'Occipital Lobe',
    category: 'Cortical Lobe',
    simpleDefinition: 'The occipital lobe is responsible for decoding and interpreting visual information received from the eyes.',
    detailedFunction: 'Contains the primary visual cortex (V1), processing visual contrast, motion, orientation, color, and object recognition.',
    coordinates: { x: 80, y: 42 },
    color: '#6366f1', // Indigo
    associatedDisorders: ['Visual Agnosia', 'Cortical Blindness']
  },
  {
    id: 'temporal_lobe',
    name: 'Temporal Lobe',
    category: 'Cortical Lobe',
    simpleDefinition: 'The temporal lobe is responsible for processing auditory signals, understanding language, and forming long-term memories.',
    detailedFunction: 'Contains Wernicke\'s area for speech comprehension and works closely with the hippocampus to process facial recognition and auditory inputs.',
    coordinates: { x: 48, y: 56 },
    color: '#3b82f6', // Blue
    simulationType: 'serotonin_pathway',
    associatedDisorders: ['Wernicke\'s Aphasia', 'Temporal Lobe Epilepsy']
  },
  {
    id: 'amygdala',
    name: 'Amygdala',
    category: 'Limbic System',
    simpleDefinition: 'The amygdala is responsible for processing emotions, detecting potential threats, and triggering the fight-or-flight response.',
    detailedFunction: 'Evaluates emotional salience in environmental stimuli, conditioning fear responses and activating autonomic sympathetic nervous arousal.',
    coordinates: { x: 45, y: 48 },
    color: '#ef4444', // Red
    simulationType: 'amygdala_response',
    associatedDisorders: ['Post-Traumatic Stress Disorder (PTSD)', 'Generalized Anxiety Disorder', 'Panic Disorder']
  },
  {
    id: 'hippocampus',
    name: 'Hippocampus',
    category: 'Limbic System',
    simpleDefinition: 'The hippocampus is responsible for consolidating short-term experiences into lasting long-term memories and spatial navigation.',
    detailedFunction: 'Facilitates declarative memory formation and spatial mapping; highly vulnerable to chronic elevated stress and cortisol toxicity.',
    coordinates: { x: 55, y: 52 },
    color: '#10b981', // Emerald
    simulationType: 'dopamine_synapse',
    associatedDisorders: ['Alzheimer\'s Disease', 'Anterograde Amnesia']
  },
  {
    id: 'thalamus',
    name: 'Thalamus',
    category: 'Limbic System',
    simpleDefinition: 'The thalamus is responsible for relaying sensory and motor signals to the cerebral cortex and regulating sleep and alertness.',
    detailedFunction: 'Functions as the chief neurological switchboard, filtering and routing sensory data (except smell) to appropriate cortical processing zones.',
    coordinates: { x: 50, y: 42 },
    color: '#f59e0b', // Amber
    associatedDisorders: ['Fatal Familial Insomnia', 'Thalamic Pain Syndrome']
  },
  {
    id: 'hypothalamus',
    name: 'Hypothalamus',
    category: 'Limbic System',
    simpleDefinition: 'The hypothalamus is responsible for maintaining body homeostasis by controlling hunger, thirst, body temperature, and hormone release.',
    detailedFunction: 'Directly links the nervous system to the endocrine system via the pituitary gland, regulating circadian rhythms and endocrine balance.',
    coordinates: { x: 42, y: 50 },
    color: '#f97316', // Orange
    associatedDisorders: ['Circadian Rhythm Sleep Disorders', 'Hypothalamic Dysfunction']
  },
  {
    id: 'cerebellum',
    name: 'Cerebellum',
    category: 'Subcortical & Stem',
    simpleDefinition: 'The cerebellum is responsible for maintaining balance, fine motor coordination, posture, and motor procedural learning.',
    detailedFunction: 'Compares intended motor commands with actual movement feedback to make micro-adjustments for smooth, precise physical actions.',
    coordinates: { x: 74, y: 68 },
    color: '#39ff14', // Neon Green
    associatedDisorders: ['Ataxia', 'Dysmetria']
  },
  {
    id: 'brainstem',
    name: 'Brainstem (Pons & Medulla)',
    category: 'Subcortical & Stem',
    simpleDefinition: 'The brainstem is responsible for regulating essential involuntary survival functions such as breathing, heart rate, and blood pressure.',
    detailedFunction: 'Connects the cerebrum with the spinal cord, controlling basic life-support autonomic reflexes, swallowing, and sleep-wake cycles.',
    coordinates: { x: 58, y: 72 },
    color: '#14b8a6', // Teal
    associatedDisorders: ['Central Sleep Apnea', 'Locked-in Syndrome']
  },
  {
    id: 'corpus_callosum',
    name: 'Corpus Callosum',
    category: 'Subcortical & Stem',
    simpleDefinition: 'The corpus callosum is responsible for connecting and facilitating communication between the left and right brain hemispheres.',
    detailedFunction: 'Consists of over 200 million axonal fibers that bridge interhemispheric transfer of sensory, cognitive, and motor information.',
    coordinates: { x: 48, y: 36 },
    color: '#ec4899', // Pink
    associatedDisorders: ['Agenesis of the Corpus Callosum', 'Alien Hand Syndrome']
  }
];

interface BrainAtlasProps {
  onTriggerSimulation: (type: any, title: string, notes: string) => void;
}

export const BrainAtlas: React.FC<BrainAtlasProps> = ({ onTriggerSimulation }) => {
  const [selectedRegion, setSelectedRegion] = useState<BrainRegion>(BRAIN_REGIONS[0]);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const speakRegionDefinition = (region: BrainRegion) => {
    hudAudio.playClick();
    const speech = `${region.name}. ${region.simpleDefinition}`;
    speechEngine.speak(speech);
  };

  const filteredRegions = BRAIN_REGIONS.filter((r) => {
    if (filterCategory === 'All') return true;
    return r.category === filterCategory;
  });

  return (
    <div className="p-5 rounded-xl hud-glass hud-border shadow-[0_0_25px_rgba(236,72,153,0.15)] flex flex-col gap-5 text-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-pink-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-pink-400 uppercase tracking-widest glow-pink flex items-center gap-2">
              NEUROANATOMICAL BRAIN ATLAS
              <span className="text-[10px] bg-pink-500/20 px-2 py-0.5 rounded text-pink-300 border border-pink-500/30">
                SUKI LABS
              </span>
            </h2>
            <p className="text-[10px] text-pink-300/70">
              Interactive structural map of human brain regions with concise single-sentence functional definitions.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {['All', 'Cortical Lobe', 'Limbic System', 'Subcortical & Stem'].map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilterCategory(cat); hudAudio.playClick(); }}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                filterCategory === cat
                  ? 'bg-pink-500 text-black shadow-[0_0_10px_#ec4899]'
                  : 'bg-black/40 text-pink-300/70 hover:bg-pink-500/20 hover:text-white border border-pink-500/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Anatomy Display & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Visual Brain Anatomy Vector Graphic with Clickable Interactive Pins */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col items-center justify-between relative overflow-hidden min-h-[380px]">
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-pink-300/70 mb-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-pink-400" /> CEREBRAL MAP: SAGITTAL VIEW
            </span>
            <span className="text-pink-400 font-bold">CLICK NODES TO INSPECT</span>
          </div>

          {/* SVG Diagram Container */}
          <div className="relative w-full max-w-[500px] aspect-[4/3] my-auto flex items-center justify-center">
            {/* Background Holographic Brain Silhouette SVG */}
            <svg viewBox="0 0 500 380" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <defs>
                <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(236,72,153,0.25)" />
                  <stop offset="50%" stopColor="rgba(168,85,247,0.15)" />
                  <stop offset="100%" stopColor="rgba(59,130,246,0.25)" />
                </linearGradient>
                <pattern id="brainGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(236,72,153,0.1)" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Grid backdrop */}
              <rect width="500" height="380" fill="url(#brainGrid)" />

              {/* Outer Brain Contour Path */}
              <path
                d="M 110,180 C 90,140 120,80 180,60 C 240,40 320,40 380,70 C 430,95 440,150 410,190 C 430,220 420,270 380,280 C 350,290 320,280 300,260 C 290,290 280,330 260,340 C 250,345 230,340 230,310 C 230,280 210,260 180,250 C 140,240 110,210 110,180 Z"
                fill="url(#brainGrad)"
                stroke="rgba(236,72,153,0.6)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Subcortical & Limbic Outline */}
              <path
                d="M 200,160 C 220,130 280,130 300,160 C 310,180 300,210 270,215 C 240,220 210,200 200,160 Z"
                fill="rgba(236,72,153,0.15)"
                stroke="rgba(236,72,153,0.8)"
                strokeWidth="1.5"
              />

              {/* Cerebellum Outline */}
              <path
                d="M 320,240 C 360,230 400,250 390,290 C 375,320 330,310 310,280 Z"
                fill="rgba(57,255,20,0.15)"
                stroke="#39ff14"
                strokeWidth="1.5"
              />

              {/* Brainstem Stem Outline */}
              <path
                d="M 270,220 L 290,220 L 285,340 L 265,340 Z"
                fill="rgba(20,184,166,0.2)"
                stroke="#14b8a6"
                strokeWidth="1.5"
              />

              {/* Decorative Connective Neural Circuits */}
              <path d="M 180,130 Q 250,110 320,130" fill="none" stroke="rgba(236,72,153,0.3)" strokeWidth="1" />
              <path d="M 200,180 Q 250,170 300,190" fill="none" stroke="rgba(236,72,153,0.3)" strokeWidth="1" />
            </svg>

            {/* Interactive Pins overlaid on percentage positions */}
            {BRAIN_REGIONS.map((region) => {
              const isSelected = selectedRegion.id === region.id;
              return (
                <button
                  key={region.id}
                  onClick={() => { setSelectedRegion(region); hudAudio.playClick(); }}
                  style={{ left: `${region.coordinates.x}%`, top: `${region.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center transition-all ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  title={region.name}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'animate-ping opacity-75'
                        : 'opacity-60 group-hover:opacity-100'
                    }`}
                    style={{ backgroundColor: region.color, borderColor: '#ffffff' }}
                  />
                  <span
                    className={`absolute w-3.5 h-3.5 rounded-full border shadow-md flex items-center justify-center text-[8px] font-bold text-black ${
                      isSelected ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: region.color, borderColor: '#ffffff' }}
                  >
                    {isSelected ? '★' : ''}
                  </span>

                  {/* Label tooltip on hover */}
                  <span className={`absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[9px] font-bold bg-black/90 border border-pink-500/40 text-pink-200 pointer-events-none transition-all ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}>
                    {region.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full flex items-center justify-between text-[10px] text-pink-300/60 pt-2 border-t border-pink-500/20">
            <span>SELECTED: <strong className="text-pink-300">{selectedRegion.name.toUpperCase()}</strong></span>
            <span>CATEGORY: {selectedRegion.category}</span>
          </div>
        </div>

        {/* Right Column: Selected Region Deep Dive Card */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-pink-500/20">
              <div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  {selectedRegion.category}
                </span>
                <h3 className="text-lg font-bold text-pink-300 uppercase tracking-wider glow-pink mt-1">
                  {selectedRegion.name}
                </h3>
              </div>

              <button
                onClick={() => speakRegionDefinition(selectedRegion)}
                className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/30 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Listen to audio definition"
              >
                <Volume2 className="w-4 h-4 text-pink-400" />
                <span>SPEAK</span>
              </button>
            </div>

            {/* Simple One-Sentence Definition Highlight Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/20 via-pink-500/10 to-transparent border-l-4 border-pink-500 border-y border-r border-pink-500/20">
              <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> CORE RESPONSIBILITY (ONE-SENTENCE DEFINITION):
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-pink-100 leading-relaxed">
                "{selectedRegion.simpleDefinition}"
              </p>
            </div>

            {/* Detailed Neurological Function */}
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-pink-300/80 uppercase tracking-widest flex items-center gap-1">
                <Info className="w-3 h-3 text-pink-400" /> NEUROLOGICAL MECHANISMS:
              </h4>
              <p className="text-xs text-pink-200/90 leading-relaxed p-2.5 rounded-lg bg-black/60 border border-pink-500/20">
                {selectedRegion.detailedFunction}
              </p>
            </div>

            {/* Associated Disorders / Clinical Conditions */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-pink-300/80 uppercase tracking-widest flex items-center gap-1">
                <Shield className="w-3 h-3 text-pink-400" /> ASSOCIATED CLINICAL DISORDERS:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRegion.associatedDisorders.map((dis, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-pink-500/15 border border-pink-500/30 text-[10px] text-pink-200 font-medium">
                    {dis}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          {selectedRegion.simulationType && (
            <div className="pt-3 border-t border-pink-500/20">
              <button
                onClick={() => onTriggerSimulation(selectedRegion.simulationType, selectedRegion.name, selectedRegion.simpleDefinition)}
                className="w-full py-2.5 rounded-xl bg-pink-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_#ec4899] hover:bg-pink-400 transition-all uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" />
                <span>SIMULATE {selectedRegion.name.toUpperCase()} IN 3D MATRIX</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid List of All Brain Regions for Fast Scanning */}
      <div className="pt-3 border-t border-pink-500/20">
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" /> ALL BRAIN STRUCTURES INDEX ({filteredRegions.length}):
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRegions.map((region) => {
            const isSelected = selectedRegion.id === region.id;
            return (
              <div
                key={region.id}
                onClick={() => { setSelectedRegion(region); hudAudio.playClick(); }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-pink-500/20 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                    : 'bg-black/50 border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-pink-200">{region.name}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: region.color }} />
                </div>
                <p className="text-[11px] text-pink-300/80 line-clamp-2 leading-tight">
                  {region.simpleDefinition}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
