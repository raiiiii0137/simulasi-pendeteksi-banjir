import React from 'react';
import { Radio, AlertTriangle, Volume2, VolumeX, ShieldAlert, Sparkles, Video, ClipboardCheck, Github } from 'lucide-react';
import { AlertLevel } from '../types/flood';

interface HeaderNavProps {
  activeTab: 'dashboard' | 'crossSection' | 'physics' | 'loraPipeline' | 'mitigation' | 'aiAssistant' | 'dayeuhkolotMap' | 'cctvMonitor' | 'performanceEval';
  setActiveTab: (tab: 'dashboard' | 'crossSection' | 'physics' | 'loraPipeline' | 'mitigation' | 'aiAssistant' | 'dayeuhkolotMap' | 'cctvMonitor' | 'performanceEval') => void;
  alertLevel: AlertLevel;
  isSirenPlaying: boolean;
  onToggleSiren: () => void;
  onOpenMindMap: () => void;
  onOpenGitHubModal: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  alertLevel,
  isSirenPlaying,
  onToggleSiren,
  onOpenMindMap,
  onOpenGitHubModal,
}) => {
  const getAlertColor = () => {
    switch (alertLevel) {
      case 'awas':
        return 'text-rose-400 bg-rose-950/60 border-rose-600/60 animate-pulse';
      case 'siaga':
        return 'text-amber-400 bg-amber-950/60 border-amber-600/60';
      case 'waspada':
        return 'text-yellow-300 bg-yellow-950/60 border-yellow-600/60';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-600/60';
    }
  };

  const getAlertLabel = () => {
    switch (alertLevel) {
      case 'awas':
        return 'AWAS (SIAGA 1)';
      case 'siaga':
        return 'SIAGA (SIAGA 2)';
      case 'waspada':
        return 'WASPADA (SIAGA 3)';
      default:
        return 'NORMAL (AMAN)';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/20">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">HYDRO-LORA</span>
              <span className="font-mono text-xs text-cyan-400">EWS</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Peringatan Dini Banjir Berbasis LoRa & Ultrasonik</p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean text with active state) */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pusat Pemantau
          </button>
          <button
            onClick={() => setActiveTab('crossSection')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'crossSection'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Saluran Sungai
          </button>
          <button
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'physics'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Konsep Fisika & Rumus
          </button>
          <button
            onClick={() => setActiveTab('loraPipeline')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'loraPipeline'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transmisi & Jarak LoRa
          </button>
          <button
            onClick={() => setActiveTab('mitigation')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'mitigation'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mitigasi & Evakuasi
          </button>
          <button
            onClick={() => setActiveTab('aiAssistant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'aiAssistant'
                ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-700/60'
                : 'text-cyan-400/90 hover:text-cyan-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Asisten</span>
          </button>
          <button
            onClick={() => setActiveTab('dayeuhkolotMap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'dayeuhkolotMap'
                ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-700/60'
                : 'text-rose-400/90 hover:text-rose-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Peta Dayeuhkolot</span>
          </button>
          <button
            onClick={() => setActiveTab('cctvMonitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'cctvMonitor'
                ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-700/60'
                : 'text-emerald-400/90 hover:text-emerald-200'
            }`}
          >
            <Video className="h-3.5 w-3.5 text-emerald-400" />
            <span>CCTV Pantau</span>
          </button>
          <button
            onClick={() => setActiveTab('performanceEval')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'performanceEval'
                ? 'bg-indigo-950 text-indigo-300 font-semibold border border-indigo-700/60'
                : 'text-indigo-400/90 hover:text-indigo-200'
            }`}
          >
            <ClipboardCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Pengujian & Evaluasi</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Status */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-semibold tracking-wide ${getAlertColor()}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  alertLevel === 'awas' ? 'bg-rose-400' : 'bg-cyan-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  alertLevel === 'awas'
                    ? 'bg-rose-500'
                    : alertLevel === 'siaga'
                    ? 'bg-amber-500'
                    : alertLevel === 'waspada'
                    ? 'bg-yellow-500'
                    : 'bg-emerald-500'
                }`}
              />
            </span>
            <span>{getAlertLabel()}</span>
          </div>

          {/* Emergency Siren Audio Button */}
          <button
            onClick={onToggleSiren}
            title={isSirenPlaying ? 'Matikan Sirine Darurat' : 'Uji Sirine Alarm Lapangan (Buzzer)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap ${
              isSirenPlaying
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isSirenPlaying ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="hidden sm:inline">Matikan Sirine</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Uji Sirine</span>
              </>
            )}
          </button>

          {/* Mind Map Reference Button */}
          <button
            onClick={onOpenMindMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 hover:bg-cyan-900 transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Bagan Mind Map</span>
          </button>

          {/* GitHub & Deploy Button */}
          <button
            onClick={onOpenGitHubModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-100 hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm shadow-slate-950/50"
            title="Panduan Lengkap Ekspor & Deploy ke GitHub Pages"
          >
            <Github className="h-3.5 w-3.5 text-white" />
            <span>GitHub Web</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Sub-bar */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/80 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Pemantau
        </button>
        <button
          onClick={() => setActiveTab('crossSection')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'crossSection' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Visual Sungai
        </button>
        <button
          onClick={() => setActiveTab('physics')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'physics' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Fisika & Rumus
        </button>
        <button
          onClick={() => setActiveTab('loraPipeline')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'loraPipeline' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Jarak LoRa
        </button>
        <button
          onClick={() => setActiveTab('mitigation')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'mitigation' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400'
          }`}
        >
          Mitigasi
        </button>
        <button
          onClick={() => setActiveTab('aiAssistant')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'aiAssistant' ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-800' : 'text-cyan-400'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>AI Asisten</span>
        </button>
        <button
          onClick={() => setActiveTab('dayeuhkolotMap')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'dayeuhkolotMap' ? 'bg-rose-950 text-rose-300 font-semibold border border-rose-800' : 'text-rose-400'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>Peta Dayeuhkolot</span>
        </button>
        <button
          onClick={() => setActiveTab('cctvMonitor')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'cctvMonitor' ? 'bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800' : 'text-emerald-400'
          }`}
        >
          <Video className="h-3 w-3" />
          <span>CCTV Pantau</span>
        </button>
        <button
          onClick={() => setActiveTab('performanceEval')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'performanceEval' ? 'bg-indigo-950 text-indigo-300 font-semibold border border-indigo-800' : 'text-indigo-400'
          }`}
        >
          <ClipboardCheck className="h-3 w-3" />
          <span>Pengujian</span>
        </button>
      </div>
    </header>
  );
};
