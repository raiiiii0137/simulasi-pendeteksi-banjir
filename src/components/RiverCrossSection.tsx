import React, { useState, useEffect } from 'react';
import { SensorStation } from '../types/flood';
import { soundManager } from '../utils/audioSynth';
import { Waves, Bell, Radio, Sun, ArrowDown, ArrowUp, Activity } from 'lucide-react';

interface RiverCrossSectionProps {
  station: SensorStation;
  soundSpeed: number;
  onUpdateLevel: (newLevelCm: number) => void;
}

export const RiverCrossSection: React.FC<RiverCrossSectionProps> = ({
  station,
  soundSpeed,
  onUpdateLevel,
}) => {
  const [pulseActive, setPulseActive] = useState(false);
  const H = station.poleHeightCm; // e.g. 400 cm
  const h = station.currentLevelCm; // water level in cm
  const s = station.currentDistanceCm; // distance from sensor to water in cm
  const t = station.currentEchoTimeMs; // ms

  const triggerPulse = () => {
    setPulseActive(true);
    soundManager.playPingChirp();
    setTimeout(() => setPulseActive(false), 900);
  };

  // Convert cm to SVG coordinates
  // SVG Canvas dimensions: width 800, height 520
  // Top mounting bracket: y = 70
  // Riverbed: y = 470
  // Usable height span = 400 px (1 cm = 1 px scale!)
  const svgTop = 70;
  const svgBed = 470;
  const scale = (svgBed - svgTop) / H; // 1 px per cm

  const waterY = svgBed - h * scale;
  const sensorY = svgTop;

  // Thresholds in SVG Y
  const waspadaY = svgBed - station.thresholds.waspada * scale;
  const siagaY = svgBed - station.thresholds.siaga * scale;
  const awasY = svgBed - station.thresholds.awas * scale;
  const spilloverY = svgBed - station.thresholds.spillover * scale;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Visualisasi Potongan Melintang Saluran Sungai</h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              {station.name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Kondisi Geografis: Cekungan Rendah · Refleksi Gelombang Akustik 40 kHz · $h = H - s$
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPulse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-900/80 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-800 transition-colors shadow-sm shadow-cyan-500/10"
          >
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Kirim Pulsa Ultrasonik 40 kHz</span>
          </button>
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="relative mt-4 w-full overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950">
        <svg
          viewBox="0 0 800 520"
          className="w-full h-auto select-none"
          style={{ maxHeight: '560px' }}
        >
          <defs>
            {/* Water gradient */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#0369a1" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="1" />
            </linearGradient>

            {/* Riverbed soil gradient */}
            <linearGradient id="bedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Ultrasonic cone gradient */}
            <radialGradient id="ultrasonicBeam" cx="50%" cy="0%" r="90%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines background */}
          <g opacity="0.15">
            {[100, 200, 300, 400, 500, 600, 700].map((x) => (
              <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="520" stroke="#94a3b8" strokeDasharray="3,3" />
            ))}
            {[100, 200, 300, 400].map((y) => (
              <line key={`gy-${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#94a3b8" strokeDasharray="3,3" />
            ))}
          </g>

          {/* Embankment / Tanggul Cekungan Rendah (Sides) */}
          <path
            d={`M 0,${spilloverY} L 120,${spilloverY} L 220,${svgBed} L 580,${svgBed} L 680,${spilloverY} L 800,${spilloverY} L 800,520 L 0,520 Z`}
            fill="url(#bedGradient)"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Silt & Sediment layer at bottom */}
          <path
            d={`M 220,${svgBed} Q 400,${svgBed - 8} 580,${svgBed} L 580,${svgBed + 20} L 220,${svgBed + 20} Z`}
            fill="#1e293b"
            opacity="0.8"
          />

          {/* Debris / Trash blockage at drainage inlet if blocked */}
          {station.drainageBlockedPct > 0 && (
            <g transform={`translate(225, ${svgBed - 30})`}>
              <rect x="0" y="0" width="45" height="30" rx="3" fill="#78350f" opacity="0.85" />
              <text x="5" y="18" fill="#fde68a" fontSize="9" fontFamily="monospace">
                SUMBATAN
              </text>
            </g>
          )}

          {/* River Water Volume */}
          {h > 0 && (
            <g>
              <path
                d={`M ${220 - ((svgBed - waterY) / (svgBed - spilloverY)) * 100},${waterY} 
                    L ${580 + ((svgBed - waterY) / (svgBed - spilloverY)) * 100},${waterY} 
                    L 580,${svgBed} 
                    L 220,${svgBed} Z`}
                fill="url(#waterGradient)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />

              {/* Water Surface Wave Ripples */}
              <path
                d={`M ${220 - ((svgBed - waterY) / (svgBed - spilloverY)) * 100},${waterY} 
                    q 20,-3 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0 t 40,0`}
                fill="none"
                stroke="#bae6fd"
                strokeWidth="2"
                opacity="0.75"
              />
            </g>
          )}

          {/* Ultrasonic Acoustic Beam (Cone between sensor and water) */}
          <polygon
            points={`395,${sensorY + 12} 405,${sensorY + 12} 480,${waterY} 320,${waterY}`}
            fill="url(#ultrasonicBeam)"
          />

          {/* Animated ultrasonic pulses moving down */}
          <g>
            <path
              d={`M 380,${sensorY + 30} Q 400,${sensorY + 45} 420,${sensorY + 30}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              opacity={pulseActive ? '1' : '0.5'}
            />
            <path
              d={`M 360,${sensorY + 70} Q 400,${sensorY + 95} 440,${sensorY + 70}`}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
              opacity={pulseActive ? '0.9' : '0.4'}
            />
            <path
              d={`M 345,${sensorY + 120} Q 400,${sensorY + 150} 455,${sensorY + 120}`}
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.5"
              opacity={pulseActive ? '0.8' : '0.3'}
            />

            {/* Echo bounce back arrows */}
            <path
              d={`M 400,${waterY - 10} L 400,${sensorY + 25}`}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.7"
            />
            <circle cx="400" cy={(waterY + sensorY) / 2} r="4" fill="#fbbf24">
              <animate
                attributeName="cy"
                values={`${waterY - 10};${sensorY + 25}`}
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Threshold Level Lines across river */}
          {/* Spillover / Tanggul Kritis */}
          <line
            x1="120"
            y1={spilloverY}
            x2="680"
            y2={spilloverY}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="6,4"
          />
          <text x="690" y={spilloverY + 4} fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="600">
            TANGGUL MELUAP (350 cm)
          </text>

          {/* Siaga 1 (Awas) */}
          <line
            x1="140"
            y1={awasY}
            x2="660"
            y2={awasY}
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <text x="670" y={awasY + 4} fill="#f43f5e" fontSize="10" fontFamily="monospace" fontWeight="600">
            SIAGA 1 / AWAS ({station.thresholds.awas} cm)
          </text>

          {/* Siaga 2 (Siaga) */}
          <line
            x1="170"
            y1={siagaY}
            x2="630"
            y2={siagaY}
            stroke="#f97316"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x="640" y={siagaY + 4} fill="#f97316" fontSize="10" fontFamily="monospace">
            SIAGA 2 ({station.thresholds.siaga} cm)
          </text>

          {/* Siaga 3 (Waspada) */}
          <line
            x1="195"
            y1={waspadaY}
            x2="605"
            y2={waspadaY}
            stroke="#eab308"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x="615" y={waspadaY + 4} fill="#eab308" fontSize="10" fontFamily="monospace">
            SIAGA 3 / WASPADA ({station.thresholds.waspada} cm)
          </text>

          {/* Sensor Mounting Bridge / Crossbeam */}
          <rect x="260" y="45" width="280" height="15" rx="2" fill="#475569" stroke="#64748b" />
          <rect x="375" y="60" width="50" height="14" fill="#334155" />

          {/* Solar Panel & LoRa Antenna on Mount */}
          {/* Solar panel */}
          <polygon points="310,25 365,25 355,45 300,45" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
          <line x1="327" y1="25" x2="317" y2="45" stroke="#93c5fd" strokeWidth="0.5" />
          <line x1="347" y1="25" x2="337" y2="45" stroke="#93c5fd" strokeWidth="0.5" />

          {/* LoRa Antenna (SX1278 915 MHz whip antenna) */}
          <line x1="470" y1="15" x2="470" y2="45" stroke="#f8fafc" strokeWidth="2.5" />
          <circle cx="470" cy="15" r="3" fill="#38bdf8" />
          {/* LoRa Radio Waves Icon emission */}
          <path d="M 465,10 A 8,8 0 0 1 475,10" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
          <path d="M 460,6 A 14,14 0 0 1 480,6" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.6" />

          {/* Ultrasonic Sensor Enclosure (JSN-SR04T Waterproof Probe) */}
          <rect x="388" y="70" width="24" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="395" cy="86" r="4.5" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="405" cy="86" r="4.5" fill="#334155" stroke="#38bdf8" strokeWidth="1" />

          {/* Siren / Buzzer on pole */}
          <g transform="translate(435, 52)">
            <path d="M 0,0 L 12,-6 L 12,6 Z" fill={station.buzzerActive ? '#ef4444' : '#64748b'} />
            {station.buzzerActive && (
              <text x="16" y="4" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
                SIRINE AKTIF!
              </text>
            )}
          </g>

          {/* DIMENSION CALLOUT 1: Distance s = v * (t/2) */}
          <g transform="translate(290, 0)">
            <line x1="0" y1={sensorY + 12} x2="0" y2={waterY} stroke="#38bdf8" strokeWidth="2" />
            <polygon points={`-4,${sensorY + 18} 4,${sensorY + 18} 0,${sensorY + 12}`} fill="#38bdf8" />
            <polygon points={`-4,${waterY - 6} 4,${waterY - 6} 0,${waterY}`} fill="#38bdf8" />
            <rect
              x="-65"
              y={(sensorY + waterY) / 2 - 20}
              width="130"
              height="38"
              rx="4"
              fill="#090d16"
              stroke="#38bdf8"
              strokeWidth="1"
            />
            <text x="0" y={(sensorY + waterY) / 2 - 6} fill="#94a3b8" fontSize="9" textAnchor="middle">
              JARAK SENSOR (s)
            </text>
            <text
              x="0"
              y={(sensorY + waterY) / 2 + 10}
              fill="#38bdf8"
              fontSize="12"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {s} cm ({t} ms)
            </text>
          </g>

          {/* DIMENSION CALLOUT 2: Water Level h = H - s */}
          <g transform="translate(510, 0)">
            <line x1="0" y1={waterY} x2="0" y2={svgBed} stroke="#34d399" strokeWidth="2" />
            <polygon points={`-4,${waterY + 6} 4,${waterY + 6} 0,${waterY}`} fill="#34d399" />
            <polygon points={`-4,${svgBed - 6} 4,${svgBed - 6} 0,${svgBed}`} fill="#34d399" />
            <rect
              x="-65"
              y={(waterY + svgBed) / 2 - 20}
              width="130"
              height="38"
              rx="4"
              fill="#090d16"
              stroke="#34d399"
              strokeWidth="1"
            />
            <text x="0" y={(waterY + svgBed) / 2 - 6} fill="#94a3b8" fontSize="9" textAnchor="middle">
              TINGGI AIR (h = H - s)
            </text>
            <text
              x="0"
              y={(waterY + svgBed) / 2 + 10}
              fill="#34d399"
              fontSize="13"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {h} cm
            </text>
          </g>

          {/* DIMENSION CALLOUT 3: Total Height H */}
          <g transform="translate(70, 0)">
            <line x1="0" y1={sensorY} x2="0" y2={svgBed} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
            <polygon points={`-3,${sensorY + 6} 3,${sensorY + 6} 0,${sensorY}`} fill="#94a3b8" />
            <polygon points={`-3,${svgBed - 6} 3,${svgBed - 6} 0,${svgBed}`} fill="#94a3b8" />
            <rect
              x="-45"
              y={(sensorY + svgBed) / 2 - 16}
              width="90"
              height="32"
              rx="4"
              fill="#090d16"
              stroke="#475569"
              strokeWidth="1"
            />
            <text x="0" y={(sensorY + svgBed) / 2 - 3} fill="#94a3b8" fontSize="9" textAnchor="middle">
              TOTAL TIANG (H)
            </text>
            <text
              x="0"
              y={(sensorY + svgBed) / 2 + 11}
              fill="#f1f5f9"
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {H} cm
            </text>
          </g>

          {/* Riverbed Label */}
          <text x="400" y={svgBed + 32} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
            DASAR SALURAN / CEKUNGAN SUNGAI (ELEVASI 0 cm)
          </text>
        </svg>
      </div>

      {/* Interactive Water Level Slider to test the sensor math live */}
      <div className="mt-4 rounded-lg bg-slate-950/80 border border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Waves className="h-4 w-4 text-cyan-400" />
            <span>Simulasi Ketinggian Air (Pengujian Respon Sensor)</span>
          </label>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Tinggi Air (h):</span>
            <span className="text-sm font-bold text-cyan-400 tabular-nums">{h} cm</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Jarak Sensor (s):</span>
            <span className="text-sm font-bold text-slate-200 tabular-nums">{s} cm</span>
          </div>
        </div>

        <input
          type="range"
          min="10"
          max={H - 20}
          value={h}
          onChange={(e) => onUpdateLevel(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-2">
          <span>Surut: 20 cm</span>
          <span className="text-yellow-500/80">Waspada: {station.thresholds.waspada} cm</span>
          <span className="text-amber-500/80">Siaga: {station.thresholds.siaga} cm</span>
          <span className="text-rose-500/80">Awas: {station.thresholds.awas} cm</span>
          <span className="text-rose-400 font-semibold">Tanggul Meluap: {station.thresholds.spillover} cm</span>
        </div>
      </div>
    </div>
  );
};
