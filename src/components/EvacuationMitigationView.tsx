import React from 'react';
import { SensorStation } from '../types/flood';
import {
  ShieldAlert,
  MapPin,
  Clock,
  PhoneCall,
  CheckSquare,
  AlertTriangle,
  Send,
  BellRing,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';

interface EvacuationMitigationViewProps {
  station: SensorStation;
  onTriggerSimulatedSiren: () => void;
}

export const EvacuationMitigationView: React.FC<EvacuationMitigationViewProps> = ({
  station,
  onTriggerSimulatedSiren,
}) => {
  const currentH = station.currentLevelCm;
  const vh = station.rateOfRiseCmPerMin;
  const timeToSpill =
    vh > 0.1
      ? Math.max(1, Math.round((station.thresholds.spillover - currentH) / vh))
      : null;

  return (
    <div className="space-y-6">
      {/* Primary Alert Advisory Banner */}
      <div
        className={`rounded-xl border p-5 backdrop-blur-sm ${
          station.alertLevel === 'awas'
            ? 'bg-rose-950/70 border-rose-600/80 text-rose-200'
            : station.alertLevel === 'siaga'
            ? 'bg-amber-950/70 border-amber-600/80 text-amber-200'
            : station.alertLevel === 'waspada'
            ? 'bg-yellow-950/70 border-yellow-600/80 text-yellow-200'
            : 'bg-slate-900/60 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                station.alertLevel === 'awas'
                  ? 'bg-rose-600 text-white'
                  : station.alertLevel === 'siaga'
                  ? 'bg-amber-500 text-slate-950'
                  : station.alertLevel === 'waspada'
                  ? 'bg-yellow-500 text-slate-950'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-wider font-bold">
                  STATUS RESMI PERINGATAN DINI:
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 font-bold">
                  {station.alertLevel.toUpperCase()} ({station.currentLevelCm} cm)
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {station.alertLevel === 'awas'
                  ? 'PERINGATAN AWAS: Air Mencapai Ambang Kritis - Segera Evakuasi Mandiri!'
                  : station.alertLevel === 'siaga'
                  ? 'SIAGA 2: Ketinggian Air Meningkat Signifikan - Siapkan Barang Berharga'
                  : station.alertLevel === 'waspada'
                  ? 'WASPADA (SIAGA 3): Saluran Terisi Tinggi - Pantau Informasi Berkala'
                  : 'KONDISI NORMAL: Aliran Air Saluran Stabil'}
              </h2>
              <p className="text-xs text-slate-300/90 mt-1 max-w-3xl">
                Berdasarkan prinsip mitigasi: Titik sensor mendeteksi laju kenaikan air mendadak di cekungan rendah untuk memberikan waktu evakuasi yang cukup bagi warga sekitar.
              </p>
            </div>
          </div>

          {/* Time to Inundation Card */}
          <div className="rounded-xl bg-black/40 border border-white/10 p-3.5 min-w-[220px] text-center font-mono">
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Estimasi Waktu Menuju Luapan</span>
            </div>
            <div className="text-2xl font-bold mt-1 tabular-nums text-white">
              {timeToSpill !== null ? `${timeToSpill} Menit` : 'Aman / Stabil'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {timeToSpill !== null ? `Dengan laju ${vh} cm/menit` : 'Tidak ada tren kenaikan air'}
            </div>
          </div>
        </div>
      </div>

      {/* Two Pillars: Respons Cepat Warga & Evakuasi Mandiri Aman */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pillar 1: Respons Cepat Warga */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BellRing className="h-4 w-4 text-rose-400" />
              <span>Respons Cepat Warga (Tindakan Instan)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Protokol BNPB / BPBD</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="font-mono text-cyan-400 font-bold shrink-0">01.</span>
              <div>
                <strong className="text-slate-100">Dengarkan Peringatan Sirine LoRa:</strong>
                <p className="text-slate-400 mt-0.5">
                  Sirine lapangan 110 dB aktif otomatis saat status Awas atau laju air mendadak &gt; 15 cm/menit terdeteksi oleh ESP32.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="font-mono text-cyan-400 font-bold shrink-0">02.</span>
              <div>
                <strong className="text-slate-100">Matikan Sakelar Utama Listrik & Gas:</strong>
                <p className="text-slate-400 mt-0.5">
                  Putuskan MCB listrik rumah untuk mencegah bahaya sengatan arus dan potensi korsleting saat air mulai menggenang.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="font-mono text-cyan-400 font-bold shrink-0">03.</span>
              <div>
                <strong className="text-slate-100">Prioritaskan Kelompok Rentan:</strong>
                <p className="text-slate-400 mt-0.5">
                  Bantu lansia, ibu hamil, anak-anak, dan disabilitas menuju titik evakuasi lebih awal sebelum jalanan tergenang deras.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
              <span className="font-mono text-cyan-400 font-bold shrink-0">04.</span>
              <div>
                <strong className="text-slate-100">Bawa Tas Siaga Bencana (TSB):</strong>
                <p className="text-slate-400 mt-0.5">
                  Dokumen penting terbungkus plastik kedap air, pakaian ganti, senter, peluit, air minum, obat pribadi, dan HP.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onTriggerSimulatedSiren}
              className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-rose-600/30"
            >
              <BellRing className="h-4 w-4" />
              <span>Simulasikan Broadcast Alarm & Sirine Warga</span>
            </button>
          </div>
        </div>

        {/* Pillar 2: Evakuasi Mandiri Aman (Rute Topografi Tinggi) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Evakuasi Mandiri Aman (Topografi & Rute)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Peta Rute Darurat</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <LifeBuoy className="h-4 w-4" />
              <span>Titik Kumpul Evakuasi Terdekat:</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Posko 1: Balai Desa / Lapangan Bukit Atas</span>
                <span className="font-mono text-emerald-400 font-bold">+18 mdpl (450m)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Posko 2: Gedung Sekolah Tinggi Cekungan</span>
                <span className="font-mono text-emerald-400 font-bold">+22 mdpl (700m)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Posko 3: Puskesmas Siaga 24 Jam</span>
                <span className="font-mono text-cyan-400 font-bold">+15 mdpl (850m)</span>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4 text-cyan-400" />
              <span>Kontak Cepat Tanggap Darurat Bencana:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">BPBD Siaga:</span>
                <span className="font-bold text-white">112 / 117</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">SAR Nasional:</span>
                <span className="font-bold text-white">115</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Damkar & Air:</span>
                <span className="font-bold text-white">113</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Posko PMI:</span>
                <span className="font-bold text-white">021-7992325</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300">
            <strong>Catatan Lapangan:</strong> Jangan melintasi air yang mengalir lebih dari setinggi lutut saat evakuasi. Arus air sedalam 15 cm sudah mampu merobohkan orang dewasa dan menyeret kendaraan.
          </div>
        </div>
      </div>
    </div>
  );
};
