import React, { useState } from 'react';
import { 
  Rocket, Globe, Radio, Volume2, ShieldAlert, Sparkles, Zap, 
  Brain, Moon, Compass, Users, Clock, Info, CheckCircle, Activity, Satellite
} from 'lucide-react';
import { hudAudio } from '../lib/audioSynthesizer';
import { speechEngine } from '../lib/speechEngine';

export interface SpacePsychologyFact {
  id: string;
  category: 'overview' | 'nasa' | 'isolation' | 'mars_future';
  title: string;
  subtitle: string;
  icon: string;
  summary: string;
  details: string;
  keyTakeaway: string;
}

const SPACE_PSYCHOLOGY_FACTS: SpacePsychologyFact[] = [
  {
    id: 'what_is_space_psych',
    category: 'overview',
    title: 'WHAT IS SPACE PSYCHOLOGY?',
    subtitle: 'Human Factors in Extreme Environments',
    icon: '🚀',
    summary: 'A specialized discipline studying how human cognition, emotion, interpersonal dynamics, and neurobiology adapt to long-duration spaceflight.',
    details: 'Space psychology investigates how astronauts cope with confinement, microgravity, isolation, strict operational schedules, artificial sensory environments, and distance from Earth. It blends clinical psychology, neuropsychology, cognitive ergonomics, and team dynamics to maintain peak mental resilience.',
    keyTakeaway: 'Focuses on maintaining psychological health, cognitive performance, and optimal team cohesion during space missions.'
  },
  {
    id: 'overview_third_quarter',
    category: 'overview',
    title: 'THE "THIRD-QUARTER EFFECT"',
    subtitle: 'Psychological Phenomenon in Expeditions',
    icon: '⏳',
    summary: 'A predictable dip in morale, motivation, and emotional resilience occurring past the halfway point of an isolated mission.',
    details: 'Observed across polar research stations, submarine voyages, and space missions: regardless of overall mission length, crew members often experience emotional fatigue, heightened irritability, or decreased motivation during the third quarter of the mission when novelty has faded and completion is still distant.',
    keyTakeaway: 'Proactive workload adjustments, psychological support, and recreational rewards are scheduled specifically around this threshold.'
  },
  {
    id: 'overview_overview_effect',
    category: 'overview',
    title: 'THE OVERVIEW EFFECT',
    subtitle: 'Cognitive Shift in Orbital Perspective',
    icon: '🌍',
    summary: 'A profound cognitive shift reported by astronauts viewing Earth from orbit or the Moon.',
    details: 'First described by space philosopher Frank White, seeing Earth as a fragile, borderless blue marble suspended in black void triggers intense feelings of awe, transcendent connectedness, self-transcendence, and a heightened sense of stewardship for humanity.',
    keyTakeaway: 'Enhances global consciousness, psychological well-being, and long-term existential perspective.'
  },
  {
    id: 'nasa_bhp_group',
    category: 'nasa',
    title: 'NASA BEHAVIORAL HEALTH & PERFORMANCE (BHP)',
    subtitle: 'Johnson Space Center Command Group',
    icon: '🛡️',
    summary: 'NASA\'s dedicated branch responsible for astronaut psychological selection, training, and real-time mission support.',
    details: 'Based at Johnson Space Center in Houston, the BHP team conducts rigorous pre-mission screening, trains crews in conflict resolution and stress management, monitors astronaut mental health during ISS expeditions, and assists returning astronauts during post-flight reintegration.',
    keyTakeaway: 'NASA treats mental health as a primary mission-critical safety metric, equal to life support systems.'
  },
  {
    id: 'nasa_chapea_analogs',
    category: 'nasa',
    title: 'NASA CHAPEA & ANALOG MISSIONS',
    subtitle: 'Simulating 378 Days on Mars',
    icon: '⛺',
    summary: 'Ground-based habitat simulations testing human endurance before deep space missions.',
    details: 'At Johnson Space Center, NASA\'s CHAPEA (Crew Health and Performance Exploration Analog) seals 4 volunteers inside a 3D-printed 1,700 sq ft habitat for 378 days to simulate a Mars surface stay. Volunteers experience simulated spacewalks, resource limits, equipment failures, and up to 22-minute communication delays.',
    keyTakeaway: 'Provides empirical data on psychological stress, food monotony, and team dynamics before sending humans to Mars.'
  },
  {
    id: 'nasa_comm_delays',
    category: 'nasa',
    title: 'COMMUNICATION DELAY PSYCHOLOGY',
    subtitle: 'Up to 22 Minutes Each Way to Mars',
    icon: '📡',
    summary: 'Managing the emotional impact of a 44-minute round-trip message lag between Earth and Mars.',
    details: 'On the Moon, radio delay is only 1.3 seconds. On Mars, light travel time creates delays up to 22 minutes each way. This eliminates real-time conversation with Mission Control or family, forcing crews to transition to high autonomy and self-directed problem solving.',
    keyTakeaway: 'NASA develops autonomous AI diagnostic companions and asynchronous family messaging protocols to prevent isolation fatigue.'
  },
  {
    id: 'isolation_circadian',
    category: 'isolation',
    title: 'CIRCADIAN DISRUPTION IN ORBIT',
    subtitle: '16 Sunrises Every 24 Hours on ISS',
    icon: '☀️',
    summary: 'How rapid orbital day-night cycles disrupt sleep architecture and melatonin regulation.',
    details: 'Orbiting Earth every 90 minutes exposes ISS crews to 16 sunrises and sunsets per day. Without natural circadian cues, sleep disruption, insomnia, and cognitive fatigue can degrade performance. NASA uses specialized LED Solid-State Lighting Systems (SSLS) with dynamic blue wavelength spectrums to regulate sleep cycles.',
    keyTakeaway: 'Dynamic lighting and strict sleep hygiene preserve cognitive reaction time and alertness.'
  },
  {
    id: 'isolation_sensory_deprivation',
    category: 'isolation',
    title: 'SENSORY MONOTONY & EARTH-OUT-OF-VIEW',
    subtitle: 'Psychological Impact of Losing Earth',
    icon: '🌌',
    summary: 'The emotional challenge of losing visual contact with Earth during deep-space transit.',
    details: 'During future Mars missions, Earth will shrink to a tiny specks of light, introducing the "Earth-Out-Of-View" phenomenon. Psychological research indicates that completely losing visual line-of-sight to Earth may cause existential vulnerability or homesickness. NASA uses VR nature simulations and olfactory cues (smells of rain, forests) to combat sensory monotony.',
    keyTakeaway: 'Virtual Reality and multisensory stimuli preserve mental wellness in void environments.'
  },
  {
    id: 'mars_future_autonomy',
    category: 'mars_future',
    title: 'THE FUTURE: AUTONOMOUS MARS CREWS',
    subtitle: 'Transitioning from Command to Self-Governance',
    icon: '🪐',
    summary: 'Empowering future Mars crews with psychological self-care and decentralized decision-making.',
    details: 'Unlike ISS missions where Mission Control micro-schedules every minute, deep space crews must function as self-governing teams. NASA is building onboard AI psychological monitoring tools, emotional telemetry analysis (speech inflection scanning), and peer-led conflict mediation protocols.',
    keyTakeaway: 'Deep space exploration shifts psychological support from ground-guided monitoring to crew-led autonomy.'
  }
];

