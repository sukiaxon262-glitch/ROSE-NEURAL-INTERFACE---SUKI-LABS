import React, { useState } from 'react';
import { Telescope, Sparkles, Volume2, Globe, Rocket, Award, Star, History, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { speechEngine } from '../lib/speechEngine';
import { hudAudio } from '../lib/audioSynthesizer';

export interface HubbleDiscovery {
  id: string;
  year: string;
  title: string;
  category: 'Cosmology' | 'Deep Field' | 'Astrophysics' | 'Exoplanets';
  summary: string;
  significance: string;
  funFact: string;
  simulationType?: string;
}

const HUBBLE_DISCOVERIES: HubbleDiscovery[] = [
  {
    id: 'hubble_constant',
    year: '1990s - 2001',
    title: 'Precision Measurement of Universe Expansion Rate',
    category: 'Cosmology',
    summary: 'Hubble measured Cepheid variable stars in distant galaxies to calculate the expansion rate (Hubble Constant) within 10% accuracy.',
    significance: 'Nailed down the precise age of the Universe to approximately 13.8 billion years, eliminating prior estimates ranging wildly between 10 and 20 billion years.',
    funFact: 'Named after astronomer Edwin Hubble, who first proved in 1929 that galaxies are moving away from each other.',
    simulationType: 'dopamine_synapse'
  },
  {
    id: 'deep_field',
    year: '1995 / 2004',
    title: 'The Hubble Deep & Ultra Deep Fields',
    category: 'Deep Field',
    summary: 'Pointing at a seemingly pitch-black, empty keyhole of sky for 10 days straight revealed over 10,000 ancient galaxies in various stages of evolution.',
    significance: 'Revolutionized observational cosmology by proving the observable universe contains hundreds of billions of galaxies extending back almost to the Big Bang.',
    funFact: 'The slice of sky targeted in the Hubble Ultra Deep Field was equivalent to looking through a 1mm x 1mm square of paper held 1 meter away.',
    simulationType: 'amygdala_response'
  },
  {
    id: 'dark_energy',
    year: '1998',
    title: 'Discovery of Accelerating Cosmic Expansion & Dark Energy',
    category: 'Cosmology',
    summary: 'By observing Type Ia supernovae in ultra-faint distant galaxies, Hubble helped prove that cosmic expansion is accelerating rather than slowing down.',
    significance: 'Led to the realization that an enigmatic force called Dark Energy constitutes roughly 68% of the total mass-energy content of the universe.',
    funFact: 'This discovery won the 2011 Nobel Prize in Physics for Saul Perlmutter, Brian P. Schmidt, and Adam G. Riess.',
    simulationType: 'cbt_restructuring'
  },
  {
    id: 'pillars_of_creation',
    year: '1995 / 2014',
    title: 'The Pillars of Creation in the Eagle Nebula (M16)',
    category: 'Astrophysics',
    summary: 'Hubble captured iconic high-resolution optical and infrared imagery of massive columns of interstellar gas and dust sculpting newborn stars.',
    significance: 'Provided unprecedented spatial resolution into the mechanics of star formation and photoevaporation driven by intense ultraviolet stellar winds.',
    funFact: 'The tallest column of gas in the Pillars of Creation is approximately 4 light-years long—about the distance from our Sun to Proxima Centauri!',
    simulationType: 'serotonin_pathway'
  },
  {
    id: 'exoplanet_atmospheres',
    year: '2001 - Present',
    title: 'First Chemical Detection in Exoplanet Atmospheres',
    category: 'Exoplanets',
    summary: 'Hubble made the first direct spectrographic measurement of sodium, water vapor, methane, and carbon dioxide in the atmospheres of planets orbiting other stars.',
    significance: 'Pioneered exoplanetary transmission spectroscopy, laying the foundation for searching for atmospheric biosignatures on alien worlds.',
    funFact: 'Hubble detected water vapor in the habitable zone exoplanet K2-18b, located 110 light-years away in the constellation Leo.'
  },
  {
    id: 'pluto_moons',
    year: '2005 - 2012',
    title: 'Discovery of Pluto\'s Small Moons',
    category: 'Astrophysics',
    summary: 'Hubble discovered four tiny previously unknown moons orbiting Pluto: Nix, Hydra, Kerberos, and Styx.',
    significance: 'Crucial for mapping potential debris fields and hazards for NASA\'s New Horizons spacecraft prior to its historic 2015 Pluto flyby.',
    funFact: 'Because Pluto\'s gravitational field fluctuates, these small moons tumble chaotically in orbit rather than rotating smoothly!'
  }
];

const HUBBLE_COOL_FACTS = [
  {
    title: 'Laser Pointer Precision',
    description: 'Hubble can lock onto a target without deviating more than 7/1000ths of an arcsecond—the equivalent of holding a laser beam steady on a dime 200 miles away on a moving car.'
  },
  {
    title: 'Zero Thruster Motion',
    description: 'Hubble has no rocket thrusters! To rotate or point toward a new target, it uses Newton\'s 3rd Law by spinning internal heavy flywheel gyroscopes and reaction wheels.'
  },
  {
    title: '1.5 Million+ Observations',
    description: 'Since its launch in 1990, Hubble has completed over 1.5 million observations, yielding data that informed more than 18,000 published peer-reviewed scientific papers.'
  },
  {
    title: 'The Great Glasses Fix (COSTAR)',
    description: 'Hubble\'s 2.4-meter primary mirror was ground 2 microns too flat at the edge (spherical aberration). Astronauts fixed it in 1993 by installing corrective optics called COSTAR, effectively giving Hubble "glasses"!'
  },
  {
    title: 'Orbit Speed & Distance',
    description: 'Hubble orbits Earth at ~17,000 mph (27,300 km/h) at an altitude of ~535 km, completing one full trip around Earth every 95 minutes.'
  }
];

interface HubbleSpaceTelescopeProps {
  onTriggerSimulation: (type: any, title: string, notes: string) => void;
}

export const HubbleSpaceTelescope: React.FC<HubbleSpaceTelescopeProps> = ({ onTriggerSimulation }) => {
  const [selectedDiscovery, setSelectedDiscovery] = useState<HubbleDiscovery>(HUBBLE_DISCOVERIES[0]);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const speakDiscovery = (discovery: HubbleDiscovery) => {
    hudAudio.playClick();
    const text = `${discovery.title}. ${discovery.summary}. Significance: ${discovery.significance}`;
    speechEngine.speak(text);
  };

  const filteredDiscoveries = HUBBLE_DISCOVERIES.filter((d) => {
    if (filterCategory === 'All') return true;
    return d.category === filterCategory;
  });

  return (
    <div className="p-4 sm:p-5 rounded-xl hud-glass hud-border shadow-[0_0_25px_rgba(236,72,153,0.15)] flex flex-col gap-5 text-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-pink-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-300">
            <Telescope className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-pink-400 uppercase tracking-widest glow-pink flex items-center gap-2">
              NASA HUBBLE SPACE TELESCOPE CODEX
              <span className="text-[10px] bg-pink-500/20 px-2 py-0.5 rounded text-pink-300 border border-pink-500/30">
                SUKI LABS
              </span>
            </h2>
            <p className="text-[10px] text-pink-300/70">
              History, key metrics, mind-blowing discoveries, and astrophysical milestones of humanity's eye on the cosmos.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {['All', 'Cosmology', 'Deep Field', 'Astrophysics', 'Exoplanets'].map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilterCategory(cat); hudAudio.playClick(); }}
              className={`px-2.5 py-1.5 min-h-[36px] rounded text-[10px] font-bold uppercase transition-all shrink-0 ${
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

      {/* Quick Specs HUD Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-pink-300/60 uppercase font-bold flex items-center gap-1">
            <Rocket className="w-3 h-3 text-pink-400" /> LAUNCH DATE
          </span>
          <span className="text-sm sm:text-base font-bold text-pink-200 mt-1">APRIL 24, 1990</span>
          <span className="text-[9px] text-pink-400/80">Space Shuttle Discovery (STS-31)</span>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-pink-300/60 uppercase font-bold flex items-center gap-1">
            <Globe className="w-3 h-3 text-pink-400" /> ORBIT ALTITUDE
          </span>
          <span className="text-sm sm:text-base font-bold text-pink-200 mt-1">535 KM (~332 MI)</span>
          <span className="text-[9px] text-pink-400/80">95 min per Earth orbit</span>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-pink-300/60 uppercase font-bold flex items-center gap-1">
            <Star className="w-3 h-3 text-pink-400" /> PRIMARY MIRROR
          </span>
          <span className="text-sm sm:text-base font-bold text-pink-200 mt-1">2.4 METERS (7.9 FT)</span>
          <span className="text-[9px] text-pink-400/80">Ultra-smooth polished glass</span>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-pink-300/60 uppercase font-bold flex items-center gap-1">
            <Award className="w-3 h-3 text-pink-400" /> TOTAL OBSERVATIONS
          </span>
          <span className="text-sm sm:text-base font-bold text-pink-200 mt-1">1.5 MILLION+</span>
          <span className="text-[9px] text-pink-400/80">18,000+ scientific papers</span>
        </div>
      </div>

      {/* Main Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Featured Discovery Detail Card */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-pink-500/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40">
                    {selectedDiscovery.category}
                  </span>
                  <span className="text-[10px] text-pink-400 font-bold">YEAR: {selectedDiscovery.year}</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-pink-300 uppercase tracking-wider glow-pink">
                  {selectedDiscovery.title}
                </h3>
              </div>

              <button
                onClick={() => speakDiscovery(selectedDiscovery)}
                className="p-2 min-h-[38px] rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/30 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
                title="Listen to discovery audio"
              >
                <Volume2 className="w-4 h-4 text-pink-400" />
                <span>SPEAK</span>
              </button>
            </div>

            {/* Summary Box */}
            <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Telescope className="w-3.5 h-3.5" /> OBSERVATIONAL SUMMARY:
              </h4>
              <p className="text-xs sm:text-sm text-pink-100 leading-relaxed font-medium">
                {selectedDiscovery.summary}
              </p>
            </div>

            {/* Scientific Significance */}
            <div className="p-3.5 rounded-xl bg-black/80 border border-pink-500/20">
              <h4 className="text-[10px] font-bold text-pink-300 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" /> HISTORICAL & SCIENTIFIC IMPACT:
              </h4>
              <p className="text-xs text-pink-200/90 leading-relaxed">
                {selectedDiscovery.significance}
              </p>
            </div>

            {/* Fun Fact Callout */}
            <div className="p-3.5 rounded-xl bg-[#39ff14]/10 border border-[#39ff14]/30">
              <h4 className="text-[10px] font-bold text-[#39ff14] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#39ff14]" /> SUKI LABS COSMIC FACT:
              </h4>
              <p className="text-xs text-emerald-300 leading-relaxed">
                {selectedDiscovery.funFact}
              </p>
            </div>
          </div>

          {/* Action Simulation Trigger */}
          {selectedDiscovery.simulationType && (
            <div className="pt-2">
              <button
                onClick={() => onTriggerSimulation(selectedDiscovery.simulationType, selectedDiscovery.title, selectedDiscovery.summary)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-pink-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_12px_#ec4899] hover:bg-pink-400 transition-all uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" />
                <span>SIMULATE COSMIC MODEL IN 3D MATRIX</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Discoveries List Selector */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4" /> MAJOR HISTORIC DISCOVERIES ({filteredDiscoveries.length}):
          </h3>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredDiscoveries.map((disc) => {
              const isSelected = selectedDiscovery.id === disc.id;
              return (
                <div
                  key={disc.id}
                  onClick={() => { setSelectedDiscovery(disc); hudAudio.playClick(); }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-pink-500/20 border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                      : 'bg-black/50 border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-pink-400">{disc.year}</span>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-pink-500/15 text-pink-300 border border-pink-500/30">
                      {disc.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-pink-200 line-clamp-1">{disc.title}</h4>
                  <p className="text-[11px] text-pink-300/70 line-clamp-2 leading-tight">
                    {disc.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Mind-Blowing Telescope Engineering Facts */}
      <div className="pt-3 border-t border-pink-500/20">
        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> MIND-BLOWING HUBBLE ENGINEERING FACTS:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HUBBLE_COOL_FACTS.map((fact, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-black/50 border border-pink-500/20 flex flex-col gap-1.5">
              <span className="font-bold text-xs text-pink-300 flex items-center gap-1.5">
                <span className="text-pink-500 font-bold">#{idx + 1}</span> {fact.title}
              </span>
              <p className="text-[11px] text-pink-200/80 leading-relaxed">
                {fact.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
