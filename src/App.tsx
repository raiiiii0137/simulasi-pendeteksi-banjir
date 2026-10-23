import React, { useState, useEffect, useRef } from 'react';
import { SensorStation, PhysicsParameters, AlertLevel, TelemetryPoint } from './types/flood';
import {
  calculateEchoDistanceCm,
  calculateEchoTimeMs,
  calculateWaterLevelCm,
  calculateRateOfRise,
  determineAlertLevel,
  calculateSpeedOfSound,
} from './utils/physicsCalculations';
import { soundManager } from './utils/audioSynth';
import { HeaderNav } from './components/HeaderNav';
import { RiverCrossSection } from './components/RiverCrossSection';
import { RealTimeHydrograph } from './components/RealTimeHydrograph';
import { PhysicsFormulaCard } from './components/PhysicsFormulaCard';
import { LoraTransmissionPipeline } from './components/LoraTransmissionPipeline';
import { MultiStationGrid } from './components/MultiStationGrid';
import { SimulationControls } from './components/SimulationControls';
import { EvacuationMitigationView } from './components/EvacuationMitigationView';
import { AIFloodAssistant } from './components/AIFloodAssistant';
import { DayeuhkolotFloodMap } from './components/DayeuhkolotFloodMap';
import { CCTVMonitoringStation } from './components/CCTVMonitoringStation';
import { MindMapModal } from './components/MindMapModal';
import { PerformanceEvaluationSection } from './components/PerformanceEvaluationSection';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { ShieldAlert, AlertTriangle, Radio, Activity, Sparkles, BrainCircuit, MapPin, Video, CloudRain, ClipboardCheck, Github } from 'lucide-react';

