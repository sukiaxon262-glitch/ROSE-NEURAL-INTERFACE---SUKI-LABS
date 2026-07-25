import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Cpu, ShieldCheck, Radio } from 'lucide-react';
import { hudAudio } from '../lib/audioSynthesizer';
import { speechEngine } from '../lib/speechEngine';

interface Props {
  isSpeaking: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  systemStatusText?: string;
}

export const JarvisArcReactorHUD: React.FC<Props> = ({
  isSpeaking,
  isListening,
  onToggleListening,
  systemStatusText = 'SYSTEM OPERATIONAL // MARK LXXXV PINK ARC CORE'
}) => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);

  const toggleSound = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    hudAudio.soundEnabled = newState;
    if (newState) hudAudio.playClick();
  };

  const toggleTts = () => {
    const newState = !ttsEnabled;
    setTtsEnabled(newState);
    speechEngine.ttsEnabled = newState;
    if (!newState) speechEngine.stop();
    hudAudio.playClick();
  };

  return (
    <div className="relative p-5 rounded-xl hud-glass hud-border shadow-[0_0_30px_rgba(236,72,153,0.2)] flex flex-col items-center justify-between overflow-hidden">
      {/* Background Decorative Tech Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.12)_0,transparent_70%)] pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-[#ffb6c1]/80 pb-3 border-b border-[#ff2a85]/20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#ff2a85]" />
          <span className="font-bold text-[#ff69b4] tracking-widest uppercase">ROSE core</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
          <span className="text-[#39ff14] font-bold text-[11px]">99.8% Core Stability</span>
        </div>
      </div>

      {/* Center Animated Pink Arc Reactor Core */}
      <div className="relative my-6 flex items-center justify-center">
        {/* Outer Pulsing Rotating Rings */}
        <div className={`w-36 h-36 rounded-full border-2 border-dashed border-[#ff2a85] animate-[spin_12s_linear_infinite] flex items-center justify-center ${isSpeaking ? 'border-[#ff1493] scale-105' : ''}`} />
        <div className="absolute w-28 h-28 rounded-full border border-[#ff69b4]/60 animate-[spin_8s_linear_infinite_reverse]" />
        <div className="absolute w-24 h-24 rounded-full border-2 border-[#e0115f]/80 animate-pulse" />

        {/* Inner Reactor Glow Core */}
        <div className="absolute w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff1493] via-[#ff2a85] to-[#ffb6c1] shadow-[0_0_35px_#ff2a85] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95"
             onClick={() => hudAudio.playNeuralBurst()}>
          <Sparkles className={`w-8 h-8 text-white ${isSpeaking ? 'animate-bounce' : 'animate-spin'}`} />
        </div>

        {/* Audio Reactive Waves around Core when speaking */}
        {isSpeaking && (
          <div className="absolute -inset-4 rounded-full border border-[#ff2a85] animate-ping opacity-75" />
        )}
      </div>

      {/* Status Bar */}
      <div className="text-center font-mono text-xs text-[#ffb6c1] mb-4">
        <p className="text-[#ff69b4] font-bold tracking-wider mb-1 flex items-center justify-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#ff2a85] animate-pulse" />
          {systemStatusText}
        </p>
        <p className="text-[11px] text-[#ffb6c1]/70">
          {isSpeaking ? 'AUDIO OUTPUT BROADCASTING...' : isListening ? 'LISTENING FOR MISS VOICE COMMAND...' : 'AWAITING MISS INSTRUCTION'}
        </p>
      </div>

      {/* Audio & Speech Controls */}
      <div className="w-full grid grid-cols-3 gap-2.5 pt-3 border-t border-[#ff2a85]/20">
        <button
          onClick={onToggleListening}
          className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
            isListening
              ? 'bg-[#ff2a85] text-white shadow-[0_0_20px_#ff2a85] animate-pulse'
              : 'bg-black/60 text-[#ff69b4] border border-[#ff2a85]/40 hover:bg-[#ff2a85]/20'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>{isListening ? 'STOP MIC' : 'VOICE IN'}</span>
        </button>

        <button
          onClick={toggleTts}
          className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            ttsEnabled
              ? 'bg-[#ff2a85]/20 text-[#ff69b4] border-[#ff2a85]/60 hover:bg-[#ff2a85]/30'
              : 'bg-black/60 text-gray-400 border-gray-700'
          }`}
        >
          {ttsEnabled ? <Volume2 className="w-4 h-4 text-[#ff2a85]" /> : <VolumeX className="w-4 h-4" />}
          <span>{ttsEnabled ? 'VOICE ON' : 'VOICE OFF'}</span>
        </button>

        <button
          onClick={toggleSound}
          className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            audioEnabled
              ? 'bg-[#ff2a85]/20 text-[#ff69b4] border-[#ff2a85]/60 hover:bg-[#ff2a85]/30'
              : 'bg-black/60 text-gray-400 border-gray-700'
          }`}
        >
          <Cpu className="w-4 h-4 text-[#ff2a85]" />
          <span>{audioEnabled ? 'HUD FX ON' : 'FX OFF'}</span>
        </button>
      </div>
    </div>
  );
};
