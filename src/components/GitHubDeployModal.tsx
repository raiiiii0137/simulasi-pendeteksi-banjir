import React, { useState } from 'react';
import { 
  Github, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  Globe, 
  Rocket, 
  FileText, 
  ShieldCheck, 
  X, 
  FolderGit2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('username-anda');
  const [repoName, setRepoName] = useState('citarum-flood-ews-lora');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const gitUrl = `https://github.com/${username}/${repoName}.git`;
  const pagesUrl = `https://${username}.github.io/${repoName}/`;

  const steps = [
    {
      title: '1. Inisialisasi Git Lokal',
      desc: 'Buka terminal di folder proyek ini dan buat repositori git baru',
      cmd: 'git init',
    },
    {
      title: '2. Tambahkan Semua File & Konfigurasi',
      desc: 'Termasuk workflow GitHub Actions (.github/workflows/deploy.yml) dan konfigurasi Vite',
      cmd: 'git add .',
    },
    {
      title: '3. Buat Commit Pertama',
      desc: 'Simpan snapshot kode dan aset sistem peringatan dini banjir',
      cmd: 'git commit -m "feat: inisialisasi Hydro-LoRa Flood Early Warning System Dayeuhkolot"',
    },
    {
      title: '4. Set Nama Branch Utama ke main',
      desc: 'Standar branch modern GitHub untuk CI/CD',
      cmd: 'git branch -M main',
    },
    {
      title: '5. Hubungkan ke Remote Repositori GitHub',
      desc: 'Pastikan Anda telah membuat repositori kosong di GitHub terlebih dahulu',
      cmd: `git remote add origin ${gitUrl}`,
    },
    {
      title: '6. Push Kode ke GitHub',
      desc: 'Unggah seluruh source code ke GitHub. Workflow deploy akan langsung jalan otomatis!',
      cmd: 'git push -u origin main',
    },
  ];

  const fullScript = `# Panduan Cepat Push ke GitHub
git init
git add .
git commit -m "feat: inisialisasi Hydro-LoRa Flood Early Warning System Dayeuhkolot"
git branch -M main
git remote add origin ${gitUrl}
git push -u origin main`;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullScript);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-white shadow-inner">
              <Github className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Panduan Publikasi Web ke GitHub & GitHub Pages</h2>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Langkah-langkah mengekspor, mengunggah ke GitHub, dan mengaktifkan hosting gratis GitHub Pages.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customization Inputs */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Kustomisasi Akun GitHub Anda</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username GitHub Anda</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value || 'username-anda')}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                placeholder="misal: ahmad-fauzi"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Repositori</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value || 'citarum-flood-ews-lora')}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                placeholder="misal: ews-banjir-dayeuhkolot"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-800/80 pt-2.5">
            <span className="flex items-center gap-1 font-mono text-cyan-300 truncate">
              <Globe className="h-3.5 w-3.5 text-cyan-400" /> Target URL: {pagesUrl}
            </span>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 px-3 py-1 text-xs font-semibold text-white transition-colors shadow-sm"
            >
              {copiedAll ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedAll ? 'Tersalin Semua!' : 'Salin Semua Perintah Sekaligus'}</span>
            </button>
          </div>
        </div>

        {/* Feature Readiness Badges */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-300">Vite Base Configured</div>
              <div className="text-[11px] text-slate-400">Path './' otomatis aman untuk subdirektori repo</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3">
            <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-indigo-300">GitHub Actions Ready</div>
              <div className="text-[11px] text-slate-400">Auto-deploy via .github/workflows/deploy.yml</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3">
            <div className="rounded-lg bg-cyan-500/20 p-2 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-cyan-300">README & License</div>
              <div className="text-[11px] text-slate-400">Dokumentasi teknis Bab IV & MIT License</div>
            </div>
          </div>
        </div>

        {/* Step by Step Terminal Commands */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyan-400" />
              <span>Perintah Terminal Langkah demi Langkah</span>
            </h3>
            <span className="text-xs text-slate-400">Klik tombol salin di tiap baris</span>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 transition-colors hover:border-slate-700">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] text-cyan-300 font-mono">
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">{step.desc}</span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 font-mono text-xs text-cyan-300 overflow-x-auto">
                  <span className="select-all break-all whitespace-pre-wrap">{step.cmd}</span>
                  <button
                    onClick={() => handleCopy(step.cmd, idx)}
                    className="flex-shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    title="Salin perintah"
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activating GitHub Pages in Repo Settings */}
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-2">
            <FolderGit2 className="h-4 w-4" />
            <span>Cara Mengaktifkan GitHub Pages di Website GitHub (Hanya 1 Kali):</span>
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
            <li>Buka halaman repositori Anda di browser: <span className="font-mono text-cyan-300">https://github.com/{username}/{repoName}</span></li>
            <li>Klik menu tab <strong className="text-white">Settings</strong> di bagian atas.</li>
            <li>Pilih sub-menu <strong className="text-white">Pages</strong> di bilah navigasi kiri.</li>
            <li>Di bagian <strong>Build and deployment &rarr; Source</strong>, pilih <span className="font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-600/40">GitHub Actions</span>.</li>
            <li>Selesai! File workflow <span className="font-mono text-slate-300">.github/workflows/deploy.yml</span> yang telah disertakan akan langsung mengompilasi dan menayangkan situs Anda secara otomatis.</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-4 gap-3">
          <div className="text-xs text-slate-400">
            File <span className="font-mono text-slate-300">README.md</span>, <span className="font-mono text-slate-300">LICENSE</span>, dan <span className="font-mono text-slate-300">deploy.yml</span> sudah lengkap.
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