const INITIAL_STATIONS: SensorStation[] = [
  {
    id: 'ST-01-CEKUNGAN',
    name: 'Pos Pantau Bojong Asih Dayeuhkolot (Citarum)',
    locationType: 'Cekungan Rendah',
    poleHeightCm: 400,
    thresholds: {
      waspada: 150,
      siaga: 230,
      awas: 300,
      spillover: 350,
    },
    currentLevelCm: 165,
    currentDistanceCm: 235,
    currentEchoTimeMs: 13.82,
    rateOfRiseCmPerMin: 2.4,
    alertLevel: 'waspada',
    loraFreqMhz: 915.0,
    spreadingFactor: 10,
    rssi: -78,
    snr: 9.2,
    batteryPct: 94,
    solarCharging: true,
    buzzerActive: false,
    drainageBlockedPct: 35,
    rainfallIntensityMmHr: 45,
    history: [
      { timestamp: Date.now() - 18 * 60000, timeLabel: '10:00', echoTimeMs: 18.23, distanceSensorToWaterCm: 310, waterLevelCm: 90, rateOfRiseCmPerMin: 0.1, rssi: -77, snr: 9.8, batteryVolts: 3.96 },
      { timestamp: Date.now() - 15 * 60000, timeLabel: '10:03', echoTimeMs: 17.64, distanceSensorToWaterCm: 300, waterLevelCm: 100, rateOfRiseCmPerMin: 3.3, rssi: -78, snr: 9.5, batteryVolts: 3.96 },
      { timestamp: Date.now() - 12 * 60000, timeLabel: '10:06', echoTimeMs: 16.76, distanceSensorToWaterCm: 285, waterLevelCm: 115, rateOfRiseCmPerMin: 5.0, rssi: -77, snr: 9.4, batteryVolts: 3.95 },
      { timestamp: Date.now() - 9 * 60000, timeLabel: '10:09', echoTimeMs: 15.58, distanceSensorToWaterCm: 265, waterLevelCm: 135, rateOfRiseCmPerMin: 6.6, rssi: -79, snr: 9.1, batteryVolts: 3.94 },
      { timestamp: Date.now() - 6 * 60000, timeLabel: '10:12', echoTimeMs: 14.70, distanceSensorToWaterCm: 250, waterLevelCm: 150, rateOfRiseCmPerMin: 5.0, rssi: -78, snr: 9.2, batteryVolts: 3.94 },
      { timestamp: Date.now() - 3 * 60000, timeLabel: '10:15', echoTimeMs: 14.11, distanceSensorToWaterCm: 240, waterLevelCm: 160, rateOfRiseCmPerMin: 3.3, rssi: -78, snr: 9.3, batteryVolts: 3.93 },
      { timestamp: Date.now(), timeLabel: '10:18', echoTimeMs: 13.82, distanceSensorToWaterCm: 235, waterLevelCm: 165, rateOfRiseCmPerMin: 2.4, rssi: -78, snr: 9.2, batteryVolts: 3.93 },
    ],
  },
  {
    id: 'ST-02-HULU',
    name: 'Pos Pantau DAS Hulu Pegunungan',
    locationType: 'Hulu Sungai',
    poleHeightCm: 450,
    thresholds: {
      waspada: 180,
      siaga: 260,
      awas: 330,
      spillover: 400,
    },
    currentLevelCm: 285,
    currentDistanceCm: 165,
    currentEchoTimeMs: 9.7,
    rateOfRiseCmPerMin: 5.8,
    alertLevel: 'siaga',
    loraFreqMhz: 915.0,
    spreadingFactor: 12,
    rssi: -94,
    snr: 6.8,
    batteryPct: 88,
    solarCharging: true,
    buzzerActive: false,
    drainageBlockedPct: 10,
    rainfallIntensityMmHr: 75,
    history: [
      { timestamp: Date.now() - 18 * 60000, timeLabel: '10:00', echoTimeMs: 17.6, distanceSensorToWaterCm: 300, waterLevelCm: 150, rateOfRiseCmPerMin: 0.5, rssi: -93, snr: 7.2, batteryVolts: 3.9 },
      { timestamp: Date.now() - 12 * 60000, timeLabel: '10:06', echoTimeMs: 14.7, distanceSensorToWaterCm: 250, waterLevelCm: 200, rateOfRiseCmPerMin: 8.3, rssi: -94, snr: 6.9, batteryVolts: 3.89 },
      { timestamp: Date.now() - 6 * 60000, timeLabel: '10:12', echoTimeMs: 11.7, distanceSensorToWaterCm: 200, waterLevelCm: 250, rateOfRiseCmPerMin: 8.3, rssi: -95, snr: 6.8, batteryVolts: 3.88 },
      { timestamp: Date.now(), timeLabel: '10:18', echoTimeMs: 9.7, distanceSensorToWaterCm: 165, waterLevelCm: 285, rateOfRiseCmPerMin: 5.8, rssi: -94, snr: 6.8, batteryVolts: 3.88 },
    ],
  },
  {
    id: 'ST-03-PINTUAIR',
    name: 'Pintu Air Kanal Pengendali Timur',
    locationType: 'Pintu Air Utama',
    poleHeightCm: 380,
    thresholds: {
      waspada: 140,
      siaga: 210,
      awas: 280,
      spillover: 340,
    },
    currentLevelCm: 110,
    currentDistanceCm: 270,
    currentEchoTimeMs: 15.88,
    rateOfRiseCmPerMin: 0.8,
    alertLevel: 'normal',
    loraFreqMhz: 915.0,
    spreadingFactor: 9,
    rssi: -72,
    snr: 11.4,
    batteryPct: 98,
    solarCharging: true,
    buzzerActive: false,
    drainageBlockedPct: 15,
    rainfallIntensityMmHr: 20,
    history: [
      { timestamp: Date.now() - 18 * 60000, timeLabel: '10:00', echoTimeMs: 16.47, distanceSensorToWaterCm: 280, waterLevelCm: 100, rateOfRiseCmPerMin: 0.2, rssi: -71, snr: 11.5, batteryVolts: 3.98 },
      { timestamp: Date.now() - 12 * 60000, timeLabel: '10:06', echoTimeMs: 16.17, distanceSensorToWaterCm: 275, waterLevelCm: 105, rateOfRiseCmPerMin: 0.8, rssi: -72, snr: 11.4, batteryVolts: 3.98 },
      { timestamp: Date.now(), timeLabel: '10:18', echoTimeMs: 15.88, distanceSensorToWaterCm: 270, waterLevelCm: 110, rateOfRiseCmPerMin: 0.8, rssi: -72, snr: 11.4, batteryVolts: 3.98 },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'crossSection' | 'physics' | 'loraPipeline' | 'mitigation' | 'aiAssistant' | 'dayeuhkolotMap' | 'cctvMonitor' | 'performanceEval'>('dashboard');
  const [stations, setStations] = useState<SensorStation[]>(INITIAL_STATIONS);
  const [activeStationId, setActiveStationId] = useState<string>('ST-01-CEKUNGAN');
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(true);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);
  const [isMindMapOpen, setIsMindMapOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  const [physics, setPhysics] = useState<PhysicsParameters>({
    airTemperatureC: 25,
    soundVelocityMPerS: 346.3, // calculated at 25°C
    ultrasonicFrequencyKhz: 40,
    poleHeightH: 400,
  });

  const activeStation = stations.find((s) => s.id === activeStationId) || stations[0];

  // Toggle Emergency Siren (Synthetic Web Audio)
  const handleToggleSiren = () => {
    if (isSirenPlaying) {
      soundManager.stopSiren();
      setIsSirenPlaying(false);
    } else {
      soundManager.startSiren();
      setIsSirenPlaying(true);
    }
  };

  // Update physical sound speed whenever air temperature changes
  const handleUpdatePhysicsTemp = (tempC: number) => {
    const v = calculateSpeedOfSound(tempC);
    setPhysics((prev) => ({
      ...prev,
      airTemperatureC: tempC,
      soundVelocityMPerS: v,
    }));
  };

  // Helper to recompute derived values for a station
  const updateStationMetrics = (st: SensorStation, newLevel: number, timeStr?: string): SensorStation => {
    const clampedLevel = Math.max(5, Math.min(st.poleHeightCm - 15, newLevel));
    const s = Number((st.poleHeightCm - clampedLevel).toFixed(1));
    const t = calculateEchoTimeMs(s, physics.soundVelocityMPerS);

    const prevLevel = st.currentLevelCm;
    const deltaH = clampedLevel - prevLevel;
    const newVh = Number((deltaH * 1.2).toFixed(2)); // simulated minute rate

    const newAlert = determineAlertLevel(clampedLevel, st.thresholds);
    const buzzerActive = newAlert === 'awas' || newVh > 12;

    const newPoint: TelemetryPoint = {
      timestamp: Date.now(),
      timeLabel: timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      echoTimeMs: t,
      distanceSensorToWaterCm: s,
      waterLevelCm: clampedLevel,
      rateOfRiseCmPerMin: newVh,
      rssi: st.rssi + Math.floor((Math.random() - 0.5) * 2),
      snr: Number((st.snr + (Math.random() - 0.5) * 0.4).toFixed(1)),
      batteryVolts: 3.93,
    };

    const newHistory = [...st.history.slice(-15), newPoint];

    return {
      ...st,
      currentLevelCm: clampedLevel,
      currentDistanceCm: s,
      currentEchoTimeMs: t,
      rateOfRiseCmPerMin: newVh,
      alertLevel: newAlert,
      buzzerActive,
      history: newHistory,
    };
  };

  // Manual water level scrubber handler
  const handleUpdateLevel = (newLevelCm: number) => {
    setStations((prev) =>
      prev.map((s) => (s.id === activeStationId ? updateStationMetrics(s, newLevelCm) : s))
    );
  };

  // Rainfall intensity change
  const handleUpdateRainfall = (mmHr: number) => {
    setStations((prev) =>
      prev.map((s) => (s.id === activeStationId ? { ...s, rainfallIntensityMmHr: mmHr } : s))
    );
  };

  // Drainage blockage change
  const handleUpdateBlockage = (pct: number) => {
    setStations((prev) =>
      prev.map((s) => (s.id === activeStationId ? { ...s, drainageBlockedPct: pct } : s))
    );
  };

  // Inject sudden flash flood surge (+60 cm)
  const handleInjectFlashFlood = () => {
    soundManager.playPingChirp();
    setTimeout(() => {
      soundManager.playBuzzerBeep();
      setStations((prev) =>
        prev.map((s) => {
          if (s.id === activeStationId) {
            return updateStationMetrics(s, s.currentLevelCm + 65);
          }
          return s;
        })
      );
    }, 200);
  };

  // Reset station to normal
  const handleResetStation = () => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === activeStationId) {
          return updateStationMetrics(s, 95);
        }
        return s;
      })
    );
    if (isSirenPlaying) {
      soundManager.stopSiren();
      setIsSirenPlaying(false);
    }
  };

  // LoRa transmission pulse
  const handleSimulateTransmission = () => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id === activeStationId) {
          return {
            ...s,
            rssi: -75 - Math.floor(Math.random() * 8),
            snr: Number((8.5 + Math.random() * 2.5).toFixed(1)),
          };
        }
        return s;
      })
    );
  };

  // Update LoRa RF configuration for current station
  const handleUpdateStationRf = (sf: number, freq: number) => {
    setStations((prev) =>
      prev.map((s) => (s.id === activeStationId ? { ...s, spreadingFactor: sf, loraFreqMhz: freq } : s))
    );
  };

  // Simulation timer tick (every 4 seconds)
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      setStations((prev) =>
        prev.map((st) => {
          // Dynamic calculation based on rain and blockage
          const rainEffect = (st.rainfallIntensityMmHr / 60) * 1.8;
          const clogEffect = (st.drainageBlockedPct / 100) * 1.2;
          const drainRate = 1.0; // natural canal drainage capacity

          const netChange = rainEffect + clogEffect - drainRate + (Math.random() - 0.48) * 0.8;
          const targetLevel = Math.max(20, Math.min(st.thresholds.spillover + 10, st.currentLevelCm + netChange));

          return updateStationMetrics(st, targetLevel);
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoSimulating, physics.soundVelocityMPerS]);

  // Overall highest alert level across all stations for header
  const highestAlert: AlertLevel = stations.some((s) => s.alertLevel === 'awas')
    ? 'awas'
    : stations.some((s) => s.alertLevel === 'siaga')
    ? 'siaga'
    : stations.some((s) => s.alertLevel === 'waspada')
    ? 'waspada'
    : 'normal';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertLevel={highestAlert}
        isSirenPlaying={isSirenPlaying}
        onToggleSiren={handleToggleSiren}
        onOpenMindMap={() => setIsMindMapOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Urgent Alert Banner if AWAS */}
        {highestAlert === 'awas' && (
          <div className="rounded-xl border border-rose-500/80 bg-rose-950/70 p-4 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/50 animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0" />
              <div>
                <strong className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  PERINGATAN AWAS (SIAGA 1): Potensi Kenaikan Air Mendadak & Luapan Cekungan!
                </strong>
                <p className="text-xs text-rose-200 mt-0.5">
                  Elevasi air saluran mencapai batas kritis. Sirine lapangan telah diaktifkan dan protokol evakuasi mandiri segera diberlakukan.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('mitigation')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold whitespace-nowrap transition-colors"
            >
              Lihat Rute Evakuasi
            </button>
          </div>
        )}

        {/* Tab 1: Central Flood Monitoring Dashboard (Default) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* AI Smart Advisory Quick Banner */}
            <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 via-slate-900/80 to-slate-950/70 p-4 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md shadow-cyan-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-900/60 border border-cyan-500/50 text-cyan-300 shrink-0">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      AI Hydro-Sentinel Diagnostik:
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-mono">
                      Gemini Real-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {activeStation.alertLevel === 'awas'
                      ? '⚠️ Ketinggian air mendekati tanggul cekungan! Segera instruksikan evakuasi mandiri.'
                      : activeStation.rateOfRiseCmPerMin > 5
                      ? '⚡ Terdeteksi lonjakan air cepat (+5 cm/menit). Waspadai flash flood di cekungan rendah.'
                      : '✅ Telemetri LoRa stabil. Evaluasi risiko dan konsultasikan mitigasi dengan asisten AI.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('aiAssistant')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold whitespace-nowrap transition-colors shadow-sm shadow-cyan-600/30"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Buka Analisis & Chat AI</span>
              </button>
            </div>

            {/* Quick CCTV, Rain Sensor, LoRa Range, and Testing Evaluation Status Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div
                onClick={() => setActiveTab('cctvMonitor')}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/60 p-3.5 flex items-center justify-between transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-600/40 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">CCTV & Sampah Sungai</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono">LIVE</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      Visual Citarum & deteksi sampah
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('cctvMonitor')}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/60 p-3.5 flex items-center justify-between transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-600/40 text-cyan-400 group-hover:scale-105 transition-transform">
                    <CloudRain className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Sensor Curah Hujan</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">
                        {activeStation.rainfallIntensityMmHr} mm/j
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {activeStation.rainfallIntensityMmHr > 60
                        ? '⚠️ Hujan Ekstrem'
                        : activeStation.rainfallIntensityMmHr > 20
                        ? '🌧️ Hujan Sedang'
                        : '☀️ Kering / Cerah'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('loraPipeline')}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/60 p-3.5 flex items-center justify-between transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-600/40 text-amber-400 group-hover:scale-105 transition-transform">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Simulasi Jarak LoRa</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-mono">
                        0.1-25 km
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      Link budget & redaman radio FSPL
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('performanceEval')}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/60 p-3.5 flex items-center justify-between transition-all group backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-950/70 border border-indigo-600/40 text-indigo-400 group-hover:scale-105 transition-transform">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Pengujian & Evaluasi</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono">
                        Bab IV
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      Bagan metode, data uji, & skripsi
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Buka →
                </span>
              </div>
            </div>

            {/* Multi-Station Grid (Pusat Pemantau) */}
            <MultiStationGrid
              stations={stations}
              activeStationId={activeStationId}
              onSelectStation={(id) => setActiveStationId(id)}
            />

            {/* Real-time Hydrograph Chart */}
            <RealTimeHydrograph station={activeStation} />

            {/* Peta Interaktif Simulasi Banjir Dayeuhkolot */}
            <DayeuhkolotFloodMap
              station={activeStation}
              onUpdateLevel={handleUpdateLevel}
            />

            {/* Quick Cross Section Preview */}
            <RiverCrossSection
              station={activeStation}
              soundSpeed={physics.soundVelocityMPerS}
              onUpdateLevel={handleUpdateLevel}
            />

            {/* Simulation Controls for Rainfall & Drainage Blockage */}
            <SimulationControls
              station={activeStation}
              isAutoSimulating={isAutoSimulating}
              onToggleAutoSim={() => setIsAutoSimulating(!isAutoSimulating)}
              onUpdateRainfall={handleUpdateRainfall}
              onUpdateBlockage={handleUpdateBlockage}
              onInjectFlashFlood={handleInjectFlashFlood}
              onResetStation={handleResetStation}
            />
          </div>
        )}

        {/* Tab 2: Visual Saluran Sungai (Cross-section) */}
        {activeTab === 'crossSection' && (
          <div className="space-y-6">
            <RiverCrossSection
              station={activeStation}
              soundSpeed={physics.soundVelocityMPerS}
              onUpdateLevel={handleUpdateLevel}
            />

            <MultiStationGrid
              stations={stations}
              activeStationId={activeStationId}
              onSelectStation={(id) => setActiveStationId(id)}
            />
          </div>
        )}

        {/* Tab 3: Konsep Fisika & Rumus */}
        {activeTab === 'physics' && (
          <PhysicsFormulaCard
            station={activeStation}
            physics={physics}
            onUpdatePhysicsTemp={handleUpdatePhysicsTemp}
          />
        )}

        {/* Tab 4: Transmisi LoRa & Simulasi Jarak Jangkauan */}
        {activeTab === 'loraPipeline' && (
          <LoraTransmissionPipeline
            station={activeStation}
            onSimulateTransmission={handleSimulateTransmission}
            onUpdateStationRf={handleUpdateStationRf}
          />
        )}

        {/* Tab 5: Mitigasi & Evakuasi */}
        {activeTab === 'mitigation' && (
          <EvacuationMitigationView
            station={activeStation}
            onTriggerSimulatedSiren={handleToggleSiren}
          />
        )}

        {/* Tab 6: AI Asisten Banjir & Diagnostik Gemini */}
        {activeTab === 'aiAssistant' && (
          <AIFloodAssistant
            station={activeStation}
            physics={physics}
          />
        )}

        {/* Tab 7: Peta Simulasi Banjir Cekungan Dayeuhkolot */}
        {activeTab === 'dayeuhkolotMap' && (
          <DayeuhkolotFloodMap
            station={activeStation}
            onUpdateLevel={handleUpdateLevel}
          />
        )}

        {/* Tab 8: CCTV Pemantau Banjir & Pendeteksi Hujan */}
        {activeTab === 'cctvMonitor' && (
          <CCTVMonitoringStation
            station={activeStation}
            onUpdateLevel={handleUpdateLevel}
            onUpdateRainfall={handleUpdateRainfall}
            onUpdateBlockage={handleUpdateBlockage}
          />
        )}

        {/* Tab 9: Pengujian dan Evaluasi Kinerja (Bab IV) */}
        {activeTab === 'performanceEval' && (
          <PerformanceEvaluationSection />
        )}
      </main>

      {/* Mind Map Tree Drawer/Modal */}
      <MindMapModal
        isOpen={isMindMapOpen}
        onClose={() => setIsMindMapOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* GitHub Deployment & Export Modal */}
      <GitHubDeployModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Clean Domain Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-slate-500 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">HYDRO-LORA EWS</span>
            <span aria-hidden="true">·</span>
            <span>Sistem Peringatan Dini Banjir Berbasis LoRa & Ultrasonik 40 kHz</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>Panduan GitHub & Deploy Pages</span>
            </button>
            <span aria-hidden="true" className="text-slate-800">|</span>
            <span className="font-mono text-slate-400">Sub-GHz 915 MHz</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">JSN-SR04T IP67</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-400">ESP32</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
