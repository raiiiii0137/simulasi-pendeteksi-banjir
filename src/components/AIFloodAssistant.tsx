import React, { useState, useEffect } from 'react';
import { SensorStation, PhysicsParameters } from '../types/flood';
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  RefreshCw,
  Volume2,
  VolumeX,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

interface AIFloodAssistantProps {
  station: SensorStation;
  physics: PhysicsParameters;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIFloodAssistant: React.FC<AIFloodAssistantProps> = ({
  station,
  physics,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analysis' | 'chat'>('analysis');

  // Analysis states
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Halo! Saya AI Hydro-Sentinel, asisten cerdas pemantau banjir berbasis LoRa & ultrasonik. Data terkini dari ${station.name}: Tinggi air ${station.currentLevelCm} cm (${station.alertLevel.toUpperCase()}), laju kenaikan ${station.rateOfRiseCmPerMin > 0 ? `+${station.rateOfRiseCmPerMin}` : station.rateOfRiseCmPerMin} cm/menit. Ada yang bisa saya bantu analisiskan?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Trigger automated AI analysis
  const fetchAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationData: station,
          physicsData: physics,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      setAnalysisText(data.analysis);
    } catch (err: any) {
      console.error('Failed to run AI analysis:', err);
      setAnalysisError(err.message || 'Gagal menghubungi layanan AI server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial analysis when component mounts or station changes
  useEffect(() => {
    if (!analysisText) {
      fetchAnalysis();
    }
  }, [station.id]);

  // Handle user chat submit
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          contextData: station,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal mendapatkan balasan dari AI server');
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Maaf, terjadi kendala koneksi ke model AI. Pastikan server backend sedang aktif.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Voice narration using Web Speech API (Indonesian)
  const toggleSpeechNarration = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const samplePrompts = [
    'Evaluasi risiko banjir cekungan berdasarkan data sensor sekarang',
    'Jelaskan rumus s = v * t/2 dan h = H - s pada sensor ultrasonik',
    'Mengapa teknologi LoRa penting untuk sistem peringatan dini banjir?',
    'Apa yang harus dilakukan warga jika status naik menjadi Awas (Siaga 1)?',
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AI Hydro-Sentinel (Kecerdasan Buatan)</h2>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                Gemini AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Analisis risiko hidrologi real-time & asisten tanya jawab pakar banjir berbasis data sensor LoRa
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('analysis')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'analysis'
                ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diagnostik Risiko AI
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeSubTab === 'chat'
                ? 'bg-slate-800 text-cyan-300 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Konsultasi Tanya Jawab AI
          </button>
        </div>
      </div>

      {/* Subtab 1: AI Comprehensive Analysis */}
      {activeSubTab === 'analysis' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold">Stasiun Dianalisis:</span>
              <span className="font-mono text-cyan-400 font-bold">{station.name}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Tinggi Air: {station.currentLevelCm} cm</span>
              <span className="text-slate-500">·</span>
              <span className="font-mono text-amber-400">{station.alertLevel.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2">
              {analysisText && (
                <button
                  onClick={() => toggleSpeechNarration(analysisText)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    isSpeaking
                      ? 'bg-rose-950 border-rose-600 text-rose-300'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
                  <span>{isSpeaking ? 'Hentikan Suara' : 'Dengarkan Narasi AI'}</span>
                </button>
              )}

              <button
                onClick={fetchAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-cyan-900/80 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-800 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
                )}
                <span>{isAnalyzing ? 'Menganalisis...' : 'Perbarui Analisis AI'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Result Box */}
          <div className="rounded-lg bg-slate-950/80 border border-slate-800 p-5">
            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                <p className="text-xs font-mono text-slate-400">
                  AI sedang memproses telemetri: gelombang suara 40 kHz, $h = H - s$, elevasi cekungan, dan laju kenaikan $V_h$...
                </p>
              </div>
            ) : analysisError ? (
              <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Gagal Memuat Analisis AI:</strong>
                  <p className="text-rose-300/90 mt-0.5">{analysisError}</p>
                  <button
                    onClick={fetchAnalysis}
                    className="mt-2 px-3 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white text-xs font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 space-y-3">
                {analysisText.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: AI Interactive Chat */}
      {activeSubTab === 'chat' && (
        <div className="space-y-4">
          {/* Chat Messages Container */}
          <div className="h-80 overflow-y-auto rounded-lg bg-slate-950 border border-slate-800 p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-600/50 text-cyan-400 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-bold text-[10px] text-cyan-200">
                      {msg.sender === 'user' ? 'Anda' : 'AI Hydro-Sentinel'}
                    </span>
                    <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                  </div>
                  <div>{msg.text}</div>
                </div>
              </div>
            ))}

            {isSendingChat && (
              <div className="flex gap-3 text-xs">
                <div className="h-7 w-7 rounded-lg bg-cyan-950 border border-cyan-600/50 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-xl px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                  <span>AI sedang mengetik jawaban...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isSendingChat}
                className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-950 border border-slate-800 hover:border-cyan-700/50 rounded-lg px-2.5 py-1 transition-all text-left disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Tanyakan analisis debit air, status siaga, rumus sensor, atau rute evakuasi..."
              className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSendingChat || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-cyan-600/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
