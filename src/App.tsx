import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { SimulationState, ChatMessage } from './types';
import { HolographicSimulation3D } from './components/HolographicSimulation3D';
import { JarvisArcReactorHUD } from './components/JarvisArcReactorHUD';
import { PsychologyCodex } from './components/PsychologyCodex';
import { PsychologyDictionary } from './components/PsychologyDictionary';
import { BrainAtlas } from './components/BrainAtlas';
import { HubbleSpaceTelescope } from './components/HubbleSpaceTelescope';
import { AxolotlBiologyCodex } from './components/AxolotlBiologyCodex';
import { TelemetryDiagnostics } from './components/TelemetryDiagnostics';
import { ChatConsole } from './components/ChatConsole';
import { hudAudio } from './lib/audioSynthesizer';
import { speechEngine } from './lib/speechEngine';
import { Sparkles, Brain, BookOpen, Layers, Telescope, Dna, Activity, Terminal, Shield, Cpu, RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ROSE UI Exception caught:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0508] text-[#ec4899] font-mono p-6 flex items-center justify-center">
          <div className="max-w-md w-full p-6 rounded-xl hud-glass hud-border flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-12 h-12 text-[#ff2a85] animate-pulse" />
            <h2 className="text-lg font-bold uppercase tracking-widest text-pink-300">ROSE SYSTEM TELEMETRY RECOVERY</h2>
            <p className="text-xs text-pink-200/80 leading-relaxed">
              A minor sub-system anomaly occurred during render. System protection engaged.
            </p>
            <div className="p-3 bg-black/60 border border-pink-500/20 rounded-lg text-[10px] text-pink-400 font-mono text-left w-full overflow-x-auto">
              {this.state.error?.message || 'Script execution exception intercepted.'}
            </div>
            <button
              onClick={this.handleReset}
              className="mt-2 px-5 py-2.5 bg-[#ff2a85] text-white font-bold text-xs rounded-xl shadow-[0_0_15px_#ff2a85] hover:bg-[#ff1493] transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>REINITIALIZE ROSE HUD</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainAppContent />
    </ErrorBoundary>
  );
}

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<'3d_matrix' | 'psychology' | 'dictionary' | 'brain_atlas' | 'hubble' | 'axolotl' | 'telemetry'>('3d_matrix');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Default initial simulation state
  const [simulationState, setSimulationState] = useState<SimulationState>({
    active: true,
    type: 'dopamine_synapse',
    title: 'Dopaminergic Synapse & Vesicle Cascade',
    targetStructure: 'Nucleus Accumbens / VTA',
    intensity: 75,
    keyNeurotransmitters: ['Dopamine', 'Glutamate'],
    clinicalNotes: 'Initial state: Dopamine vesicle docking across presynaptic membrane for reward signal transmission.'
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      text: 'Good day, Miss. All systems online. Pink Arc Core operating at 99.8% capacity. I have complete clinical psychology, neuroscience, and Axolotl (Ambystoma mexicanum) regeneration telemetry loaded. How may I assist your work today, Miss?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Speech engine state sync
  useEffect(() => {
    speechEngine.setOnStateChange((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // Web Speech API Voice Recognition
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
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
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    hudAudio.playClick();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload })
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.error) {
        throw new Error(data.error);
      }

      let toolCallTriggeredInfo: { type: string; details: string } | undefined = undefined;

      // Handle Function Calls triggered by Gemini
      if (data.functionCalls && data.functionCalls.length > 0) {
        for (const call of data.functionCalls) {
          if (call.name === 'trigger_neural_simulation' && call.args) {
            const { simulation_type, target_structure, intensity, key_neurotransmitters, clinical_notes } = call.args;

            setSimulationState({
              active: true,
              type: simulation_type || 'dopamine_synapse',
              title: `${(simulation_type || 'NEURAL_SIM').toUpperCase().replace(/_/g, ' ')}`,
              targetStructure: target_structure || 'Synaptic Cleft',
              intensity: intensity || 80,
              keyNeurotransmitters: key_neurotransmitters || ['Dopamine', 'Glutamate'],
              clinicalNotes: clinical_notes || 'Interactive 3D simulation triggered by ROSE core.'
            });

            // Automatically switch view tab to 3D matrix if not active
            setActiveTab('3d_matrix');
            hudAudio.playNeuralBurst();

            toolCallTriggeredInfo = {
              type: simulation_type || 'NEURAL_SIMULATION',
              details: target_structure || 'Brain Chemistry'
            };
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        text: data.text || 'Visual matrix operational, Miss.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCallTriggered: toolCallTriggeredInfo
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Speak response using speech synthesis
      if (data.text) {
        speechEngine.speak(data.text);
      }
    } catch (err: any) {
      setIsLoading(false);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'system',
        text: `ROSE CORE SYSTEM WARNING: ${err.message || 'Unable to complete neural telemetry query.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const triggerDirectSimulation = (type: any, title: string, notes: string) => {
    setSimulationState({
      active: true,
      type,
      title,
      targetStructure: title,
      intensity: 85,
      keyNeurotransmitters: ['Dopamine', 'Serotonin', 'FGF-8'],
      clinicalNotes: notes
    });
    setActiveTab('3d_matrix');
    hudAudio.playNeuralBurst();
  };

  return (
    <div className="relative min-h-screen bg-[#0a0508] text-[#ec4899] font-mono select-none overflow-x-hidden p-3 sm:p-6 flex flex-col justify-between gap-5 max-w-[1600px] mx-auto pb-16">
      {/* Frosted Glass Background & Scanlines */}
      <div className="fixed inset-0 scanline pointer-events-none z-50 opacity-60" />
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Top Header Bar - Frosted Glass HUD */}
      <header className="relative z-10 p-3.5 sm:p-4 rounded-xl hud-glass hud-border shadow-[0_0_25px_rgba(236,72,153,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-full border-2 border-pink-500 flex items-center justify-center glow-pink bg-pink-500/10 shrink-0">
            <span className="text-xs font-bold text-pink-300">R.O.</span>
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base md:text-lg tracking-widest uppercase glow-pink flex items-center gap-2">
              NEURAL INTERFACE v.6.0.2 // ROSE
              <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                SUKI LABS
              </span>
            </h1>
            <p className="text-[10px] opacity-70 uppercase tracking-wider">
              Active User: Creator // Location: Suki Labs - AXOLOTL
            </p>
          </div>
        </div>

        {/* Navigation Tabs - Horizontally scrollable on mobile */}
        <div className="w-full md:w-auto overflow-x-auto flex items-center gap-1.5 p-1.5 rounded-xl bg-black/60 border border-pink-500/30 scrollbar-none">
          <button
            onClick={() => { setActiveTab('3d_matrix'); hudAudio.playClick(); }}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === '3d_matrix'
                ? 'bg-pink-500 text-black shadow-[0_0_12px_#ec4899]'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3D MATRIX</span>
          </button>

          <button
            onClick={() => { setActiveTab('psychology'); hudAudio.playClick(); }}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'psychology'
                ? 'bg-pink-500 text-black shadow-[0_0_12px_#ec4899]'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>PSYCHOLOGY</span>
          </button>

          <button
            onClick={() => { setActiveTab('dictionary'); hudAudio.playClick(); }}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'dictionary'
                ? 'bg-pink-500 text-black shadow-[0_0_12px_#ec4899]'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>DICTIONARY</span>
          </button>

          <button
            onClick={() => { setActiveTab('brain_atlas'); hudAudio.playClick(); }}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'brain_atlas'
                ? 'bg-pink-500 text-black shadow-[0_0_12px_#ec4899]'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>BRAIN ATLAS</span>
          </button>

          <button
            onClick={() => { setActiveTab('hubble'); hudAudio.playClick(); }}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'hubble'
                ? 'bg-pink-500 text-black shadow-[0_0_12px_#ec4899]'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
            }`}
          >
            <Telescope className="w-4 h-4 text-pink-400" />
            <span>HUBBLE TELESCOPE</span>
          </button>

          <button
            onClick={() => { setActiveTab('axolotl'); hudAudio.playClick(); }}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'axolotl'
                ? 'bg-[#39ff14] text-black shadow-[0_0_12px_#39ff14]'
                : 'text-pink-300/70 hover:text-white hover:bg-[#39ff14]/20'
            }`}
          >
            <Dna className="w-4 h-4 text-[#39ff14]" />
            <span>AXOLOTL</span>
          </button>

          <button
            onClick={() => { setActiveTab('telemetry'); hudAudio.playClick(); }}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'telemetry'
                ? 'bg-pink-500 text-black shadow-[0_0_12px_#ec4899]'
                : 'text-pink-300/70 hover:text-white hover:bg-pink-500/20'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>DIAGNOSTICS</span>
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column: Arc Reactor HUD & Chat Console */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <JarvisArcReactorHUD
            isSpeaking={isSpeaking}
            isListening={isListening}
            onToggleListening={toggleListening}
          />

          <ChatConsole
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Dynamic View (3D Simulation / Psychology / Axolotl / Telemetry) */}
        <div className="lg:col-span-7 flex flex-col gap-5 min-h-[500px]">
          {activeTab === '3d_matrix' && (
            <div className="flex-1 flex flex-col gap-4">
              <HolographicSimulation3D simulationState={simulationState} />
            </div>
          )}

          {activeTab === 'psychology' && (
            <PsychologyCodex onTriggerSimulation={triggerDirectSimulation} />
          )}

          {activeTab === 'dictionary' && (
            <PsychologyDictionary onTriggerSimulation={triggerDirectSimulation} />
          )}

          {activeTab === 'brain_atlas' && (
            <BrainAtlas onTriggerSimulation={triggerDirectSimulation} />
          )}

          {activeTab === 'hubble' && (
            <HubbleSpaceTelescope onTriggerSimulation={triggerDirectSimulation} />
          )}

          {activeTab === 'axolotl' && (
            <AxolotlBiologyCodex onTriggerSimulation={triggerDirectSimulation} />
          )}

          {activeTab === 'telemetry' && (
            <div className="flex flex-col gap-5">
              <TelemetryDiagnostics />
              <div className="p-5 rounded-xl hud-glass hud-border text-xs text-pink-300 space-y-3">
                <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider glow-pink">ROSE DIAGNOSTIC LOGS</h3>
                <p>• [SYSTEM] All 24 core parallel neural nodes initialized at 100% capacity.</p>
                <p>• [PSYCHOLOGY] CBT & DBT cognitive restructuring rule sets pre-loaded.</p>
                <p>• [AXOLOTL] Blastema cell dedifferentiation simulation engine active.</p>
                <p>• [AUDIO] Synthesizer and Web Speech API voices synchronized.</p>
              </div>
            </div>
          )}

          {/* Bottom Permanent Diagnostic Bar */}
          <TelemetryDiagnostics />
        </div>
      </div>

      {/* Footer - Frosted Glass HUD Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 px-6 flex items-center justify-between hud-border border-b-0 border-x-0 text-[10px] bg-[#0a0508]/90 backdrop-blur-md z-40">
        <div className="flex gap-4 items-center">
          <span className="text-pink-400 font-bold">ENCRYPTED CONNECTION [TLS 2.0]</span>
          <span className="opacity-40">|</span>
          <span className="opacity-80">THREAT LEVEL: NEGLIGIBLE</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-pink-300">{new Date().toLocaleTimeString()}</span>
          <span className="opacity-40">|</span>
          <span className="opacity-80">PACIFIC TIME ZONE // SUKI LABS</span>
        </div>
      </footer>
    </div>
  );
}
