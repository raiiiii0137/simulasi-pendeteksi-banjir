import React, { useState } from 'react';
import { SensorStation, PhysicsParameters } from '../types/flood';
import { calculateEchoDistanceCm, calculateWaterLevelCm, calculateRateOfRise, calculateSpeedOfSound } from '../utils/physicsCalculations';
import { Calculator, ArrowRight, Gauge, AlertCircle, Thermometer, Radio } from 'lucide-react';

interface PhysicsFormulaCardProps {
  station: SensorStation;
  physics: PhysicsParameters;
  onUpdatePhysicsTemp: (tempC: number) => void;
}

export const PhysicsFormulaCard: React.FC<PhysicsFormulaCardProps> = ({
  station,
  physics,
  onUpdatePhysicsTemp,
}) => {
  // Local interactive playground states
  const [calcTemp, setCalcTemp] = useState<number>(physics.airTemperatureC);
  const [calcEchoMs, setCalcEchoMs] = useState<number>(station.currentEchoTimeMs);
  const [calcPoleH, setCalcPoleH] = useState<number>(station.poleHeightCm);
  const [calcDeltaH, setCalcDeltaH] = useState<number>(24);
  const [calcDeltaTMin, setCalcDeltaTMin] = useState<number>(5);

  const activeSoundSpeed = calculateSpeedOfSound(calcTemp);
  const calcDistanceS = calculateEchoDistanceCm(calcEchoMs, activeSoundSpeed);
  const calcLevelH = calculateWaterLevelCm(calcPoleH, calcDistanceS);
  const calcRateVh = calculateRateOfRise(calcDeltaH, calcDeltaTMin);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-cyan-400" />
              <span>Konsep Fisika dan Rumus Matematis Sistem</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Berdasarkan pemodelan mind map: Akustik Ultrasonik 40 kHz, Refleksi Pulsa Suara, Ketinggian Efektif, dan Laju Kenaikan Air per Waktu.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <Thermometer className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-slate-400">Suhu Udara (T):</span>
            <input
              type="number"
              min="0"
              max="50"
              value={calcTemp}
              onChange={(e) => {
                const val = Number(e.target.value);
                setCalcTemp(val);
                onUpdatePhysicsTemp(val);
              }}
              className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono font-bold text-amber-300 text-center"
            />
            <span className="text-xs font-mono text-slate-400">°C</span>
            <span className="text-xs text-slate-500">→</span>
            <span className="text-xs font-mono text-cyan-400 font-bold tabular-nums">
              v = {activeSoundSpeed} m/s
            </span>
          </div>
        </div>
      </div>

      {/* 3 Core Mathematical Pillars from Mind Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pillar 1: Perhitungan Jarak Sensor */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  RUMUS 01
                </span>
                <h3 className="font-semibold text-white text-sm">Perhitungan Jarak Sensor (s)</h3>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-center">
                <div className="text-slate-400 text-[11px] mb-1">Rumus Waktu Tempuh Akustik:</div>
                <div className="text-lg font-bold text-cyan-400">s = v × (t / 2)</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Transduser Ultrasonik 40 kHz (JSN-SR04T)
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Frekuensi Gelombang:</span>
                  <span className="font-mono text-slate-200">40 kHz</span>
                </div>
                <div className="flex justify-between">
                  <span>Kecepatan Suara di Udara (v):</span>
                  <span className="font-mono text-slate-200">{activeSoundSpeed} m/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu Bolak-Balik (Echo Time t):</span>
                  <span className="font-mono text-cyan-300 tabular-nums">{station.currentEchoTimeMs} ms</span>
                </div>
              </div>

              {/* Step by step calculation */}
              <div className="mt-3 p-2.5 rounded bg-slate-950 text-[11px] font-mono border border-slate-800 text-slate-300 space-y-1">
                <div className="text-slate-500">// Kalkulasi Aktif Sensor:</div>
                <div>
                  s = {activeSoundSpeed} m/s × ({station.currentEchoTimeMs} ms / 2000)
                </div>
                <div className="text-cyan-400 font-bold">
                  s = {station.currentDistanceCm} cm
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
            Faktor pembagi 2 disebabkan gelombang suara menempuh jarak dua arah (transduser ke air lalu kembali).
          </div>
        </div>

        {/* Pillar 2: Pengukuran Ketinggian Air */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  RUMUS 02
                </span>
                <h3 className="font-semibold text-white text-sm">Pengukuran Ketinggian Air (h)</h3>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-center">
                <div className="text-slate-400 text-[11px] mb-1">Rumus Ketinggian Saluran:</div>
                <div className="text-lg font-bold text-emerald-400">h = H - s</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Tinggi Efektif Muka Air Sungai / Cekungan
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Tinggi Total Tiang (H):</span>
                  <span className="font-mono text-slate-200">{station.poleHeightCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Jarak Sensor ke Air (s):</span>
                  <span className="font-mono text-slate-200 tabular-nums">{station.currentDistanceCm} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Tinggi Air Terhitung (h):</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    {station.currentLevelCm} cm
                  </span>
                </div>
              </div>

              {/* Step by step calculation */}
              <div className="mt-3 p-2.5 rounded bg-slate-950 text-[11px] font-mono border border-slate-800 text-slate-300 space-y-1">
                <div className="text-slate-500">// Evaluasi Status Ambang:</div>
                <div>
                  h = {station.poleHeightCm} cm - {station.currentDistanceCm} cm = {station.currentLevelCm} cm
                </div>
                <div className="text-emerald-400 font-bold">
                  Status: {station.alertLevel.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
            Jika jarak pantul s makin kecil, artinya air naik mendekati sensor dan tinggi air h bertambah.
          </div>
        </div>

        {/* Pillar 3: Kecepatan Arus & Laju Kenaikan Air */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/50">
                  RUMUS 03
                </span>
                <h3 className="font-semibold text-white text-sm">Kecepatan Arus / Laju Kenaikan (Vh)</h3>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-center">
                <div className="text-slate-400 text-[11px] mb-1">Rumus Laju Kenaikan Air:</div>
                <div className="text-lg font-bold text-amber-400">Vh = Δh / Δt</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Perubahan Tinggi per Satuan Waktu (cm/menit)
                </div>
              </div>

              <div className="space-y-1.5 pt-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Laju Kenaikan Saat Ini:</span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    {station.rateOfRiseCmPerMin > 0 ? `+${station.rateOfRiseCmPerMin}` : station.rateOfRiseCmPerMin} cm/min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deteksi Kenaikan Mendadak:</span>
                  <span
                    className={`font-mono font-semibold ${
                      station.rateOfRiseCmPerMin > 10 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {station.rateOfRiseCmPerMin > 10 ? 'BAHAYA SURGE!' : 'Stabil'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu Evakuasi Tersedia:</span>
                  <span className="font-mono text-slate-200">
                    {station.rateOfRiseCmPerMin > 0
                      ? `${Math.max(1, Math.round((station.thresholds.spillover - station.currentLevelCm) / Math.max(0.1, station.rateOfRiseCmPerMin)))} menit`
                      : 'Stabil / Tidak Meluap'}
                  </span>
                </div>
              </div>

              {/* Step by step calculation */}
              <div className="mt-3 p-2.5 rounded bg-slate-950 text-[11px] font-mono border border-slate-800 text-slate-300 space-y-1">
                <div className="text-slate-500">// Indikator Banjir Bandang:</div>
                <div>Vh &gt; 10 cm/min memicu peringatan flash flood otomatis ke warga cekungan rendah.</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
            Dihitung periodik oleh mikroprosesor ESP32 dengan filter moving average untuk meredam gelombang riak air.
          </div>
        </div>
      </div>

      {/* Interactive Physics Formula Simulator Playground */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Gauge className="h-4 w-4 text-cyan-400" />
          <span>Kalkulator & Simulator Interaktif Konsep Fisika</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Ubah nilai variabel fisik untuk melihat bagaimana algoritma ESP32 memproses data mentah ultrasonik menjadi ketinggian air real-time:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1">Waktu Pantul (t) dalam ms</label>
            <input
              type="range"
              min="1"
              max="25"
              step="0.1"
              value={calcEchoMs}
              onChange={(e) => setCalcEchoMs(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-slate-500">t:</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{calcEchoMs} ms</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1">Tinggi Tiang (H) dalam cm</label>
            <input
              type="range"
              min="200"
              max="600"
              step="10"
              value={calcPoleH}
              onChange={(e) => setCalcPoleH(Number(e.target.value))}
              className="w-full accent-emerald-400"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-slate-500">H:</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{calcPoleH} cm</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <label className="text-xs text-slate-400 block mb-1">Kenaikan Air (Δh) dlm 5 mnt</label>
            <input
              type="range"
              min="-20"
              max="50"
              step="1"
              value={calcDeltaH}
              onChange={(e) => setCalcDeltaH(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] text-slate-500">Δh:</span>
              <span className="text-xs font-mono font-bold text-amber-400">{calcDeltaH} cm</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 flex flex-col justify-center">
            <div className="text-[11px] text-cyan-300 font-medium">Hasil Perhitungan Real-Time:</div>
            <div className="mt-1 font-mono text-xs space-y-0.5">
              <div className="text-slate-300">
                s = <span className="text-cyan-400 font-bold">{calcDistanceS} cm</span>
              </div>
              <div className="text-slate-300">
                h = <span className="text-emerald-400 font-bold">{calcLevelH} cm</span>
              </div>
              <div className="text-slate-300">
                Vh = <span className="text-amber-400 font-bold">{calcRateVh} cm/min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
