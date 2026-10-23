import React, { useState, useEffect, useRef } from 'react';
import { SensorStation } from '../types/flood';
import { soundManager } from '../utils/audioSynth';
import {
  simulateLoraLink,
  LoraRfConfig,
  LoraSimulationResult,
  SF_SPECS,
  TerrainType
} from '../utils/loraPropagation';
import {
  Radio,
  Signal,
  Wifi,
  Sliders,
  Send,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

interface LoraRangeSimulatorProps {
  station: SensorStation;
  onUpdateStationRf?: (sf: number, freq: number) => void;
}

const LANDMARKS = [
  { distKm: 0.5, name: 'Jembatan Citarum', desc: 'Lokasi sensor ultrasonik & pilar' },
  { distKm: 1.8, name: 'Bojong Asih RW 04', desc: 'Titik terendah pemukiman cekungan' },
  { distKm: 3.5, name: 'Kolam Cieunteung', desc: 'Polder retensi & pompa utama' },
  { distKm: 5.2, name: 'Kecamatan Dayeuhkolot', desc: 'Posko evakuasi & repeater lokal' },
  { distKm: 8.5, name: 'Telkom University', desc: 'Menara Gateway kampus tinggi 40m' },
  { distKm: 12.0, name: 'BPBD Kab. Bandung', desc: 'Pusat komando pengendali bencana (Soreang)' },
  { distKm: 18.0, name: 'Hulu Sungai Ciwidey', desc: 'Titik pantau resapan air pegunungan' },
  { distKm: 24.0, name: 'Kaki Gunung Wayang', desc: 'Mata air Citarum purba (Out of reach)' },
];

export const LoraRangeSimulator: React.FC<LoraRangeSimulatorProps> = ({
  station,
  onUpdateStationRf,
}) => {
  // Configuration state
  const [distanceKm, setDistanceKm] = useState<number>(4.8);
  const [spreadingFactor, setSpreadingFactor] = useState<number>(station.spreadingFactor || 9);
  const [freqMhz, setFreqMhz] = useState<number>(station.loraFreqMhz || 915.0);
  const [txPowerDbm, setTxPowerDbm] = useState<number>(14);
  const [terrain, setTerrain] = useState<TerrainType>('suburban');
  const [gatewayHeightM, setGatewayHeightM] = useState<number>(25);
  const [nodeHeightM, setNodeHeightM] = useState<number>(4);

  // Ping test state
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    rttMs: number;
    rssi: number;
    snr: number;
    payloadHex: string;
  } | null>(null);

  // Canvas visual loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const wavePhaseRef = useRef<number>(0);
  const pingPacketPosRef = useRef<number | null>(null);

  // Compute RF link simulation
  const config: LoraRfConfig = {
    distanceKm,
    freqMhz,
    txPowerDbm,
    txGainDbi: 2.15, // Standard omni dipole
    rxGainDbi: 5.8,  // High-gain collinear fiberglass
    gatewayHeightM,
    nodeHeightM,
    spreadingFactor,
    bandwidthKhz: 125,
    terrain,
    rainMmHr: station.rainfallIntensityMmHr,
  };

  const simResult: LoraSimulationResult = simulateLoraLink(config);

  // Handle Send Ping Packet test
  const handleSendPing = () => {
    if (isPinging) return;
    setIsPinging(true);
    soundManager.playPingChirp();
    pingPacketPosRef.current = 0; // Starts from Tx node

    const simDelay = Math.max(300, simResult.timeOnAirMs + distanceKm * 25);

    setTimeout(() => {
      const isSuccess = simResult.packetDeliveryRatePct > 15;
      if (isSuccess) {
        soundManager.playBuzzerBeep();
      }

      setPingResult({
        success: isSuccess,
        rttMs: Math.round(simDelay * 1.6),
        rssi: simResult.rssiDbm,
        snr: simResult.snrDb,
        payloadHex: `0xAA 0x01 0x${Math.round(station.currentLevelCm).toString(16).toUpperCase()} 0xSF${spreadingFactor}`,
      });

      setIsPinging(false);
      pingPacketPosRef.current = null;
    }, simDelay);
  };

  // Sync SF change with station
  const handleSfSelect = (sf: number) => {
    setSpreadingFactor(sf);
    if (onUpdateStationRf) {
      onUpdateStationRf(sf, freqMhz);
    }
  };

  // Canvas 2D RF Beam & Propagation drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      wavePhaseRef.current += 0.05;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background Grid / Night sky
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      // Draw faint topographic grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Ground Terrain Profile
      const groundY = h - 60;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, groundY + 10);

      // Cekungan Basin Profile (Dips in the middle like Dayeuhkolot)
      ctx.bezierCurveTo(
        w * 0.2, groundY + 25, // Deep basin Bojong Asih
        w * 0.5, groundY + 15,
        w * 0.8, groundY - 15  // Rising up to Soreang/Baleendah hill
      );
      ctx.lineTo(w, groundY - 20);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // River Water Layer at Tx (Sungai Citarum)
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(30, groundY + 15, 90, 45);

      // Node Tx Position (Left)
      const txX = 75;
      const txMastHeightPx = 45;
      const txY = groundY + 15 - txMastHeightPx;

      // Gateway Rx Position (Right)
      const rxX = w - 85;
      const rxMastHeightPx = 30 + (gatewayHeightM / 45) * 55;
      const rxY = groundY - 20 - rxMastHeightPx;

      // Draw Tx Mast & Dipole Antenna (Sensor Citarum)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(txX, groundY + 15);
      ctx.lineTo(txX, txY);
      ctx.stroke();

      // Antenna Whip
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(txX, txY);
      ctx.lineTo(txX, txY - 18);
      ctx.stroke();

      // Tx Node Box (ESP32 IP67)
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(txX - 9, txY + 10, 18, 14);

      // Tx Pulse Rings (Chirp Spread Spectrum Waves)
      const maxRings = 4;
      for (let r = 0; r < maxRings; r++) {
        const ringRadius = ((wavePhaseRef.current * 18 + r * 22) % 90);
        const ringAlpha = Math.max(0, 1 - ringRadius / 90);
        ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(txX, txY - 18, ringRadius, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }

      // Draw Rx Gateway Tower (Lattice Tower)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rxX, groundY - 20);
      ctx.lineTo(rxX, rxY);
      ctx.stroke();

      // Lattice cross struts
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      for (let y = rxY; y < groundY - 20; y += 14) {
        ctx.beginPath();
        ctx.moveTo(rxX - 8, y + 14);
        ctx.lineTo(rxX + 8, y);
        ctx.lineTo(rxX - 8, y);
        ctx.stroke();
      }

      // Gateway Fiberglass Collinear Antenna
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rxX, rxY);
      ctx.lineTo(rxX, rxY - 25);
      ctx.stroke();

      // Gateway Hub Box
      ctx.fillStyle = '#059669';
      ctx.fillRect(rxX - 10, rxY + 6, 20, 16);

      // ==========================================================
      // FRESNEL ZONE 1 ELLIPTICAL RADIO BEAM
      // ==========================================================
      const midX = (txX + rxX) / 2;
      const midY = (txY + rxY) / 2;
      const beamDist = rxX - txX;
      // Visual Fresnel envelope height scaled to simulate clearance
      const visualFresnelH = Math.min(85, 20 + simResult.fresnelRadiusM * 2.2);

      ctx.save();
      ctx.translate(midX, midY);
      const angle = Math.atan2(rxY - txY, rxX - txX);
      ctx.rotate(angle);

      // Beam gradient based on Link Margin / Signal Status
      const beamGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, beamDist / 2);
      if (simResult.signalStatus === 'Sangat Kuat' || simResult.signalStatus === 'Baik') {
        beamGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
        beamGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.18)');
        beamGrad.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      } else if (simResult.signalStatus === 'Cukup') {
        beamGrad.addColorStop(0, 'rgba(234, 179, 8, 0.25)');
        beamGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.15)');
        beamGrad.addColorStop(1, 'rgba(245, 158, 11, 0.02)');
      } else if (simResult.signalStatus === 'Batas Sensitivitas') {
        beamGrad.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
        beamGrad.addColorStop(0.8, 'rgba(239, 68, 68, 0.15)');
        beamGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
      } else {
        // Disconnected
        beamGrad.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
        beamGrad.addColorStop(0.5, 'rgba(100, 116, 139, 0.08)');
        beamGrad.addColorStop(1, 'rgba(100, 116, 139, 0.0)');
      }

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, beamDist / 2, visualFresnelH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fresnel Zone Outline
      ctx.strokeStyle = simResult.statusColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash(simResult.signalStatus === 'Sinyal Putus' ? [6, 6] : [2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Direct Line-of-Sight (LOS) Core Vector
      ctx.strokeStyle = simResult.statusColor;
      ctx.lineWidth = simResult.signalStatus === 'Sinyal Putus' ? 1 : 2;
      ctx.beginPath();
      ctx.moveTo(-beamDist / 2, 0);
      ctx.lineTo(beamDist / 2, 0);
      ctx.stroke();

      ctx.restore();

      // Animated Packet Gliding through the beam
      if (isPinging && pingPacketPosRef.current !== null) {
        pingPacketPosRef.current += 0.035;
        if (pingPacketPosRef.current > 1) pingPacketPosRef.current = 1;

        const curT = pingPacketPosRef.current;
        const curPx = txX + (rxX - txX) * curT;
        const curPy = (txY - 18) + ((rxY - 25) - (txY - 18)) * curT;

        // Packet Aura
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(curPx, curPy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Packet Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(`TX DATA [${Math.round(curT * 100)}%]`, curPx - 24, curPy - 10);
      }

      // Obstacle visualization in the terrain
      if (terrain === 'suburban') {
        // Houses in Bojong Asih
        ctx.fillStyle = '#475569';
        ctx.fillRect(w * 0.35, groundY + 5, 24, 18);
        ctx.fillRect(w * 0.42, groundY + 12, 28, 16);
        ctx.fillRect(w * 0.52, groundY + 8, 26, 18);
        // Roofs
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(w * 0.35 - 3, groundY + 5);
        ctx.lineTo(w * 0.35 + 12, groundY - 4);
        ctx.lineTo(w * 0.35 + 27, groundY + 5);
        ctx.closePath();
        ctx.fill();
      } else if (terrain === 'dense_foliage') {
        // Trees
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(w * 0.38, groundY - 5, 18, 0, Math.PI * 2);
        ctx.arc(w * 0.48, groundY - 2, 22, 0, Math.PI * 2);
        ctx.arc(w * 0.58, groundY - 8, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rain overlay if heavy rain
      if (terrain === 'heavy_rain') {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 45; i++) {
          const rx = (i * 27 + wavePhaseRef.current * 40) % w;
          const ry = (i * 31 + wavePhaseRef.current * 90) % (h - 50);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + 12);
          ctx.stroke();
        }
      }

      // Labels on canvas
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`TX: SENSOR CITARUM (h=${nodeHeightM}m)`, 20, 24);

      ctx.fillStyle = '#10b981';
      ctx.fillText(`RX: GATEWAY BPBD (H=${gatewayHeightM}m)`, w - 240, 24);

      // Distance callout in center
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(w / 2 - 80, 12, 160, 26);
      ctx.strokeStyle = simResult.statusColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w / 2 - 80, 12, 160, 26);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`JARAK: ${distanceKm.toFixed(1)} km`, w / 2, 29);
      ctx.textAlign = 'left';

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [distanceKm, spreadingFactor, freqMhz, txPowerDbm, terrain, gatewayHeightM, nodeHeightM, simResult, isPinging]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Simulasi Jarak Jangkauan & Link Budget Radio LoRa
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                  SUB-GHz PROPAGATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Model matematis redaman lintasan gelombang radio (FSPL & Log-Distance) dari sensor Sungai Citarum ke Gateway BPBD
              </p>
            </div>
          </div>

          {/* Test Ping Packet Button */}
          <button
            onClick={handleSendPing}
            disabled={isPinging}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50"
          >
            <Send className={`h-3.5 w-3.5 ${isPinging ? 'animate-pulse' : ''}`} />
            <span>{isPinging ? 'Menguji Transmisi RF...' : 'Kirim Uji Paket LoRa'}</span>
          </button>
        </div>
      </div>

      {pingResult && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between animate-fade-in font-mono shadow-md ${
            pingResult.success
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 shadow-emerald-950'
              : 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{pingResult.success ? '✅' : '❌'}</span>
            <span>
              {pingResult.success
                ? `Uji Paket SUKSES! Diterima Gateway (RTT: ${pingResult.rttMs} ms · RSSI: ${pingResult.rssi} dBm · SNR: ${pingResult.snr} dB)`
                : `Uji Paket GAGAL / TIMEOUT! Sinyal terlalu lemah pada jarak ${distanceKm} km (Di luar sensitivitas SF${spreadingFactor})`}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Payload: {pingResult.payloadHex}
          </span>
        </div>
      )}

      {/* Main 2D Canvas Visualization Stage */}
      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative">
        <canvas
          ref={canvasRef}
          width={960}
          height={300}
          className="w-full h-auto block select-none bg-slate-950"
        />

        {/* Live HUD Floating Chips */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950/85 border border-slate-800/80 backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Status Link:</span>
            <span
              className="px-2 py-0.5 rounded font-bold text-xs"
              style={{
                backgroundColor: `${simResult.statusColor}20`,
                color: simResult.statusColor,
                border: `1px solid ${simResult.statusColor}60`,
              }}
            >
              ● {simResult.signalStatus.toUpperCase()} ({simResult.rssiDbm} dBm)
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Margin: <strong className="text-white">{simResult.linkMarginDb} dB</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              PDR: <strong className="text-emerald-400">{simResult.packetDeliveryRatePct}%</strong>
            </span>
            <span>·</span>
            <span>
              Zona Fresnel R1: <strong className="text-cyan-400">{simResult.fresnelRadiusM} m</strong>
            </span>
            <span>·</span>
            <span>
              Jangkauan Maks: <strong className="text-white">{simResult.maxTheoreticalRangeKm} km</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Simulator Controls & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Distance Slider & Quick Landmarks (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Distance Scrubber Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Pengaturan Jarak Jangkauan Transmisi (Distance km)
                </h3>
              </div>
              <span className="font-mono text-xl font-bold text-cyan-400 tabular-nums">
                {distanceKm.toFixed(1)} km
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0.2"
                max="25.0"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.2 km (Lokal)</span>
                <span>5 km (Kecamatan)</span>
                <span>10 km (Suburban)</span>
                <span>15 km (BPBD)</span>
                <span>25 km (Batas Maksimal)</span>
              </div>
            </div>

            {/* Quick Landmark Buttons */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Pilih Landmark / Lokasi Riil di Kabupaten Bandung:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANDMARKS.map((lm) => {
                  const isCurrent = Math.abs(distanceKm - lm.distKm) < 0.3;
                  return (
                    <button
                      key={lm.name}
                      onClick={() => setDistanceKm(lm.distKm)}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-cyan-950/60 border-cyan-500 shadow-sm shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-cyan-400 font-bold">
                          {lm.distKm} km
                        </span>
                        {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>}
                      </div>
                      <div className="font-bold text-xs text-white line-clamp-1 mt-0.5">{lm.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{lm.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RF Parameters Configuration Card */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Parameter Fisik Radio LoRa (SX1276 Transceiver)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Semtech Modulasi CSS</span>
            </div>

            {/* Spreading Factor Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Spreading Factor (SF):
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Sensitivitas: {SF_SPECS[spreadingFactor].sensitivity} dBm · ToA: {SF_SPECS[spreadingFactor].toa16BytesMs} ms
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[7, 8, 9, 10, 11, 12].map((sf) => {
                  const isSelected = spreadingFactor === sf;
                  return (
                    <button
                      key={sf}
                      onClick={() => handleSfSelect(sf)}
                      className={`py-2 px-1 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-mono text-xs">SF{sf}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {sf === 7 ? 'Cepat' : sf === 12 ? 'Maks Range' : 'Standar'}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                💡 <strong>Catatan Teknis:</strong> Semakin tinggi SF (SF10-SF12), semakin tinggi daya tembus sinyal radio dan jangkauan jarak jauh, namun waktu transmisi (Time on Air) menjadi lebih panjang.
              </p>
            </div>

            {/* Radio Frequency & Transmit Power */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Frequency */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 text-xs block">Frekuensi Radio:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFreqMhz(915.0)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-semibold border ${
                      freqMhz === 915.0
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    915 MHz (ID)
                  </button>
                  <button
                    onClick={() => setFreqMhz(433.0)}
                    className={`flex-1 py-1 rounded text-xs font-mono font-semibold border ${
                      freqMhz === 433.0
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    433 MHz
                  </button>
                </div>
              </div>

              {/* Tx Power */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 text-xs block">Daya Pancar (Tx Power):</span>
                <div className="flex gap-2">
                  {[14, 17, 20].map((pwr) => (
                    <button
                      key={pwr}
                      onClick={() => setTxPowerDbm(pwr)}
                      className={`flex-1 py-1 rounded text-xs font-mono font-semibold border ${
                        txPowerDbm === pwr
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {pwr} dBm
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway Mast Height */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 text-xs block">Tinggi Menara Gateway:</span>
                <div className="flex gap-2">
                  {[15, 25, 45].map((hgt) => (
                    <button
                      key={hgt}
                      onClick={() => setGatewayHeightM(hgt)}
                      className={`flex-1 py-1 rounded text-xs font-mono font-semibold border ${
                        gatewayHeightM === hgt
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {hgt}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Terrain Obstacle Selection */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Kondisi Kontur & Redaman Lingkungan (Obstacle / Weather):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'los', label: 'LOS Bebas (Lembah)', desc: 'Jalur sungai terbuka' },
                  { id: 'suburban', label: 'Pemukiman Dayeuhkolot', desc: 'Rumah warga padat' },
                  { id: 'dense_foliage', label: 'Rimbun Hutan Hulu', desc: 'Pepohonan & bukit' },
                  { id: 'heavy_rain', label: 'Hujan Badai Ekstrem', desc: 'Redaman partikel air' },
                ].map((t) => {
                  const isSelected = terrain === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTerrain(t.id as TerrainType)}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500 shadow-sm shadow-cyan-950'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{t.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Link Budget HUD & AI Radio Advice */}
        <div className="space-y-5">
          {/* Live Link Budget Meters */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Signal className="h-4 w-4 text-cyan-400" />
                <span>Link Budget Real-Time</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">FSPL Equation</span>
            </h3>

            {/* RSSI Meter */}
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Kekuatan Sinyal Diterima (RSSI):</span>
                <span
                  className="font-mono text-base font-bold tabular-nums"
                  style={{ color: simResult.statusColor }}
                >
                  {simResult.rssiDbm} dBm
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(5, ((simResult.rssiDbm + 140) / 90) * 100))}%`,
                    backgroundColor: simResult.statusColor,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-140 dBm (Putus)</span>
                <span>-120 dBm (Lemah)</span>
                <span>-90 dBm (Kuat)</span>
                <span>-50 dBm</span>
              </div>
            </div>

            {/* Detailed Metric Rows */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Signal-to-Noise Ratio (SNR):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {simResult.snrDb > 0 ? `+${simResult.snrDb}` : simResult.snrDb} dB
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Batas Sensitivitas Penerima:</span>
                <span className="font-mono text-slate-200">
                  {simResult.sensitivityDbm} dBm (SF{spreadingFactor})
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Link Margin (Safety Margin):</span>
                <span
                  className={`font-mono font-bold ${
                    simResult.linkMarginDb > 6
                      ? 'text-emerald-400'
                      : simResult.linkMarginDb > 0
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {simResult.linkMarginDb > 0 ? `+${simResult.linkMarginDb}` : simResult.linkMarginDb} dB
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Total Path Loss Redaman:</span>
                <span className="font-mono text-slate-200">
                  {simResult.totalPathLossDb} dB (FSPL: {simResult.fsplDb} dB)
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Paket Sukses (PDR):</span>
                <span className="font-mono font-bold text-cyan-400">
                  {simResult.packetDeliveryRatePct}%
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Time on Air (ToA):</span>
                <span className="font-mono text-slate-200">
                  {simResult.timeOnAirMs} ms / paket
                </span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Maks Jangkauan Kondisi Ini:</span>
                <span className="font-mono font-bold text-white">
                  {simResult.maxTheoreticalRangeKm} km
                </span>
              </div>
            </div>
          </div>

          {/* AI Radio Engineer Recommendation */}
          <div className="rounded-xl border border-cyan-800/50 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 p-4 space-y-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white">Diagnostik AI Radio Engineer</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {simResult.signalStatus === 'Sangat Kuat' || simResult.signalStatus === 'Baik'
                ? `Link radio sangat solid pada jarak ${distanceKm} km. Margin redundansi aman (+${simResult.linkMarginDb} dB). Data ketinggian air dapat ditransmisikan tanpa risiko paket hilang.`
                : simResult.signalStatus === 'Cukup'
                ? `Sinyal berada dalam rentang wajar (${simResult.rssiDbm} dBm). Direkomendasikan mempertahankan SF${spreadingFactor} atau menaikkan daya ke 20 dBm jika badai hujan meningkat.`
                : simResult.signalStatus === 'Batas Sensitivitas'
                ? `PERINGATAN: Sinyal mendekati noise floor (${simResult.rssiDbm} dBm). Tingkatkan Spreading Factor ke SF11/SF12 dan naikkan tinggi antena gateway untuk menjamin stabilitas.`
                : `KRITIS: Sinyal putus! Jarak ${distanceKm} km melampaui kemampuan link saat ini. Naikkan Spreading Factor ke SF12 dan posisikan Gateway di menara minimal 45m.`}
            </p>

            {simResult.linkMarginDb < 5 && (
              <button
                onClick={() => {
                  setSpreadingFactor(12);
                  setTxPowerDbm(20);
                  setGatewayHeightM(45);
                  soundManager.playPingChirp();
                }}
                className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-cyan-600/90 hover:bg-cyan-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Optimasi Otomatis (SF12 + Max Tower)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
