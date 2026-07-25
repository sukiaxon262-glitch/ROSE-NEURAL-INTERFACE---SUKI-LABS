export type SimulationType =
  | 'dopamine_synapse'
  | 'serotonin_pathway'
  | 'gaba_glutamate_balance'
  | 'prefrontal_amygdala_axis'
  | 'cortisol_stress_loop'
  | 'axolotl_blastema_regeneration'
  | 'axolotl_spinal_repair'
  | 'cbt_cognitive_loop';

export interface SimulationState {
  active: boolean;
  type: SimulationType;
  title: string;
  targetStructure: string;
  intensity: number; // 1 to 100
  keyNeurotransmitters: string[];
  clinicalNotes: string;
  particleCount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolCallTriggered?: {
    type: string;
    details: string;
  };
}

export interface PsychologyProfile {
  id: string;
  name: string;
  category: 'Neuroscience' | 'Clinical Condition' | 'Therapy Framework' | 'Historical Theory';
  description: string;
  keyBrainRegions: string[];
  primaryNeurotransmitters: string[];
  clinicalInterventions: string[];
  axolotlParallel: string;
}

export interface AxolotlMorph {
  id: string;
  name: string;
  geneticCode: string;
  description: string;
  regenerationCapability: string;
  waterRequirements: string;
}
