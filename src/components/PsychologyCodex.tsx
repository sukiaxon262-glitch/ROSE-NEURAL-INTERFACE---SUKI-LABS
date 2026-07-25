import React, { useState } from 'react';
import { PsychologyProfile } from '../types';
import { Brain, Activity, Sparkles, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { hudAudio } from '../lib/audioSynthesizer';

interface Props {
  onTriggerSimulation: (type: any, title: string, notes: string) => void;
}

const PSYCHOLOGY_DATABASE: PsychologyProfile[] = [
  {
    id: 'cbt_restructuring',
    name: 'Cognitive Behavioral Restructuring (CBT)',
    category: 'Therapy Framework',
    description: 'Systematic identification and reframing of automatic negative thoughts and cognitive distortions to alter emotional distress and maladaptive behavior.',
    keyBrainRegions: ['Dorsolateral Prefrontal Cortex', 'Ventral Striatum', 'Anterior Cingulate Cortex'],
    primaryNeurotransmitters: ['Glutamate', 'Dopamine', 'Serotonin'],
    clinicalInterventions: ['Thought Records', 'Behavioral Experiments', 'Decatastrophizing', 'Cognitive Reframing'],
    axolotlParallel: 'Much like an axolotl regrowing a damaged nerve trunk along original axonal pathways, cognitive restructuring rebuilds synaptic pathways across prefrontal circuits.'
  },
  {
    id: 'dopamine_reward_pathway',
    name: 'Dopaminergic Mesolimbic Pathway',
    category: 'Neuroscience',
    description: 'Ventral Tegmental Area (VTA) to Nucleus Accumbens reward and motivation circuit governing incentive salience, goal-directed behavior, and reinforcement learning.',
    keyBrainRegions: ['Ventral Tegmental Area', 'Nucleus Accumbens', 'Medial Prefrontal Cortex'],
    primaryNeurotransmitters: ['Dopamine', 'Glutamate', 'GABA'],
    clinicalInterventions: ['Behavioral Activation', 'Dopamine Fasting/Reset', 'Micro-goal Chunking'],
    axolotlParallel: 'VTA dopamine bursts mirror the metabolic signal surge in axolotl blastema cells driving rapid cellular proliferation during limb repair.'
  },
  {
    id: 'hpa_axis_stress',
    name: 'HPA Axis & Cortisol Stress Cascades',
    category: 'Clinical Condition',
    description: 'Hypothalamic-Pituitary-Adrenal axis neuroendocrine response to chronic stress, leading to cortisol dysregulation, hippocampal atrophy, and limbic hyperreactivity.',
    keyBrainRegions: ['Hypothalamus', 'Pituitary Gland', 'Adrenal Cortex', 'Hippocampus'],
    primaryNeurotransmitters: ['Corticotropin-Releasing Hormone (CRH)', 'ACTH', 'Cortisol', 'Norepinephrine'],
    clinicalInterventions: ['DBT Distress Tolerance', 'Somatic Grounding', 'Vagus Nerve Stimulation', 'Mindfulness'],
    axolotlParallel: 'Unlike human tissue scarring under elevated stress/cortisol, axolotls suppress fibrosis and macrophage degradation to maintain blastema fluidity.'
  },
  {
    id: 'gaba_glutamate_equilibrium',
    name: 'GABA-Glutamate Excitation/Inhibition Balance',
    category: 'Neuroscience',
    description: 'The master balance between excitatory Glutamate transmission and inhibitory GABAergic control. Imbalances underlie generalized anxiety, epilepsy, and executive overload.',
    keyBrainRegions: ['Cerebral Cortex', 'Thalamus', 'Basal Ganglia'],
    primaryNeurotransmitters: ['GABA', 'Glutamate'],
    clinicalInterventions: ['Diaphragmatic Breathing', 'GABAergic Modulation', 'Sensory Modulation'],
    axolotlParallel: 'In axolotl spinal re-innervation, GABAergic interneurons re-establish synaptic gating to prevent hyper-spastic muscle twitches during limb regrowth.'
  },
  {
    id: 'dbt_emotional_regulation',
    name: 'Dialectical Behavior Therapy (DBT)',
    category: 'Therapy Framework',
    description: 'Combines CBT cognitive modification with Zen mindfulness and distress tolerance to treat severe emotional dysregulation and borderline traits.',
    keyBrainRegions: ['Orbitofrontal Cortex', 'Insula', 'Amygdala'],
    primaryNeurotransmitters: ['Serotonin', 'Oxytocin', 'Endorphins'],
    clinicalInterventions: ['TIPP Skills (Temperature, Intense Exercise, Paced Breathing)', 'Radical Acceptance', 'DEAR MAN'],
    axolotlParallel: 'Radical acceptance aligns with axolotl blastema cell dedifferentiation: accepting the current loss state as raw material for structural transformation.'
  },
  {
    id: 'executive_dysfunction_adhd',
    name: 'Executive Dysfunction & ADHD Networks',
    category: 'Clinical Condition',
    description: 'Impairment in working memory, response inhibition, and task switching stemming from hypo-dopaminergic frontostriatal network dysregulation.',
    keyBrainRegions: ['Prefrontal Cortex', 'Basal Ganglia', 'Cerebellum'],
    primaryNeurotransmitters: ['Dopamine', 'Norepinephrine'],
    clinicalInterventions: ['External Executive Buffers', 'Pomodoro Time Structuring', 'Stimulant Pharmacotherapy'],
    axolotlParallel: 'Axolotls exhibit extreme paedomorphism (retaining juvenile traits into adulthood), providing high neuroplasticity similar to juvenile brain adaptability.'
  }
];

export const PsychologyCodex: React.FC<Props> = ({ onTriggerSimulation }) => {
  const [selectedProfile, setSelectedProfile] = useState<PsychologyProfile>(PSYCHOLOGY_DATABASE[0]);

  const handleSelect = (profile: PsychologyProfile) => {
    setSelectedProfile(profile);
    hudAudio.playClick();
  };

  const launchSim = (profile: PsychologyProfile) => {
    let simType: any = 'dopamine_synapse';
    if (profile.id === 'cbt_restructuring') simType = 'cbt_cognitive_loop';
    else if (profile.id === 'hpa_axis_stress') simType = 'cortisol_stress_loop';
    else if (profile.id === 'gaba_glutamate_equilibrium') simType = 'gaba_glutamate_balance';
    else if (profile.id === 'dbt_emotional_regulation') simType = 'prefrontal_amygdala_axis';

    onTriggerSimulation(
      simType,
      profile.name,
      `Clinical simulation triggered for ${profile.name}. Brain regions involved: ${profile.keyBrainRegions.join(', ')}.`
    );
  };

  return (
    <div className="p-5 rounded-xl hud-glass hud-border shadow-[0_0_25px_rgba(236,72,153,0.15)] flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#ff2a85]/20">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#ff2a85]" />
          <h3 className="font-mono font-bold text-sm text-[#ff69b4] tracking-widest uppercase">
            PSYCHOLOGY & NEUROSCIENCE CODEX
          </h3>
        </div>
        <span className="text-xs font-mono text-[#ffb6c1]/70">
          {PSYCHOLOGY_DATABASE.length} CLINICAL MODULES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module Selection List */}
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
          {PSYCHOLOGY_DATABASE.map(profile => (
            <button
              key={profile.id}
              onClick={() => handleSelect(profile)}
              className={`p-3 rounded-xl font-mono text-left text-xs transition-all border flex flex-col gap-1 ${
                selectedProfile.id === profile.id
                  ? 'bg-[#ff2a85]/20 text-[#ff69b4] border-[#ff2a85] shadow-[0_0_15px_rgba(255,42,133,0.3)]'
                  : 'bg-black/50 text-gray-300 border-gray-800 hover:border-[#ff2a85]/40 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{profile.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff2a85]/30 text-[#ffb6c1]">
                  {profile.category}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Module Detail View */}
        <div className="md:col-span-2 p-4 rounded-xl bg-black/60 border border-[#ff2a85]/30 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-bold text-base text-[#ff69b4]">{selectedProfile.name}</h4>
              <button
                onClick={() => launchSim(selectedProfile)}
                className="px-3 py-1.5 text-xs font-mono bg-[#ff2a85] hover:bg-[#ff1493] text-white rounded-lg font-bold shadow-[0_0_15px_#ff2a85] transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                SIMULATE IN 3D
              </button>
            </div>

            <p className="text-xs text-[#ffb6c1] leading-relaxed">{selectedProfile.description}</p>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#ff2a85]/20 text-xs font-mono">
                <span className="text-[#ff2a85] font-bold block mb-1">KEY BRAIN REGIONS</span>
                <span className="text-[#ffb6c1]/90">{selectedProfile.keyBrainRegions.join(', ')}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#ff2a85]/20 text-xs font-mono">
                <span className="text-[#ff2a85] font-bold block mb-1">NEUROTRANSMITTERS</span>
                <span className="text-[#ffb6c1]/90">{selectedProfile.primaryNeurotransmitters.join(', ')}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/30 text-xs font-mono text-[#39ff14] mt-1">
              <span className="font-bold block mb-0.5">AXOLOTL BIOLOGICAL PARALLEL:</span>
              <span className="text-gray-200">{selectedProfile.axolotlParallel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
