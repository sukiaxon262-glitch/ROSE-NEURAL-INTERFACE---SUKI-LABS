import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Zap, HardDrive, Radio, Shield, Gauge } from 'lucide-react';

export const TelemetryDiagnostics: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(34);
  const [coreTemp, setCoreTemp] = useState<number>(41.2);
  const [tflops, setTflops] = useState<number>(4.28);
  const [bufferStatus, setBufferStatus] = useState<string>('STABLE');

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.min(98, Math.max(22, prev + (Math.random() - 0.5) * 8)));
      setCoreTemp(prev => Math.min(55, Math.max(38, prev + (Math.random() - 0.5) * 0.4)));
      setTflops(prev => Number((4.1 + Math.random() * 0.4).toFixed(2)));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 rounded-xl hud-glass hud-border shadow-[0_0_20px_rgba(236,72,153,0.15)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
      <div className="p-3 rounded-xl bg-black/60 border border-[#ff2a85]/20 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[#ff69b4]">
          <span className="flex items-center gap-1.5 font-bold">
            <Cpu className="w-3.5 h-3.5 text-[#ff2a85]" />
            CORE LOAD
          </span>
          <span className="text-[10px] text-[#ff2a85] font-bold">{cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-[#ff2a85] to-[#ff1493] transition-all duration-500"
            style={{ width: `${cpuUsage}%` }}
          />
        </div>
      </div>

      <div className="p-3 rounded-xl bg-black/60 border border-[#ff2a85]/20 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[#ff69b4]">
          <span className="flex items-center gap-1.5 font-bold">
            <Gauge className="w-3.5 h-3.5 text-[#ff2a85]" />
            CORE TEMP
          </span>
          <span className="text-[10px] text-[#ffb6c1] font-bold">{coreTemp.toFixed(1)}°C</span>
        </div>
        <div className="text-[11px] text-[#ffb6c1]/80 mt-1">
          NOMINAL THERMAL REGIME
        </div>
      </div>

      <div className="p-3 rounded-xl bg-black/60 border border-[#ff2a85]/20 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[#ff69b4]">
          <span className="flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5 text-[#ff2a85]" />
            PROCESSING
          </span>
          <span className="text-[10px] text-[#39ff14] font-bold">{tflops} TFLOPs</span>
        </div>
        <div className="text-[11px] text-[#39ff14]/80 mt-1">
          SYNAPSE MATRIX SYNCED
        </div>
      </div>

      <div className="p-3 rounded-xl bg-black/60 border border-[#ff2a85]/20 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[#ff69b4]">
          <span className="flex items-center gap-1.5 font-bold">
            <HardDrive className="w-3.5 h-3.5 text-[#ff2a85]" />
            GENOME BUFFER
          </span>
          <span className="text-[10px] text-[#39ff14] font-bold">{bufferStatus}</span>
        </div>
        <div className="text-[11px] text-[#ffb6c1]/80 mt-1">
          A. MEXICANUM DNA 100%
        </div>
      </div>
    </div>
  );
};
