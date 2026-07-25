import React, { useState } from 'react';
import { AxolotlMorph } from '../types';
import { Dna, Droplets, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { hudAudio } from '../lib/audioSynthesizer';

interface Props {
  onTriggerSimulation: (type: any, title: string, notes: string) => void;
}

const AXOLOTL_MORPHS: AxolotlMorph[] = [
  {
    id: 'wildtype',
    name: 'Wildtype (Ambystoma mexicanum)',
    geneticCode: 'D/D, M/M, A/A',
    description: 'Dark olive, brown, or black pigment with shiny iridophore flecks. Retains original ancestral genetic pigmentation from Lake Xochimilco.',
    regenerationCapability: 'Complete limb, cardiac ventricle, spinal cord, and cerebral cortex tissue regeneration without scar tissue.',
    waterRequirements: 'Temp 16-18°C (60-64°F), pH 7.4-7.8, GH 7-14 dGH, KH 3-8 dKH, Zero Ammonia/Nitrite.'
  },
  {
    id: 'leucistic',
    name: 'Leucistic (Pink / White)',
    geneticCode: 'd/d, M/M, A/A',
    description: 'Translucent pinkish-white body with vivid dark ruby/black eyes and feathery magenta gill rami. Lacks cutaneous melanophores.',
    regenerationCapability: 'Provides optical translucency allowing direct microscopic observation of blastema formation and nerve re-innervation.',
    waterRequirements: 'Low lighting environment to protect non-pigmented epidermal cells from UV stress.'
  },
  {
    id: 'gfp_luminescent',
    name: 'GFP Green Fluorescent Morph',
    geneticCode: 'Transgenic Green Fluorescent Protein',
    description: 'Emits intense 509nm green luminescence under 470nm blue/UV wavelength light. Transferred from Aequorea victoria jellyfish gene constructs.',
    regenerationCapability: 'Extensively utilized in biomedical labs to trace cell lineage during blastema cell dedifferentiation and redifferentiation.',
    waterRequirements: 'Standard pristine cold-water parameters with strict nitrogen cycle filtration.'
  },
  {
    id: 'melanoid',
    name: 'Melanoid (Matte Black)',
    geneticCode: 'm/m',
    description: 'Velvety jet-black coloration completely lacking shiny iridophores or yellow xanthophores. Recessive melanoid gene mutation.',
    regenerationCapability: 'High dermal collagen remodeling rate; suppresses fibrotic scarring via early macrophage recruitment.',
    waterRequirements: 'Requires calm water movement to prevent gill filament stress.'
  }
];

export const AxolotlBiologyCodex: React.FC<Props> = ({ onTriggerSimulation }) => {
  const [selectedMorph, setSelectedMorph] = useState<AxolotlMorph>(AXOLOTL_MORPHS[1]);

  const handleSelect = (morph: AxolotlMorph) => {
    setSelectedMorph(morph);
    hudAudio.playClick();
  };

  const triggerAxolotlSim = () => {
    onTriggerSimulation(
      'axolotl_blastema_regeneration',
      `Axolotl Blastema Regeneration - ${selectedMorph.name}`,
      `Blastema formation active for ${selectedMorph.name}. Extracellular matrix remodeling and cell dedifferentiation underway.`
    );
  };

  return (
    <div className="p-5 rounded-xl hud-glass hud-border shadow-[0_0_25px_rgba(57,255,20,0.15)] flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#39ff14]/20">
        <div className="flex items-center gap-2">
          <Dna className="w-5 h-5 text-[#39ff14]" />
          <h3 className="font-mono font-bold text-sm text-[#39ff14] tracking-widest uppercase">
            AXOLOTL REGENERATION & GENETICS CODEX
          </h3>
        </div>
        <span className="text-xs font-mono text-[#39ff14]/80">
          AMBYSTOMA MEXICANUM DATABASE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Morph List */}
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
          {AXOLOTL_MORPHS.map(morph => (
            <button
              key={morph.id}
              onClick={() => handleSelect(morph)}
              className={`p-3 rounded-xl font-mono text-left text-xs transition-all border flex flex-col gap-1 ${
                selectedMorph.id === morph.id
                  ? 'bg-[#39ff14]/20 text-[#39ff14] border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                  : 'bg-black/50 text-gray-300 border-gray-800 hover:border-[#39ff14]/40 hover:text-white'
              }`}
            >
              <span className="font-bold">{morph.name}</span>
              <span className="text-[10px] text-[#ff69b4]">CODE: {morph.geneticCode}</span>
            </button>
          ))}
        </div>

        {/* Selected Morph Detail View */}
        <div className="md:col-span-2 p-4 rounded-xl bg-black/60 border border-[#39ff14]/30 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-mono font-bold text-base text-[#39ff14]">{selectedMorph.name}</h4>
                <span className="text-xs font-mono text-[#ffb6c1]">GENOTYPE: {selectedMorph.geneticCode}</span>
              </div>

              <button
                onClick={triggerAxolotlSim}
                className="px-3 py-1.5 text-xs font-mono bg-[#39ff14] hover:bg-[#228b22] text-black rounded-lg font-bold shadow-[0_0_15px_#39ff14] transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                SIMULATE BLASTEMA
              </button>
            </div>

            <p className="text-xs text-gray-200 leading-relaxed">{selectedMorph.description}</p>

            <div className="p-3 rounded-lg bg-black/50 border border-[#ff2a85]/30 text-xs font-mono">
              <span className="text-[#ff2a85] font-bold block mb-1">REGENERATION MECHANICS</span>
              <span className="text-[#ffb6c1]">{selectedMorph.regenerationCapability}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/30 text-xs font-mono text-[#39ff14]">
              <span className="font-bold block mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-[#39ff14]" />
                HABITAT WATER PARAMETERS
              </span>
              <span className="text-gray-300">{selectedMorph.waterRequirements}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
