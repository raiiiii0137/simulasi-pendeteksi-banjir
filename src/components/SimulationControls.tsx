import React from 'react';
import { SensorStation } from '../types/flood';
import { CloudRain, Trash2, Zap, RotateCcw, Play, Pause, AlertOctagon } from 'lucide-react';

interface SimulationControlsProps {
  station: SensorStation;
  isAutoSimulating: boolean;
  onToggleAutoSim: () => void;
  onUpdateRainfall: (mmHr: number) => void;
  onUpdateBlockage: (pct: number) => void;
  onInjectFlashFlood: () => void;
  onResetStation: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  station,
  isAutoSimulating,
  onToggleAutoSim,
  onUpdateRainfall,
  onUpdateBlockage,
  onInjectFlashFlood,
  onResetStation,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Panel Pengendali Simulasi & Analisis Permasalahan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Uji variabel cuaca ekstrem, penyumbatan gorong-gorong cekungan rendah, dan respon sistem sensor
          </p>
        </div>

        {/* Play/Pause Live Telemetry Stream */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoSim}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isAutoSimulating
                ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isAutoSimulating ? (
              <>
                <Pause className="h-3.5 w-3.5 text-emerald-400" />
                <span>Streaming Telemetri Aktif</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-cyan-400" />
                <span>Lanjutkan Stream</span>
              </>
            )}
          </button>

          <button
            onClick={onResetStation}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset ke Kondisi Normal"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
        {/* Cause 1: Intensitas Hujan Tinggi */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <CloudRain className="h-4 w-4 text-cyan-400" />
              <span>Intensitas Hujan (Penyebab Utama 1)</span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {station.rainfallIntensityMmHr} mm/jam
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={station.rainfallIntensityMmHr}
            onChange={(e) => onUpdateRainfall(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
            <span>Cerah (0)</span>
            <span>Sedang (25)</span>
            <span>Lebat (60)</span>
            <span className="text-rose-400">Ekstrem (120)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Hujan deras meningkatkan volume limpasan permukaan di catchment area hulu.
          </p>
        </div>

        {/* Cause 2: Penyumbatan Saluran Air */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Trash2 className="h-4 w-4 text-amber-400" />
              <span>Penyumbatan Saluran (Penyebab 2)</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
              {station.drainageBlockedPct}% Tersumbat
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={station.drainageBlockedPct}
            onChange={(e) => onUpdateBlockage(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
            <span>Lancar (0%)</span>
            <span>Parsial (50%)</span>
            <span className="text-rose-400">Kritis (95%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Sedimen dan sampah menyumbat drainase cekungan sehingga air tergenang cepat.
          </p>
        </div>

        {/* Disaster Impact 1 & 2: Kenaikan Air Mendadak & Waktu Evakuasi Singkat */}
        <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
              <AlertOctagon className="h-4 w-4 text-rose-400" />
              <span>Uji Kenaikan Air Mendadak (Flash Surge)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulasikan banjir kiriman tiba-tiba untuk menguji kecepatan reaksi ESP32 & pengiriman paket LoRa.
            </p>
          </div>

          <button
            onClick={onInjectFlashFlood}
            className="mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold bg-rose-950/80 border border-rose-600/70 text-rose-200 hover:bg-rose-900 transition-colors shadow-sm shadow-rose-900/30 flex items-center justify-center gap-2"
          >
            <Zap className="h-3.5 w-3.5 text-rose-400" />
            <span>Injeksi Lonjakan Air (+60 cm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
