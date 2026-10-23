import React from 'react';
import { X, CheckCircle, ExternalLink, Network, FileText } from 'lucide-react';

interface MindMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'dashboard' | 'crossSection' | 'physics' | 'loraPipeline' | 'mitigation' | 'aiAssistant' | 'dayeuhkolotMap' | 'cctvMonitor' | 'performanceEval') => void;
}

export const MindMapModal: React.FC<MindMapModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const branches = [
    {
      title: '1. Analisis Permasalahan',
      items: [
        { label: 'Kondisi Geografis', details: ['Wilayah Cekungan Rendah', 'Titik Topografi Terendah'] },
        { label: 'Penyebab Utama', details: ['Intensitas Hujan Tinggi', 'Penyumbatan Saluran Air'] },
        { label: 'Dampak Bencana', details: ['Kenaikan Air Mendadak', 'Waktu Evakuasi Singkat', 'Kerugian Material Tinggi'] },
      ],
      tabTarget: 'dashboard' as const,
    },
    {
      title: '2. Komponen Perangkat Keras',
      items: [
        { label: 'Sensor Ultrasonik', details: ['JSN-SR04T Kedap Air (IP67)', 'Transduser Piezo 40 kHz'] },
        { label: 'Mikrokontroler & Modul LoRa', details: ['ESP32 Dual-Core Filter Data', 'Semtech SX1276/78 (915 MHz/433 MHz)'] },
        { label: 'Aktuator & Sumber Daya', details: ['Sirine Alarm & Buzzer Lapangan', 'Solar Panel PV + LiFePO4 Battery'] },
      ],
      tabTarget: 'crossSection' as const,
    },
    {
      title: '3. Konsep Fisika dan Rumus',
      items: [
        { label: 'Perhitungan Jarak Sensor', details: ['Frekuensi Suara 40 kHz', 'Kecepatan Suara 340 m/s', 'Rumus s = v dikali t/2'] },
        { label: 'Pengukuran Ketinggian Air', details: ['Rumus Ketinggian h = H kurangi s', 'Batas Kondisi Status (Aman, Waspada, Siaga, Awas)'] },
        { label: 'Kecepatan Arus / Laju Kenaikan', details: ['Perubahan Tinggi per Waktu', 'Rumus Vh = Delta h per Delta t'] },
      ],
      tabTarget: 'physics' as const,
    },
    {
      title: '4. Sistem Komunikasi Data',
      items: [
        { label: 'Keunggulan Teknologi LoRa', details: ['Komunikasi Jarak Jauh (Long Range)', 'Mandiri Tanpa Internet di Pos Lapangan', 'Frekuensi Radio Kuat Penetrasi Sinyal'] },
        { label: 'Alur Transmisi Sistem', details: ['Sensor Kirim Gelombang 40 kHz', 'ESP32 Proses Data & Filter Riak', 'LoRa Transmit ke Gateway RF', 'Aktivasi Alarm Buzzer Lapangan'] },
      ],
      tabTarget: 'loraPipeline' as const,
    },
    {
      title: '5. Luaran dan Mitigasi',
      items: [
        { label: 'Visualisasi Informasi', details: ['Grafik Waktu Nyata (Real-Time)', 'Pusat Pemantau Banjir Multi-Stasiun', 'Akses Aplikasi Ponsel / Peringatan Cepat'] },
        { label: 'Tujuan Evakuasi', details: ['Respons Cepat Warga Terhadap Kenaikan Air', 'Evakuasi Mandiri Aman ke Titik Topografi Tinggi'] },
      ],
      tabTarget: 'mitigation' as const,
    },
    {
      title: '6. Pengujian dan Evaluasi Kinerja',
      items: [
        { label: 'Validasi Sensor & LoRa', details: ['Kalibrasi Fluke 414D (MAE 0.84 cm)', 'PDR LoRa 96.8% pada Radius 3.0 km', 'Konsumsi Arus Deep Sleep 14.2 µA'] },
        { label: 'Evaluasi AI & Latensi', details: ['mAP@50 Sampah Sungai 92.4%', 'Latensi End-to-End Sirine 1.18 Detik', 'Format Naskah Bab IV Skripsi & CSV'] },
      ],
      tabTarget: 'performanceEval' as const,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-700/50 text-cyan-400">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Struktur Mind Map Sistem Peringatan Dini Banjir</h2>
              <p className="text-xs text-slate-400">
                Pemetaan lengkap konsep dari diagram NotebookLM ke dalam fitur aplikasi web hidro-telemetri
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mind Map Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {branches.map((b, idx) => (
            <div
              key={idx}
              className={`rounded-xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between ${
                idx === 4 ? 'md:col-span-2' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                  <h3 className="font-bold text-cyan-400 text-xs tracking-wide uppercase font-mono">
                    {b.title}
                  </h3>
                  <button
                    onClick={() => {
                      onNavigateTab(b.tabTarget);
                      onClose();
                    }}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Buka Panel</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {b.items.map((it, itemIdx) => (
                    <div key={itemIdx} className="text-xs">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{it.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1.5 pl-5">
                        {it.details.map((d, dIdx) => (
                          <span
                            key={dIdx}
                            className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
          >
            Tutup Bagan
          </button>
        </div>
      </div>
    </div>
  );
};
