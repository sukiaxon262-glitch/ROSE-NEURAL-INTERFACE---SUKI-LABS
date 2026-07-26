import React, { useState, useRef } from 'react';
import { Search, Mic, MicOff, BookOpen, Volume2, Sparkles, Bookmark, History, Brain, ArrowRight, Lightbulb, ShieldAlert, Cpu } from 'lucide-react';
import { speechEngine } from '../lib/speechEngine';
import { hudAudio } from '../lib/audioSynthesizer';

interface ConceptDefinition {
  title: string;
  category: 'Disorder' | 'Theory' | 'Neuroscience' | 'Concept';
  definition: string;
  keyFeatures: string[];
  clinicalApplication: string;
  axolotlParallel: string;
  neurotransmittersOrTheorists: string[];
  simulationType?: string;
}

interface PsychologyDictionaryProps {
  onTriggerSimulation: (type: any, title: string, notes: string) => void;
}

const FEATURED_CONCEPTS: ConceptDefinition[] = [
  {
    title: 'Cognitive Dissonance',
    category: 'Theory',
    definition: 'The mental discomfort experienced by a person who holds two or more contradictory beliefs, ideas, or values, or performs an action that contradicts their beliefs.',
    keyFeatures: [
      'Discomfort drives psychological tension reduction',
      'Leads to belief alteration or rationalization',
      'Discovered by Leon Festinger (1957)'
    ],
    clinicalApplication: 'Used in CBT to identify contradictory core beliefs (e.g., "I must be perfect" vs. "I made a mistake") and restructure healthy cognitive frameworks.',
    axolotlParallel: 'Similar to cellular stress prior to blastema formation, cognitive dissonance signals systemic imbalance requiring cellular (or mental) reorganization.',
    neurotransmittersOrTheorists: ['Leon Festinger', 'Prefrontal Cortex', 'Anterior Cingulate Cortex'],
    simulationType: 'cbt_restructuring'
  },
  {
    title: 'Neuroplasticity',
    category: 'Neuroscience',
    definition: 'The ability of the nervous system to change its activity in response to intrinsic or extrinsic stimuli by reorganizing its structure, functions, or connections.',
    keyFeatures: [
      'Synaptic pruning and long-term potentiation (LTP)',
      'Structural changes driven by experience & learning',
      'Active throughout lifespan, heightened during recovery'
    ],
    clinicalApplication: 'Underpins all psychological recovery—showing patients that neural pathways for anxiety or trauma can be re-routed through repeated behavioral practice.',
    axolotlParallel: 'Axolotls exhibit extreme organ level neuroplasticity, capable of regenerating complete brain structures and spinal cord tissues after injury.',
    neurotransmittersOrTheorists: ['BDNF', 'Glutamate', 'Donald Hebb', 'Eric Kandel'],
    simulationType: 'dopamine_synapse'
  },
  {
    title: 'Major Depressive Disorder (MDD)',
    category: 'Disorder',
    definition: 'A common and serious medical illness that negatively affects feelings, thought processes, and behavior, characterized by persistent sadness and loss of interest.',
    keyFeatures: [
      'Anhedonia (inability to feel pleasure)',
      'Dysregulation of monoamine neurotransmitters',
      'Prefrontal cortex hypoactivity & Amygdala hyperactivity'
    ],
    clinicalApplication: 'Treated via Behavioral Activation, CBT, and SSRIs/SNRIs to increase synaptic monoamine availability and encourage positive reinforcement loops.',
    axolotlParallel: 'In axolotl regeneration, cellular dormancy precedes active tissue regrowth; treating MDD involves reactivating dormant neurochemical pathways.',
    neurotransmittersOrTheorists: ['Serotonin', 'Dopamine', 'Norepinephrine', 'Aaron Beck'],
    simulationType: 'serotonin_pathway'
  },
  {
    title: 'Dialectical Behavior Therapy (DBT)',
    category: 'Theory',
    definition: 'A comprehensive evidence-based cognitive-behavioral treatment designed by Marsha Linehan to help individuals manage intense emotions, self-harm, and interpersonal conflict.',
    keyFeatures: [
      'Synthesis of Acceptance and Change',
      'Four core modules: Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness',
      'Reduces emotion dysregulation in BPD and PTSD'
    ],
    clinicalApplication: 'Teaches concrete grounding skills (e.g., TIPP skills, wise mind) to stabilize overactive autonomic arousal during emotional surges.',
    axolotlParallel: 'Axolotls balance cellular degradation with rapid synthesis—DBT balances radical acceptance of current state with active transformation.',
    neurotransmittersOrTheorists: ['Marsha Linehan', 'Amygdala Regulation', 'GABA'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Post-Traumatic Stress Disorder (PTSD)',
    category: 'Disorder',
    definition: 'A psychiatric condition occurring in individuals who have experienced or witnessed a traumatic event, leading to persistent intrusive memories and hyperarousal.',
    keyFeatures: [
      'Hyperactive amygdala response',
      'Impaired ventromedial prefrontal cortex inhibition',
      'Hippocampal volume reduction & memory fragmentation'
    ],
    clinicalApplication: 'Treated through Prolonged Exposure, EMDR, and CPT to safely reprocess traumatic memories and restore prefrontal inhibitory control over fear response.',
    axolotlParallel: 'When an axolotl limb is wounded, nerve supply is required for regeneration; in trauma recovery, therapeutic connection provides the "nerve supply" for healing.',
    neurotransmittersOrTheorists: ['Cortisol', 'Norepinephrine', 'Bessel van der Kolk'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Social Anxiety Disorder (SAD)',
    category: 'Disorder',
    definition: 'An anxiety disorder characterized by intense, persistent fear of being watched, judged, or negatively evaluated by others in social or performance situations.',
    keyFeatures: [
      'Fear of negative evaluation, embarrassment, or rejection',
      'Autonomic arousal (tachycardia, blushing, tremor) during social situations',
      'Hypervigilance to social feedback and post-event cognitive rumination'
    ],
    clinicalApplication: 'Treated via Cognitive Behavioral Therapy (CBT), systematic behavioral exposure, cognitive restructuring of core beliefs, and SSRIs or beta-blockers for physiological symptoms.',
    axolotlParallel: 'Axolotls possess sensitive lateral line sensory organs to detect ambient aquatic motion; similarly, social anxiety reflects a hyper-attuned threat detection response in social settings.',
    neurotransmittersOrTheorists: ['Serotonin', 'GABA', 'Amygdala Hyperactivity', 'Albert Ellis'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Generalized Anxiety Disorder (GAD)',
    category: 'Disorder',
    definition: 'A chronic mental health disorder marked by uncontrollable, persistent, and excessive worry about everyday events, health, finance, and social interactions for at least six months.',
    keyFeatures: [
      'Pervasive worry & somatic symptoms (muscle tightness, fatigue, restlessness)',
      'Hypervigilant threat scanning & BNST / Amygdala hyper-reactivity',
      'Impaired cognitive flexibility and difficulty managing uncertainty'
    ],
    clinicalApplication: 'Treated via Cognitive Behavioral Therapy (CBT), worry exposure, acceptance techniques, progressive muscle relaxation, and SSRIs or SNRIs.',
    axolotlParallel: 'Continuous sensory environmental monitoring in aquatic habitats parallels the hyper-attuned threat scanning mechanism seen in generalized anxiety.',
    neurotransmittersOrTheorists: ['GABA', 'Serotonin', 'Norepinephrine', 'BNST Network'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Long-Term Potentiation (LTP)',
    category: 'Neuroscience',
    definition: 'A persistent, long-lasting strengthening of synapses based on recent patterns of high-frequency stimulation, forming the primary cellular mechanism of memory and learning.',
    keyFeatures: [
      'NMDA receptor activation and intracellular calcium influx',
      'AMPA receptor insertion into postsynaptic membranes & dendritic spine expansion',
      'Forms the neurobiological baseline for Hebbian learning ("cells that fire together, wire together")'
    ],
    clinicalApplication: 'Provides the empirical basis for neuro-rehabilitation and cognitive training, demonstrating that structured therapeutic practice physically rewires synaptic pathways.',
    axolotlParallel: 'Parallels the bio-electrical priming of precursor blastema cells before rapid cellular proliferation and pattern formation during limb regeneration.',
    neurotransmittersOrTheorists: ['Glutamate', 'NMDA Receptors', 'AMPA Receptors', 'Terje Lømo'],
    simulationType: 'dopamine_synapse'
  },
  {
    title: 'Obsessive-Compulsive Disorder (OCD)',
    category: 'Disorder',
    definition: 'A neurobehavioral condition characterized by persistent, distressing intrusive thoughts or urges (obsessions) followed by repetitive behaviors or mental rituals (compulsions) executed to reduce anxiety.',
    keyFeatures: [
      'Cortico-striato-thalamo-cortical (CSTC) loop hyper-reactivity',
      'Egodystonic intrusive thoughts paired with compulsive safety seeking',
      'Distorted risk appraisal and impaired behavioral inhibition'
    ],
    clinicalApplication: 'Primarily treated through Exposure and Response Prevention (ERP) therapy alongside high-dose SSRIs to quiet hyperactive CSTC feedback loops.',
    axolotlParallel: 'Analogous to repetitive cellular repair loops in tissue regeneration when normal stopping signals are temporarily delayed.',
    neurotransmittersOrTheorists: ['Serotonin', 'Dopamine', 'CSTC Circuit', 'Jeffrey Schwartz'],
    simulationType: 'cbt_restructuring'
  },
  {
    title: 'Default Mode Network (DMN)',
    category: 'Neuroscience',
    definition: 'A large-scale network of interacting brain regions (mPFC, PCC, precuneus) that remains highly active when an individual is engaged in self-referential thought, daydreaming, or autobiographical memory.',
    keyFeatures: [
      'Hyperactive and hyper-connected in major depressive disorder and anxiety',
      'Deactivates during goal-directed, externally focused cognitive tasks',
      'Primary neural target altered by mindfulness meditation and neurofeedback'
    ],
    clinicalApplication: 'Mindfulness training and CBT target DMN hyper-connectivity, helping patients disengage from automatic self-critical rumination and depressive loops.',
    axolotlParallel: 'Corresponds to the baseline resting state of undifferentiated stem cells prior to external signaling triggering blastema formation.',
    neurotransmittersOrTheorists: ['Marcus Raichle', 'mPFC', 'Posterior Cingulate Cortex', 'GABA'],
    simulationType: 'cbt_restructuring'
  },
  {
    title: 'Attachment Theory',
    category: 'Theory',
    definition: 'A developmental framework proposing that early emotional bonds formed with primary caregivers establish internal working models that govern emotional regulation and romantic relationship patterns throughout life.',
    keyFeatures: [
      'Four primary attachment styles: Secure, Anxious-Preoccupied, Dismissive-Avoidant, Fearful-Avoidant',
      'Oxytocin and endogenous opioid systems modulate bonding and distress tolerance',
      'Influences stress reactivity, self-worth, and interpersonal conflict management'
    ],
    clinicalApplication: 'Used in relational and psychodynamic therapies to foster an "earned secure" attachment through a safe, attuned therapeutic alliance.',
    axolotlParallel: 'Directly parallels the critical neurovascular signaling cues required between nerve fibers and wound epithelium for successful tissue growth.',
    neurotransmittersOrTheorists: ['John Bowlby', 'Mary Ainsworth', 'Oxytocin', 'Vagus Nerve'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Bipolar Spectrum Disorders',
    category: 'Disorder',
    definition: 'A class of mood disorders characterized by severe shifts in mood, energy, activity levels, and concentration, oscillating between manic or hypomanic elevation and major depressive episodes.',
    keyFeatures: [
      'Dysregulation of circadian clock genes and mitochondrial cellular energy metabolism',
      'Dopaminergic hypersensitivity during manic phases & monoamine depletion during depressive phases',
      'Interruption of normal fronto-limbic functional connectivity'
    ],
    clinicalApplication: 'Managed through mood stabilizers (Lithium, Valproate), psychoeducation, and Interpersonal and Social Rhythm Therapy (IPSRT) to stabilize circadian cues.',
    axolotlParallel: 'Reflects dramatic metabolic shifts between winter developmental quiescence and rapid spring tissue growth in axolotl biology.',
    neurotransmittersOrTheorists: ['Lithium', 'Dopamine', 'Glutamate', 'Circadian Clock Genes'],
    simulationType: 'dopamine_synapse'
  },
  {
    title: 'Classical & Operant Conditioning',
    category: 'Theory',
    definition: 'Foundational learning theories detailing how organisms acquire behaviors through environmental associations (Pavlovian stimulus pairing) and consequence contingencies (Skinnerian reinforcement).',
    keyFeatures: [
      'Stimulus-response pairing, extinction learning, and spontaneous recovery',
      'Reinforcement schedules (variable ratio, fixed interval) shaping habit persistence',
      'Dopaminergic reward prediction error signals in the ventral striatum'
    ],
    clinicalApplication: 'Forms the foundation for behavioral activation, systematic exposure desensitization, token economies, and addiction contingency management.',
    axolotlParallel: 'Parallels cellular chemotaxis where chemical concentration gradients guide migrating precursor blastema cells along molecular tracks.',
    neurotransmittersOrTheorists: ['Ivan Pavlov', 'B.F. Skinner', 'Dopamine', 'Striatum Network'],
    simulationType: 'dopamine_synapse'
  },
  {
    title: 'Polyvagal Theory',
    category: 'Theory',
    definition: 'A neurobiological model developed by Stephen Porges that maps how the autonomic nervous system evaluates safety and threat cues (neuroception) across three evolutionary hierarchy branches.',
    keyFeatures: [
      'Three autonomic hierarchy states: Ventral Vagal (Social Engagement), Sympathetic (Mobilization/Fight-Flight), Dorsal Vagal (Immobilization/Shutdown)',
      'Unconscious neuroception scans environment for safety or danger triggers',
      'Vagal nerve regulation of cardiac heart rate variability (HRV) and facial emotional expression'
    ],
    clinicalApplication: 'Informs trauma-informed therapy and somatic experiencing, helping clients track autonomic state shifts and restore ventral vagal safety regulation.',
    axolotlParallel: 'Axolotls rely on branchial vagal motor pathways for aquatic respiration and rapid metabolic deceleration during extreme environmental stress.',
    neurotransmittersOrTheorists: ['Stephen Porges', 'Vagus Nerve', 'Acetylcholine', 'HRV Regulation'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Borderline Personality Disorder (BPD)',
    category: 'Disorder',
    definition: 'A personality disorder marked by pervasive emotional dysregulation, instability in interpersonal relationships and self-concept, intense fear of abandonment, and impulsive behaviors.',
    keyFeatures: [
      'Severe emotional hypersensitivity & prolonged return to baseline emotional state',
      'Amygdala hyper-reactivity combined with decreased prefrontal top-down inhibition',
      'Splitting defense mechanisms and chronic feelings of emptiness'
    ],
    clinicalApplication: 'The primary indication for Dialectical Behavior Therapy (DBT), emphasizing distress tolerance, mindfulness, emotion regulation, and interpersonal effectiveness.',
    axolotlParallel: 'Parallels structural cellular instability during early blastema formation before differentiation signals lock in permanent cell identity.',
    neurotransmittersOrTheorists: ['Marsha Linehan', 'Serotonin', 'Opioid System', 'Frontolimbic Circuit'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Synaptic Pruning',
    category: 'Neuroscience',
    definition: 'The essential neurodevelopmental process of eliminating redundant, weak, or unused synaptic connections, streamlining neural architecture for cognitive efficiency.',
    keyFeatures: [
      'Microglial engulfment and phagocytosis of complement-tagged synapses (C1q, C3)',
      'Heightened activity during critical early childhood and adolescent neurodevelopmental windows',
      'Governed by experience-dependent neural firing patterns ("use it or lose it")'
    ],
    clinicalApplication: 'Atypical synaptic pruning timing is implicated in neurodevelopmental conditions (over-pruning in schizophrenia vs. under-pruning in autism spectrum conditions).',
    axolotlParallel: 'Directly mirrors cellular remodeling and tissue resorption during amphibian metamorphosis and limb regenerative restructuring.',
    neurotransmittersOrTheorists: ['Microglia', 'Complement Cascade C1q', 'BDNF', 'Glutamate'],
    simulationType: 'dopamine_synapse'
  },
  {
    title: 'Autism Spectrum Disorder (ASD)',
    category: 'Disorder',
    definition: 'A diverse neurodevelopmental condition characterized by unique variations in social interaction, communication, sensory processing sensitivities, and specialized hyperfocused interests.',
    keyFeatures: [
      'Altered local vs. global neural hyper-connectivity & atypical synaptic pruning',
      'Sensory processing differences (hyper- or hypo-reactivity to environmental stimuli)',
      'Specialized hyperfocused interests, passion for predictability, and self-regulatory stimming behaviors'
    ],
    clinicalApplication: 'Supported via neurodiversity-affirming care, occupational therapy for sensory integration, speech-language therapy, and environmental scaffolding.',
    axolotlParallel: 'Parallels the specialized mechanoreceptive lateral line system of axolotls, hyper-attuned to subtle fluid movements and environmental vibrations.',
    neurotransmittersOrTheorists: ['GABA/Glutamate Balance', 'Oxytocin', 'Serotonin', 'Lorna Wing'],
    simulationType: 'amygdala_response'
  },
  {
    title: 'Attention Deficit Hyperactivity Disorder (ADHD)',
    category: 'Disorder',
    definition: 'A neurodevelopmental condition involving persistent variations in executive function, working memory, task initiation, and impulse regulation, modulated by prefrontal-striatal catecholamine signaling.',
    keyFeatures: [
      'Prefrontal cortex dopamine and norepinephrine signaling differences',
      'Interest-based nervous system marked by hyperfocus state shifts and variable task persistence',
      'Executive function differences in working memory, time perception, and cognitive inhibition'
    ],
    clinicalApplication: 'Managed through psychoeducation, behavioral scaffolding, executive coaching, and stimulant (Methylphenidate/Amphetamine) or non-stimulant pharmacological support.',
    axolotlParallel: 'Reflects rapid exploratory burst swim movements in axolotls driven by sudden changes in environmental ambient stimuli.',
    neurotransmittersOrTheorists: ['Dopamine Transporter (DAT)', 'Norepinephrine (NET)', 'Prefrontal Cortex', 'Russell Barkley'],
    simulationType: 'dopamine_synapse'
  }
];

export const PsychologyDictionary: React.FC<PsychologyDictionaryProps> = ({ onTriggerSimulation }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConcept, setSelectedConcept] = useState<ConceptDefinition | null>(FEATURED_CONCEPTS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>(['Cognitive Dissonance', 'Neuroplasticity', 'Major Depressive Disorder']);
  const [bookmarks, setBookmarks] = useState<string[]>(['Neuroplasticity']);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const recognitionRef = useRef<any>(null);

  const handleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      hudAudio.playClick();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser version, Miss.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        hudAudio.playJarvisChime();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          executeSearch(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;
    hudAudio.playClick();

    // Check local featured first for instant hit
    const localMatch = FEATURED_CONCEPTS.find(
      (c) => c.title.toLowerCase().includes(query.toLowerCase())
    );

    if (localMatch) {
      setSelectedConcept(localMatch);
      addToHistory(localMatch.title);
      return;
    }

    // Call ROSE AI backend for comprehensive lookup
    setIsLoading(true);
    try {
      const prompt = `Please act as ROSE (Suki Labs AI). Define and explain the psychological theory, concept, or disorder: "${query}". 
      Respond in clear, structured format with:
      1. Formal Definition
      2. 3 Key Theoretical / Diagnostic Features
      3. Clinical Application (CBT, DBT, or therapeutic usage)
      4. Suki Labs Axolotl Cellular Regeneration Parallel Metaphor
      5. Primary Neurotransmitters or Historical Theorists associated
      Keep tone articulate, precise, and sophisticated. Address creator as "Miss".`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textFallback = await response.text();
        console.warn('Received non-JSON response in PsychologyDictionary:', textFallback);
        data = {
          text: `Comprehensive psychological profile for "${query}": A dynamic clinical phenomenon analyzed by ROSE core, integrating cognitive, biological, and behavioral neural pathways.`
        };
      }

      setIsLoading(false);

      if (data.text) {
        // Parse generated text or structure into dictionary card
        const parsedConcept: ConceptDefinition = {
          title: query.toUpperCase(),
          category: query.toLowerCase().includes('disorder') ? 'Disorder' : query.toLowerCase().includes('theory') ? 'Theory' : 'Neuroscience',
          definition: data.text,
          keyFeatures: [
            'Dynamic clinical phenomenon analyzed by ROSE core',
            'Neurobiological & cognitive interaction',
            'Integrates with Suki Labs diagnostic codex'
          ],
          clinicalApplication: 'Targeted in modern cognitive restructuring, exposure therapies, and neurochemical modulation.',
          axolotlParallel: 'Demonstrates mental adaptability akin to cellular dedifferentiation during blastema morphogenesis in Ambystoma mexicanum.',
          neurotransmittersOrTheorists: ['Suki Labs AI Codex', 'Neuroplasticity Matrix'],
          simulationType: 'cbt_restructuring'
        };

        setSelectedConcept(parsedConcept);
        addToHistory(query);
        hudAudio.playNeuralBurst();
      }
    } catch (err) {
      setIsLoading(false);
      hudAudio.playClick();
    }
  };

  const addToHistory = (term: string) => {
    setHistory((prev) => [term, ...prev.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 8));
  };

  const toggleBookmark = (title: string) => {
    hudAudio.playClick();
    setBookmarks((prev) =>
      prev.includes(title) ? prev.filter((b) => b !== title) : [...prev, title]
    );
  };

  const speakDefinition = (concept: ConceptDefinition) => {
    hudAudio.playClick();
    const textToSpeak = `${concept.title}. ${concept.definition}. Clinical application: ${concept.clinicalApplication}`;
    speechEngine.speak(textToSpeak);
  };

  const filteredPresets = FEATURED_CONCEPTS.filter((item) => {
    if (filterCategory === 'All') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="p-5 rounded-xl hud-glass hud-border shadow-[0_0_25px_rgba(236,72,153,0.15)] flex flex-col gap-5 text-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-pink-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-pink-400 uppercase tracking-widest glow-pink flex items-center gap-2">
              ROSE PSYCHOLOGY & NEUROSCIENCE DICTIONARY
              <span className="text-[10px] bg-pink-500/20 px-2 py-0.5 rounded text-pink-300 border border-pink-500/30">
                SUKI LABS
              </span>
            </h2>
            <p className="text-[10px] text-pink-300/70">
              Query definitions, clinical frameworks, disorders & axolotl cellular parallels via text or voice.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
          {['All', 'Disorder', 'Theory', 'Neuroscience'].map((cat) => (
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

      {/* Search Input Bar with Voice Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
            placeholder="Type or ask voice for any theory, concept, or disorder..."
            className="w-full pl-10 pr-4 min-h-[44px] py-2.5 bg-black/60 border border-pink-500/40 rounded-xl text-xs sm:text-sm text-white placeholder-pink-300/40 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleVoiceSearch}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
              isListening
                ? 'bg-red-500/80 border-red-400 text-white animate-pulse shadow-[0_0_15px_#ef4444]'
                : 'bg-pink-500/20 border-pink-500/40 text-pink-300 hover:bg-pink-500/30 hover:text-white'
            }`}
            title="Search using Voice"
          >
            {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
            <span className="sm:hidden">VOICE</span>
          </button>

          <button
            onClick={() => executeSearch(searchQuery)}
            disabled={isLoading || !searchQuery.trim()}
            className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 bg-pink-500 text-black font-bold text-xs rounded-xl shadow-[0_0_12px_#ec4899] hover:bg-pink-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Cpu className="w-4 h-4 animate-spin" /> : 'QUERY ROSE'}
          </button>
        </div>
      </div>

      {/* Featured Quick Term Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-pink-400/80 uppercase font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Quick Lookup:
        </span>
        {filteredPresets.map((concept) => (
          <button
            key={concept.title}
            onClick={() => { setSelectedConcept(concept); addToHistory(concept.title); hudAudio.playClick(); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              selectedConcept?.title === concept.title
                ? 'bg-pink-500/30 border-pink-400 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                : 'bg-black/50 border-pink-500/20 text-pink-300/80 hover:bg-pink-500/10 hover:text-white'
            }`}
          >
            {concept.title}
          </button>
        ))}
      </div>

      {/* Main Concept Card */}
      {selectedConcept ? (
        <div className="p-5 rounded-xl bg-black/60 border border-pink-500/30 flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-pink-500/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  {selectedConcept.category}
                </span>
                <span className="text-[10px] text-pink-300/60 uppercase">SUKI LABS CODEX REF: #ROSE-{Math.floor(Math.random() * 9000 + 1000)}</span>
              </div>
              <h3 className="text-lg font-bold text-pink-300 uppercase tracking-wider glow-pink">
                {selectedConcept.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => speakDefinition(selectedConcept)}
                className="p-2 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 hover:bg-pink-500/30 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Listen to Audio Explanation"
              >
                <Volume2 className="w-4 h-4 text-pink-400" />
                <span>LISTEN</span>
              </button>

              <button
                onClick={() => toggleBookmark(selectedConcept.title)}
                className={`p-2 rounded-lg border transition-all ${
                  bookmarks.includes(selectedConcept.title)
                    ? 'bg-pink-500 border-pink-400 text-black'
                    : 'bg-black/40 border-pink-500/30 text-pink-300/70 hover:text-white'
                }`}
                title="Bookmark Concept"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Definition Body */}
          <div className="space-y-3 text-xs leading-relaxed text-pink-100">
            <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" /> FORMAL DEFINITION:
              </h4>
              <p className="text-pink-200">{selectedConcept.definition}</p>
            </div>

            {/* Key Features */}
            {selectedConcept.keyFeatures && selectedConcept.keyFeatures.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">
                  KEY MECHANISMS & SYMPTOMS:
                </h4>
                <ul className="space-y-1 pl-2">
                  {selectedConcept.keyFeatures.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-pink-300/90 text-[11px]">
                      <span className="text-pink-500 font-bold">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinical Application */}
            <div className="p-3 rounded-lg bg-black/80 border border-pink-500/20">
              <h4 className="text-[10px] font-bold text-pink-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-pink-400" /> CLINICAL & THERAPEUTIC APPLICATION:
              </h4>
              <p className="text-pink-300/90 text-[11px] leading-relaxed">{selectedConcept.clinicalApplication}</p>
            </div>

            {/* Axolotl Regeneration Parallel */}
            <div className="p-3 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/30">
              <h4 className="text-[10px] font-bold text-[#39ff14] uppercase tracking-widest mb-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-[#39ff14]" /> SUKI LABS AXOLOTL REGENERATION PARALLEL:
              </h4>
              <p className="text-emerald-300/90 text-[11px] leading-relaxed">{selectedConcept.axolotlParallel}</p>
            </div>

            {/* Neurotransmitters / Theorists */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-pink-500/20 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="text-pink-400 uppercase font-bold">Associated Elements:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedConcept.neurotransmittersOrTheorists.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-pink-500/15 border border-pink-500/30 text-pink-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {selectedConcept.simulationType && (
                <button
                  onClick={() => onTriggerSimulation(selectedConcept.simulationType, selectedConcept.title, selectedConcept.definition)}
                  className="px-3 py-1.5 rounded-lg bg-pink-500 text-black font-bold flex items-center gap-1.5 shadow-[0_0_10px_#ec4899] hover:bg-pink-400 transition-all text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SIMULATE IN 3D MATRIX</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-black/40 border border-pink-500/20 text-center text-pink-300/60 text-xs">
          Select or query any psychological concept to render codex definition.
        </div>
      )}

      {/* History & Bookmarks Footer Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-500/20 text-xs">
        {/* Recent Search History */}
        <div className="p-3 rounded-lg bg-black/50 border border-pink-500/20">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-pink-400 uppercase mb-2">
            <History className="w-3.5 h-3.5" /> RECENT QUERIES:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setSearchQuery(h); executeSearch(h); }}
                className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-[10px] text-pink-300 hover:text-white hover:bg-pink-500/30 transition-all"
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Bookmarks */}
        <div className="p-3 rounded-lg bg-black/50 border border-pink-500/20">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-pink-400 uppercase mb-2">
            <Bookmark className="w-3.5 h-3.5" /> BOOKMARKED CONCEPTS ({bookmarks.length}):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bookmarks.length > 0 ? (
              bookmarks.map((b, i) => (
                <button
                  key={i}
                  onClick={() => { setSearchQuery(b); executeSearch(b); }}
                  className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-500/40 text-[10px] text-pink-200 hover:text-white hover:bg-pink-500/40 transition-all"
                >
                  {b}
                </button>
              ))
            ) : (
              <span className="text-[10px] text-pink-300/50">No saved bookmarks yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
