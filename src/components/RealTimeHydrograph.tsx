import React, { useState } from 'react';
import { SensorStation, TelemetryPoint } from '../types/flood';
import { TrendingUp, TrendingDown, Minus, Clock, ShieldAlert, Activity } from 'lucide-react';

interface RealTimeHydrographProps {
  station: SensorStation;
}

export const RealTimeHydrograph: React.FC<RealTimeHydrographProps> = ({ station }) => {
  const [hoveredPoint, setHoveredPoint] = useState<TelemetryPoint | null>(null);

  const history = station.history;
  const maxPoleH = station.poleHeightCm; // 400 cm
  const maxChartH = 380; // max Y on chart

  // SVG dimensions
  const width = 800;
  const height = 300;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Coordinate transforms
  const getY = (valCm: number) => {
    const clamped = Math.max(0, Math.min(maxChartH, valCm));
    return height - paddingBottom - (clamped / maxChartH) * chartH;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft;
    return paddingLeft + (index / (total - 1)) * chartW;
  };

  // Build SVG Path
  const points = history.map((pt, i) => ({
    x: getX(i, history.length),
    y: getY(pt.waterLevelCm),
    data: pt,
  }));

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`
    : '';

  // Current stats
  const currentH = station.currentLevelCm;
  const maxRecorded = history.length > 0 ? Math.max(...history.map((p) => p.waterLevelCm)) : currentH;
  const minRecorded = history.length > 0 ? Math.min(...history.map((p) => p.waterLevelCm)) : currentH;
  const vh = station.rateOfRiseCmPerMin;
  const remainingCapacity = Math.max(0, station.thresholds.spillover - currentH);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Grafik Hidrograf Waktu Nyata (Real-Time Water Level)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dinamika elevasi air sungai (h) & laju perubahan waktu (Vh = Δh/Δt) tercatat via telemetri LoRa
          </p>
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
            <span>Muka Air (h)</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <span className="w-2.5 h-0.5 bg-yellow-400 border-dashed inline-block"></span>
            <span>Waspada ({station.thresholds.waspada}cm)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-0.5 bg-amber-400 border-dashed inline-block"></span>
            <span>Siaga ({station.thresholds.siaga}cm)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-0.5 bg-rose-400 border-dashed inline-block"></span>
            <span>Awas ({station.thresholds.awas}cm)</span>
          </div>
        </div>
      </div>

      {/* Metric Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium">Muka Air Saat Ini (h)</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {currentH}
            </span>
            <span className="text-xs font-mono text-slate-400">cm</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Jarak Sensor: {station.currentDistanceCm} cm
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium">Laju Kenaikan (Vh = Δh/Δt)</div>
          <div className="flex items-center gap-1 mt-1">
            {vh > 0.5 ? (
              <TrendingUp className="h-5 w-5 text-rose-400 shrink-0" />
            ) : vh < -0.5 ? (
              <TrendingDown className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <Minus className="h-5 w-5 text-slate-400 shrink-0" />
            )}
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                vh > 10 ? 'text-rose-400' : vh > 2 ? 'text-amber-400' : 'text-slate-200'
              }`}
            >
              {vh > 0 ? `+${vh}` : vh}
            </span>
            <span className="text-xs font-mono text-slate-400">cm/mnt</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            {vh > 10 ? 'Kenaikan Cepat (Flash Surge)' : 'Fluktuasi Normal'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium">Rentang Tercatat (Min - Max)</div>
          <div className="flex items-baseline gap-1 mt-1 font-mono">
            <span className="text-lg font-bold text-slate-200 tabular-nums">{minRecorded}</span>
            <span className="text-xs text-slate-500">-</span>
            <span className="text-lg font-bold text-slate-200 tabular-nums">{maxRecorded}</span>
            <span className="text-xs text-slate-400">cm</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Amplitudo: {(maxRecorded - minRecorded).toFixed(1)} cm
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
          <div className="text-[11px] text-slate-400 font-medium">Sisa Ruang Tanggul (Freeboard)</div>
          <div className="flex items-baseline gap-1 mt-1 font-mono">
            <span
              className={`text-2xl font-bold tabular-nums ${
                remainingCapacity < 50 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {remainingCapacity}
            </span>
            <span className="text-xs text-slate-400">cm</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {remainingCapacity <= 0 ? 'TANGGUL MELUAP!' : 'Menuju Titik Luapan'}
          </div>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div className="relative w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800/80">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: '340px' }}
        >
          <defs>
            <linearGradient id="hydroFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis scale */}
          {[0, 100, 150, 200, 230, 300, 350].map((val) => {
            const y = getY(val);
            return (
              <g key={`y-axis-${val}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val} cm
                </text>
              </g>
            );
          })}

          {/* Threshold alert guidelines */}
          {/* Tanggul Spillover 350cm */}
          <line
            x1={paddingLeft}
            y1={getY(station.thresholds.spillover)}
            x2={width - paddingRight}
            y2={getY(station.thresholds.spillover)}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.8"
          />

          {/* Awas / Siaga 1 */}
          <line
            x1={paddingLeft}
            y1={getY(station.thresholds.awas)}
            x2={width - paddingRight}
            y2={getY(station.thresholds.awas)}
            stroke="#f43f5e"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.7"
          />

          {/* Siaga 2 */}
          <line
            x1={paddingLeft}
            y1={getY(station.thresholds.siaga)}
            x2={width - paddingRight}
            y2={getY(station.thresholds.siaga)}
            stroke="#f97316"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.7"
          />

          {/* Waspada / Siaga 3 */}
          <line
            x1={paddingLeft}
            y1={getY(station.thresholds.waspada)}
            x2={width - paddingRight}
            y2={getY(station.thresholds.waspada)}
            stroke="#eab308"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.7"
          />

          {/* Area under curve */}
          {areaD && <path d={areaD} fill="url(#hydroFill)" />}

          {/* Main water level line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Individual Data Points */}
          {points.map((pt, i) => (
            <circle
              key={`pt-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint === pt.data ? 6 : 3.5}
              fill={hoveredPoint === pt.data ? '#38bdf8' : '#0891b2'}
              stroke="#0f172a"
              strokeWidth="1.5"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(pt.data)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Current Latest Point Pulse Indicator */}
          {points.length > 0 && (
            <g transform={`translate(${points[points.length - 1].x}, ${points[points.length - 1].y})`}>
              <circle r="8" fill="#38bdf8" opacity="0.3">
                <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
            </g>
          )}

          {/* X-axis time labels */}
          {history.map((pt, i) => {
            // Show every 3rd label or first/last to avoid clutter
            if (i % 3 === 0 || i === history.length - 1) {
              const x = getX(i, history.length);
              return (
                <text
                  key={`time-${i}`}
                  x={x}
                  y={height - paddingBottom + 18}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {pt.timeLabel}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Hover Monospace HUD Card */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 rounded-lg bg-slate-900/95 border border-cyan-500/40 p-2.5 font-mono text-[11px] shadow-lg backdrop-blur-md pointer-events-none space-y-1">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{hoveredPoint.timeLabel}</span>
            </div>
            <div className="text-slate-300">
              Tinggi Air (h): <span className="font-bold text-white">{hoveredPoint.waterLevelCm} cm</span>
            </div>
            <div className="text-slate-400">
              Jarak Sensor (s): {hoveredPoint.distanceSensorToWaterCm} cm
            </div>
            <div className="text-slate-400">
              Waktu Pantul (t): {hoveredPoint.echoTimeMs} ms
            </div>
            <div className="text-slate-400">
              Laju Kenaikan: {hoveredPoint.rateOfRiseCmPerMin} cm/min
            </div>
            <div className="text-slate-500 text-[10px]">
              LoRa RSSI: {hoveredPoint.rssi} dBm · SNR: {hoveredPoint.snr} dB
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
