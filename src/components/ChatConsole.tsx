import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, Sparkles, Terminal, Cpu, MessageSquare } from 'lucide-react';
import { hudAudio } from '../lib/audioSynthesizer';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const PRESET_PROMPTS = [
  'ROSE, simulate a Dopamine synapse firing during reward processing.',
  'Explain CBT cognitive restructuring and prefrontal-amygdala dynamics, Miss.',
  'Analyze Axolotl limb regeneration mechanics and blastema formation.',
  'How does GABA-Glutamate balance regulate anxiety and executive overload?'
];

export const ChatConsole: React.FC<Props> = ({ messages, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    hudAudio.playClick();
  };

  const handlePresetClick = (prompt: string) => {
    onSendMessage(prompt);
    hudAudio.playClick();
  };

  return (
    <div className="p-5 rounded-xl hud-glass hud-border shadow-[0_0_25px_rgba(236,72,153,0.15)] flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ff2a85]/20 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#ff2a85]" />
          <h3 className="font-mono font-bold text-sm text-[#ff69b4] tracking-widest uppercase">
            ROSE CONVERSATIONAL INTERFACE
          </h3>
        </div>
        <span className="text-xs font-mono text-[#ffb6c1]/70">SUKI AI OS v9.4</span>
      </div>

      {/* Preset Action Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2 scrollbar-thin scrollbar-thumb-[#ff2a85]">
        {PRESET_PROMPTS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetClick(preset)}
            className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-[#ff2a85]/20 border border-[#ff2a85]/30 hover:border-[#ff2a85] text-[11px] font-mono text-[#ffb6c1] whitespace-nowrap transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#ff2a85]" />
            {preset.split(',')[0]}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 font-mono text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all ${
              msg.role === 'user'
                ? 'bg-[#ff2a85]/10 border-[#ff2a85]/40 text-[#ffb6c1] ml-6'
                : msg.role === 'system'
                ? 'bg-black/60 border-gray-800 text-gray-400'
                : 'bg-black/80 border-[#ff2a85]/60 text-white mr-6 shadow-[0_0_15px_rgba(255,42,133,0.15)]'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-[#ff69b4]/80">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                {msg.role === 'assistant' && <Cpu className="w-3.5 h-3.5 text-[#ff2a85]" />}
                {msg.role === 'user' ? 'MISS' : msg.role === 'assistant' ? 'ROSE' : 'SYSTEM'}
              </span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Tool Trigger Card Notification */}
            {msg.toolCallTriggered && (
              <div className="p-2 rounded bg-[#ff2a85]/20 border border-[#ff2a85]/50 text-[#ff69b4] text-[11px] font-bold flex items-center gap-2 my-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-[#ff2a85]" />
                <span>[3D HOLOGRAPHIC TRIGGERED: {msg.toolCallTriggered.type}]</span>
              </div>
            )}

            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}

        {isLoading && (
          <div className="p-3.5 rounded-xl bg-black/80 border border-[#ff2a85]/60 text-[#ff69b4] flex items-center gap-3 animate-pulse">
            <Cpu className="w-4 h-4 text-[#ff2a85] animate-spin" />
            <span>ROSE core processing query & synthesizing output, Miss...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-[#ff2a85]/20 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Instruct ROSE (e.g. 'Explain CBT', 'Simulate dopamine')..."
          className="flex-1 bg-black/60 border border-[#ff2a85]/40 rounded-xl px-4 min-h-[44px] py-2.5 font-mono text-xs sm:text-sm text-white placeholder-[#ffb6c1]/40 focus:outline-none focus:border-[#ff2a85] focus:ring-1 focus:ring-[#ff2a85]"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="min-h-[44px] px-4 sm:px-5 py-2.5 bg-[#ff2a85] hover:bg-[#ff1493] disabled:opacity-50 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_#ff2a85] transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">SEND</span>
        </button>
      </form>
    </div>
  );
};
