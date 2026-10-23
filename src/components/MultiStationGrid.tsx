import React from 'react';
import { SensorStation } from '../types/flood';
import { MapPin, Radio, AlertTriangle, CheckCircle2, ChevronRight, Waves, ShieldAlert } from 'lucide-react';

interface MultiStationGridProps {
  stations: SensorStation[];
  activeStationId: string;
  onSelectStation: (id: string) => void;
}

export const MultiStationGrid: React.FC<MultiStationGridProps> = ({
  stations,
  activeStationId,
  onSelectStation,
}) => {
  const getBadge = (level: string) => {
    switch (level) {
      case 'awas':
        return { text: 'AWAS (SIAGA 1)', style: 'bg-rose-950 text-rose-300 border-rose-600/60 animate-pulse' };
      case 'siaga':
        return { text: 'SIAGA (SIAGA 2)', style: 'bg-amber-950 text-amber-300 border-amber-600/60' };
      case 'waspada':
        return { text: 'WASPADA (SIAGA 3)', style: 'bg-yellow-950 text-yellow-300 border-yellow-600/60' };
      default:
        return { text: 'NORMAL (AMAN)', style: 'bg-emerald-950 text-emerald-300 border-emerald-600/60' };
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span>Pusat Pemantau Titik Sensor (Topografi & Cekungan)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Jaringan stasiun LoRa pemantau wilayah cekungan rendah, hulu sungai, dan pintu air utama
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {stations.map((st) => {
          const isSelected = st.id === activeStationId;
          const badge = getBadge(st.alertLevel);
          const percentFull = Math.min(100, Math.round((st.currentLevelCm / st.thresholds.spillover) * 100));

          return (
            <div
              key={st.id}
              onClick={() => onSelectStation(st.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/90 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {/* Top Row: Station ID & Location Type */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
                    {st.id}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-0.5">{st.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    <span>{st.locationType}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border whitespace-nowrap ${badge.style}`}
                >
                  {badge.text}
                </span>
              </div>

              {/* Water Level Gauge Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-baseline text-xs mb-1 font-mono">
                  <span className="text-slate-400">Tinggi Air (h):</span>
                  <span className="text-base font-bold text-white tabular-nums">
                    {st.currentLevelCm} <span className="text-xs text-slate-400">/ {st.thresholds.spillover} cm</span>
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      st.alertLevel === 'awas'
                        ? 'bg-rose-500'
                        : st.alertLevel === 'siaga'
                        ? 'bg-amber-500'
                        : st.alertLevel === 'waspada'
                        ? 'bg-yellow-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ width: `${percentFull}%` }}
                  />
                </div>
              </div>

              {/* Quick Sub-Stats */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500">Jarak (s):</span>{' '}
                  <span className="text-slate-200">{st.currentDistanceCm} cm</span>
                </div>
                <div>
                  <span className="text-slate-500">Laju (Vh):</span>{' '}
                  <span
                    className={st.rateOfRiseCmPerMin > 0 ? 'text-amber-400 font-bold' : 'text-slate-300'}
                  >
                    {st.rateOfRiseCmPerMin > 0 ? `+${st.rateOfRiseCmPerMin}` : st.rateOfRiseCmPerMin} cm/m
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">LoRa RF:</span>{' '}
                  <span className="text-cyan-400">{st.rssi} dBm</span>
                </div>
                <div>
                  <span className="text-slate-500">Baterai:</span>{' '}
                  <span className="text-emerald-400">{st.batteryPct}%</span>
                </div>
              </div>

              {/* Active Selection Pin Indicator */}
              {isSelected && (
                <div className="mt-3 flex items-center justify-between text-xs text-cyan-400 font-semibold pt-2 border-t border-cyan-900/40">
                  <span>Stasiun Terpilih</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
