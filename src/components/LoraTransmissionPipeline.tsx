import React, { useState } from 'react';
import { SensorStation } from '../types/flood';
import { soundManager } from '../utils/audioSynth';
import { LoraRangeSimulator } from './LoraRangeSimulator';
import {
  Radio,
  Cpu,
  Wifi,
  Volume2,
  Waves,
  ArrowRight,
  ShieldCheck,
  Zap,
  BatteryCharging,
  Signal,
  Terminal,
  Play,
  Compass,
  Sliders,
  Layers
} from 'lucide-react';

interface LoraTransmissionPipelineProps {
  station: SensorStation;
  onSimulateTransmission: () => void;
  onUpdateStationRf?: (sf: number, freq: number) => void;
}

export const LoraTransmissionPipeline: React.FC<LoraTransmissionPipelineProps> = ({
  station,
  onSimulateTransmission,
  onUpdateStationRf,
}) => {
  const [loraViewMode, setLoraViewMode] = useState<'rangeSimulator' | 'pipelineInspector'>('rangeSimulator');
  const [activeStep, setActiveStep] = useState<number>(3);
  const [transmitting, setTransmitting] = useState(false);

  const handleTransmitNow = () => {
    setTransmitting(true);
    soundManager.playPingChirp();
    setTimeout(() => {
      soundManager.playBuzzerBeep();
      onSimulateTransmission();
      setTransmitting(false);
    }, 700);
  };

  const steps = [
    {
      id: 1,
      title: 'Sensor Kirim Gelombang',
      sub: 'Transduser Ultrasonik 40 kHz',
      icon: Waves,
      desc: 'Transduser piezoelektrik memancarkan semburan pulsa ultrasonik 40 kHz menuju permukaan air dan merekam waktu tiba gelombang pantul (echo).',
      detail: `Waktu Pantul (t): ${station.currentEchoTimeMs} ms · Frekuensi: 40.0 kHz · Rentang Ukur: 20 cm - 450 cm`,
    },
    {
      id: 2,
      title: 'ESP32 Proses Data',
      sub: 'Mikrokontroler 32-bit Dual-Core',
      icon: Cpu,
      desc: 'ESP32 mengeksekusi rumus fisika s = v*(t/2), h = H - s, memfilter riak air dengan moving median filter, dan menghitung laju kenaikan Vh = Δh/Δt.',
      detail: `Ketinggian Air: ${station.currentLevelCm} cm · Laju Kenaikan: ${station.rateOfRiseCmPerMin} cm/min · Algoritma: Kalman/Median Filter`,
    },
    {
      id: 3,
      title: 'LoRa Transmit ke Gateway',
      sub: 'Semtech SX1276/SX1278 (915 MHz)',
      icon: Radio,
      desc: 'Paket telemetri dikompresi dan ditransmisikan via gelombang radio Sub-GHz LoRa modulasi Chirp Spread Spectrum jarak jauh tanpa ketergantungan internet di lokasi.',
      detail: `Frekuensi: ${station.loraFreqMhz} MHz · Spreading Factor: SF${station.spreadingFactor} · RSSI: ${station.rssi} dBm · SNR: ${station.snr} dB`,
    },
    {
      id: 4,
      title: 'Gateway Terima & Distribusi',
      sub: 'Konsentrator LoRa & Web Server',
      icon: Wifi,
      desc: 'LoRa Gateway menerima transmisi RF tanpa internet seluler pada sensor, mendekompresi payload, dan meneruskan ke Pusat Pemantau Banjir & dashboard.',
      detail: `Packet Delivery Rate: 99.4% · Jarak Transmisi: ~4.2 km Line-of-Sight · Protocol: LoRa P2P Raw Telemetry`,
    },
    {
      id: 5,
      title: 'Aktivasi Alarm Buzzer / Sirine',
      sub: 'Aktuator Early Warning Lapangan',
      icon: Volume2,
      desc: 'Jika ketinggian h melebihi ambang batas Siaga 1 (Awas) atau kenaikan mendadak terdeteksi (Vh > ambang batas), buzzer dan sirine lapangan dibunyikan otomatis.',
      detail: `Status Sirine: ${station.buzzerActive ? 'AKTIF BERBUNYI' : 'SIAGA (STANDBY)'} · Output: High Decibel Siren 110 dB`,
    },
  ];

  // Simulated raw hex payload
  const rawHex = `[0xAA, 0x01, 0x${Math.round(station.currentLevelCm).toString(16).toUpperCase().padStart(4, '0')}, 0x${Math.round(station.currentDistanceCm).toString(16).toUpperCase().padStart(4, '0')}, 0x${Math.abs(Math.round(station.rateOfRiseCmPerMin * 10)).toString(16).toUpperCase().padStart(2, '0')}, 0x${Math.round(station.batteryPct).toString(16).toUpperCase()}, 0x55]`;

  return (
    <div className="space-y-6">
      {/* View Switcher Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800/80">
          <button
            onClick={() => setLoraViewMode('rangeSimulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              loraViewMode === 'rangeSimulator'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/70 shadow-sm shadow-cyan-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-cyan-400" />
            <span>Simulasi Jarak Jangkauan (0.1 - 25 km)</span>
          </button>

          <button
            onClick={() => setLoraViewMode('pipelineInspector')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              loraViewMode === 'pipelineInspector'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-slate-300" />
            <span>Alur Transmisi & Packet Inspector</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono px-2 text-slate-400">
          <span>Node: <strong className="text-white">{station.id}</strong></span>
          <span>·</span>
          <span>SF: <strong className="text-cyan-400">SF{station.spreadingFactor}</strong></span>
          <span>·</span>
          <span>Freq: <strong className="text-white">{station.loraFreqMhz} MHz</strong></span>
        </div>
      </div>

      {/* Mode 1: Comprehensive LoRa Distance & RF Coverage Simulator */}
      {loraViewMode === 'rangeSimulator' && (
        <div className="space-y-6">
          <LoraRangeSimulator
            station={station}
            onUpdateStationRf={onUpdateStationRf}
          />
        </div>
      )}

      {/* Mode 2: 5-Stage Transmission Pipeline & Raw Payload Inspector */}
      {loraViewMode === 'pipelineInspector' && (
        <div className="space-y-6">
          {/* Advantages Banner matching Mind Map */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio className="h-5 w-5 text-cyan-400" />
                  <span>Sistem Komunikasi Data Berbasis Teknologi LoRa</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Keunggulan utama sesuai analisis: Komunikasi Jarak Jauh, Mandiri Tanpa Internet di Lapangan, dan Frekuensi Radio Kuat Penetrasi Cuaca.
                </p>
              </div>

              <button
                onClick={handleTransmitNow}
                disabled={transmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
              >
                <Play className={`h-3.5 w-3.5 ${transmitting ? 'animate-spin' : ''}`} />
                <span>{transmitting ? 'Mentransmisikan Paket RF...' : 'Kirim Paket LoRa Manual'}</span>
              </button>
            </div>

            {/* 3 Pillars of LoRa Technology */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                  <Signal className="h-4 w-4" />
                  <span>Komunikasi Jarak Jauh (Long Range)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Menjangkau 5–15 km dari pos pengamatan hulu pelosok atau bendungan terpencil langsung ke posko utama tanpa perlu repeater mahal.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Mandiri Tanpa Internet di Node</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Transmisi radio peer-to-peer Sub-GHz tetap bekerja 100% meskipun BTS seluler mati akibat pemadaman listrik saat badai hujan ekstrem.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <Zap className="h-4 w-4" />
                  <span>Frekuensi Radio Kuat & Hemat Daya</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Penetrasi dedaunan dan lembah cekungan optimal pada 915 MHz/433 MHz. Konsumsi daya mikroampere memungkinkan sistem hidup bertahun-tahun bertenaga panel surya.
                </p>
              </div>
            </div>
          </div>

          {/* 5-Step Pipeline Flow Diagram */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-4">
              Alur Transmisi Sistem Telemetri (Dari Sensor ke Alarm Peringatan)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {steps.map((step) => {
                const Icon = step.icon;
                const isSelected = activeStep === step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`cursor-pointer rounded-lg p-3.5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          TAHAP 0{step.id}
                        </span>
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{step.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.sub}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                      Klik untuk detail
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Step Deep Dive */}
            {activeStep && (
              <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    PENJELASAN TAHAP {activeStep}:
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {steps[activeStep - 1].title} ({steps[activeStep - 1].sub})
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {steps[activeStep - 1].desc}
                </p>
                <div className="mt-2.5 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                  {steps[activeStep - 1].detail}
                </div>
              </div>
            )}
          </div>

          {/* Live LoRa Packet Inspector & Telemetry HUD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Terminal Packet View */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Terminal className="h-4 w-4 text-cyan-400" />
                  <span>LoRa RF Binary & JSON Payload Inspector</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                  P2P RX OK
                </span>
              </div>

              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Raw Byte Stream (LoRa Sub-GHz 915 MHz):
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 text-[11px] break-all select-all">
                    {rawHex}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                    Decoded Gateway Telemetry:
                  </div>
                  <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 text-[11px] overflow-x-auto">
{JSON.stringify(
  {
    station_id: station.id,
    station_name: station.name,
    echo_time_t_ms: station.currentEchoTimeMs,
    distance_s_cm: station.currentDistanceCm,
    water_level_h_cm: station.currentLevelCm,
    rate_of_rise_vh_cm_min: station.rateOfRiseCmPerMin,
    alert_status: station.alertLevel.toUpperCase(),
    buzzer_siren_trigger: station.buzzerActive,
    rf_metrics: {
      freq_mhz: station.loraFreqMhz,
      sf: `SF${station.spreadingFactor}`,
      rssi_dbm: station.rssi,
      snr_db: station.snr,
    },
    battery_v: (3.3 + (station.batteryPct / 100) * 0.9).toFixed(2),
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Radio Link Quality & Hardware Power HUD */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Parameter Fisik Link Radio & Perangkat Keras
                </h3>
                <span className="text-[10px] font-mono text-cyan-400">Node ID: {station.id}</span>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                {/* RSSI Meter */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Kekuatan Sinyal (RSSI):</span>
                    <span className="font-mono font-bold text-cyan-400 tabular-nums">
                      {station.rssi} dBm (Kuat)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(10, 100 - Math.abs(station.rssi + 40)))}%` }}
                    />
                  </div>
                </div>

                {/* SNR Meter */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">Signal-to-Noise Ratio (SNR):</span>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      +{station.snr} dB (Sangat Jernih)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(10, station.snr * 8))}%` }}
                    />
                  </div>
                </div>

                {/* Battery & Solar Status */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="h-5 w-5 text-emerald-400" />
                    <div>
                      <div className="font-medium text-white text-xs">Baterai LiFePO4 & Solar Panel</div>
                      <div className="text-[11px] text-slate-400">Pengisian Mandiri (Off-Grid)</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-emerald-400 tabular-nums">
                      {station.batteryPct}%
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {station.solarCharging ? 'Mengisi Daya PV' : 'Baterai Stabil'}
                    </div>
                  </div>
                </div>

                {/* Buzzer Siren Status */}
                <div
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    station.buzzerActive
                      ? 'bg-rose-950/50 border-rose-600/60 animate-pulse'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Volume2
                      className={`h-5 w-5 ${station.buzzerActive ? 'text-rose-400' : 'text-slate-400'}`}
                    />
                    <div>
                      <div className="font-medium text-white text-xs">Aktuator Sirine & Buzzer Lapangan</div>
                      <div className="text-[11px] text-slate-400">
                        Otomatis bunyi saat Siaga 1 / lonjakan air
                      </div>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      station.buzzerActive
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {station.buzzerActive ? 'ON (BUNYI)' : 'STANDBY'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