export function SpacePsychology() {
  const [selectedFact, setSelectedFact] = useState<SpacePsychologyFact>(SPACE_PSYCHOLOGY_FACTS[0]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'overview' | 'nasa' | 'isolation' | 'mars_future'>('all');

  const filteredFacts = activeCategory === 'all' 
    ? SPACE_PSYCHOLOGY_FACTS 
    : SPACE_PSYCHOLOGY_FACTS.filter(f => f.category === activeCategory);

  const handleVoiceReadout = (fact: SpacePsychologyFact) => {
    hudAudio.playJarvisChime();
    const text = `${fact.title}. ${fact.subtitle}. ${fact.summary}. ${fact.details}. Key Takeaway: ${fact.keyTakeaway}`;
    speechEngine.speak(text);
  };

  return (
    <div className="flex flex-col gap-6 w-full font-mono text-pink-200">
      {/* HEADER BANNER */}
      <div className="p-5 rounded-xl hud-glass hud-border border-l-4 border-pink-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300 shadow-[0_0_15px_#ff2a85]">
            <Rocket className="w-7 h-7 animate-pulse text-pink-400" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-widest text-pink-300 uppercase glow-pink flex items-center gap-2">
              SPACE PSYCHOLOGY & NASA BEHAVIORAL HEALTH
              <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                HUMAN FACTORS MATRIX
              </span>
            </h1>
            <p className="text-xs text-pink-200/80 mt-0.5">
              Psychological Resilience, Microgravity Mental Health & NASA Analog Research
            </p>
          </div>
        </div>

        <button
          onClick={() => handleVoiceReadout(selectedFact)}
          className="px-4 py-2.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/40 transition-all flex items-center gap-2 font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(255,42,133,0.3)]"
        >
          <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
          <span>VOICE BRIEFING READOUT</span>
        </button>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2 bg-black/60 p-2 rounded-xl border border-pink-500/20 text-xs">
        <button
          onClick={() => { setActiveCategory('all'); hudAudio.playClick(); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeCategory === 'all' ? 'bg-pink-500 text-black shadow-[0_0_10px_#ff2a85]' : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
          }`}
        >
          ALL CONCEPTS
        </button>
        <button
          onClick={() => { setActiveCategory('overview'); hudAudio.playClick(); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeCategory === 'overview' ? 'bg-pink-500 text-black shadow-[0_0_10px_#ff2a85]' : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
          }`}
        >
          🚀 CORE SPACE PSYCHOLOGY
        </button>
        <button
          onClick={() => { setActiveCategory('nasa'); hudAudio.playClick(); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeCategory === 'nasa' ? 'bg-pink-500 text-black shadow-[0_0_10px_#ff2a85]' : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
          }`}
        >
          🛡️ NASA BHP & ANALOGS
        </button>
        <button
          onClick={() => { setActiveCategory('isolation'); hudAudio.playClick(); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeCategory === 'isolation' ? 'bg-pink-500 text-black shadow-[0_0_10px_#ff2a85]' : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
          }`}
        >
          🌌 ISOLATION & CIRCADIAN
        </button>
        <button
          onClick={() => { setActiveCategory('mars_future'); hudAudio.playClick(); }}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeCategory === 'mars_future' ? 'bg-pink-500 text-black shadow-[0_0_10px_#ff2a85]' : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
          }`}
        >
          🪐 DEEP SPACE MARS FUTURE
        </button>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: KNOWLEDGE GRID + DETAILED TELEMETRY CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: LIST OF CONCEPTS (5 COLUMNS) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 max-h-[620px] overflow-y-auto scrollbar-none pr-1">
          {filteredFacts.map((fact) => {
            const isSelected = selectedFact.id === fact.id;
            return (
              <button
                key={fact.id}
                onClick={() => {
                  setSelectedFact(fact);
                  hudAudio.playClick();
                }}
                className={`p-3.5 rounded-xl text-left transition-all border flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-pink-500/20 border-pink-400 text-white shadow-[0_0_15px_rgba(255,42,133,0.3)]'
                    : 'bg-black/60 border-pink-500/20 text-pink-300/80 hover:bg-pink-500/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base">{fact.icon}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {fact.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-pink-200 tracking-wide">
                  {fact.title}
                </h3>
                <p className="text-[11px] text-pink-300/70 line-clamp-2 leading-relaxed">
                  {fact.summary}
                </p>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: DETAILED TELEMETRY DEEP DIVE (7 COLUMNS) */}
        <div className="lg:col-span-7 p-5 rounded-xl hud-glass hud-border flex flex-col gap-4 border-l-4 border-pink-500">
          <div className="flex justify-between items-start border-b border-pink-500/20 pb-3">
            <div>
              <span className="text-[10px] px-2.5 py-1 rounded font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40">
                {selectedFact.subtitle}
              </span>
              <h2 className="text-lg font-bold text-pink-300 mt-2 uppercase tracking-wide glow-pink flex items-center gap-2">
                <span>{selectedFact.icon}</span>
                <span>{selectedFact.title}</span>
              </h2>
            </div>

            <button
              onClick={() => handleVoiceReadout(selectedFact)}
              className="p-2.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/40 transition-all shrink-0"
              title="Play Audio Readout"
            >
              <Volume2 className="w-5 h-5 text-pink-400 animate-pulse" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs text-pink-100 leading-relaxed overflow-y-auto max-h-[460px] scrollbar-none pr-1">
            <div className="p-3.5 bg-black/70 rounded-xl border border-pink-500/20 space-y-1">
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-pink-400" />
                EXECUTIVE SUMMARY
              </span>
              <p className="text-white font-semibold text-sm leading-snug">{selectedFact.summary}</p>
            </div>

            <div className="p-3.5 bg-black/70 rounded-xl border border-pink-500/20 space-y-1.5">
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-pink-400" />
                NEUROPSYCHOLOGICAL & OPERATIONAL DETAILS
              </span>
              <p className="leading-relaxed text-pink-100">{selectedFact.details}</p>
            </div>

            <div className="p-3.5 bg-pink-500/10 rounded-xl border border-pink-500/30 space-y-1 text-pink-200">
              <span className="text-[10px] text-pink-300 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400" />
                KEY MISSION TAKEAWAY
              </span>
              <p className="font-semibold text-xs text-pink-200">{selectedFact.keyTakeaway}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER METRICS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-black/60 p-4 rounded-xl border border-pink-500/20 text-xs text-center">
        <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
          <span className="text-[10px] text-pink-400 font-bold uppercase block">NASA ANALOG DURATION</span>
          <p className="text-pink-300 font-bold text-sm mt-0.5">378 Days (CHAPEA)</p>
        </div>
        <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
          <span className="text-[10px] text-pink-400 font-bold uppercase block">COMMUNICATION DELAY</span>
          <p className="text-pink-300 font-bold text-sm mt-0.5">Up to 22 Mins Each Way</p>
        </div>
        <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
          <span className="text-[10px] text-pink-400 font-bold uppercase block">ISS ORBITAL SUNRISES</span>
          <p className="text-pink-300 font-bold text-sm mt-0.5">16 Per 24 Hours</p>
        </div>
        <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
          <span className="text-[10px] text-pink-400 font-bold uppercase block">PRIMARY RESEARCH HUB</span>
          <p className="text-pink-300 font-bold text-sm mt-0.5">NASA JSC (Houston, TX)</p>
        </div>
      </div>
    </div>
  );
}
