import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// System prompt for Gemini AI flood intelligence
const FLOOD_SYSTEM_INSTRUCTION = `Anda adalah "AI Hydro-Sentinel", asisten pakar hidrologi dan mitigasi bencana banjir cerdas untuk sistem pemantauan berbasis IoT LoRa dan sensor ultrasonik 40 kHz.
Tugas Anda:
1. Menganalisis data telemetri real-time: ketinggian air (h), jarak sensor ke air (s), waktu pantul ultrasonik (t), laju kenaikan air (Vh = Δh/Δt), curah hujan, tingkat penyumbatan drainase, serta kondisi geografis cekungan rendah.
2. Memberikan evaluasi risiko bencana banjir secara akurat, objektif, dan terstruktur.
3. Memberikan rekomendasi operasional untuk petugas BPBD/relawan dan instruksi evakuasi mandiri yang aman dan tenang bagi warga sekitar.
4. Menjelaskan prinsip fisika akustik (s = v * t/2) dan keunggulan transmisi radio LoRa (Sub-GHz, off-grid) jika pengguna bertanya.
Gunakan Bahasa Indonesia yang ramah, profesional, mudah dipahami, dan tegas dalam situasi darurat. Format jawaban dengan poin-poin yang jelas.`;

// API Endpoint: Comprehensive AI Flood Risk Analysis
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { stationData, physicsData } = req.body;

    if (!stationData) {
      return res.status(400).json({ error: 'Data stasiun tidak ditemukan' });
    }

    const prompt = `Analisis kondisi banjir saat ini berdasarkan telemetri sensor LoRa terkini:
- Stasiun: ${stationData.name} (${stationData.locationType})
- Ketinggian Air (h): ${stationData.currentLevelCm} cm (Total Tiang H: ${stationData.poleHeightCm} cm)
- Ambang Batas: Waspada=${stationData.thresholds.waspada}cm, Siaga=${stationData.thresholds.siaga}cm, Awas=${stationData.thresholds.awas}cm, Tanggul Meluap=${stationData.thresholds.spillover}cm
- Jarak Sensor ke Air (s): ${stationData.currentDistanceCm} cm
- Waktu Pantul Ultrasonik (t): ${stationData.currentEchoTimeMs} ms
- Laju Kenaikan Air (Vh): ${stationData.rateOfRiseCmPerMin} cm/menit
- Status Siaga: ${stationData.alertLevel.toUpperCase()}
- Curah Hujan: ${stationData.rainfallIntensityMmHr} mm/jam
- Penyumbatan Saluran/Sampah: ${stationData.drainageBlockedPct}%
- Sinyal LoRa: RSSI ${stationData.rssi} dBm, SNR ${stationData.snr} dB
- Suhu Udara: ${physicsData?.airTemperatureC ?? 25}°C, Kecepatan Suara: ${physicsData?.soundVelocityMPerS ?? 343} m/s

Berikan:
1. Ringkasan Diagnostik Kondisi Air & Cekungan (1-2 kalimat padat)
2. Analisis Laju Kenaikan (Apakah ada ancaman Kenaikan Air Mendadak/Flash Surge?)
3. 3 Langkah Tindakan Prioritas (untuk BPBD & Warga)
4. Rekomendasi Mitigasi Saluran & Drainase`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: FLOOD_SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    const analysisText = response.text || 'Analisis berhasil dibuat.';
    return res.json({ analysis: analysisText });
  } catch (error: any) {
    console.error('Error generating AI flood analysis:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal menghasilkan analisis AI.',
    });
  }
});

// API Endpoint: Interactive AI Flood & LoRa Chat Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, conversationHistory, contextData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
    }

    let contextSnippet = '';
    if (contextData) {
      contextSnippet = `\n[KONTEKS SENSOR SAAT INI]:
Stasiun: ${contextData.name} (${contextData.locationType})
Tinggi Air: ${contextData.currentLevelCm} cm (${contextData.alertLevel.toUpperCase()})
Jarak Sensor: ${contextData.currentDistanceCm} cm | Waktu Pantul: ${contextData.currentEchoTimeMs} ms
Laju Kenaikan Vh: ${contextData.rateOfRiseCmPerMin} cm/min
Hujan: ${contextData.rainfallIntensityMmHr} mm/jam | Sumbatan: ${contextData.drainageBlockedPct}%
Sinyal LoRa: ${contextData.rssi} dBm
\n`;
    }

    const contents = [
      {
        role: 'user' as const,
        parts: [{ text: `${contextSnippet}Pertanyaan Pengguna: ${message}` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: FLOOD_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    return res.json({ reply: response.text || 'Maaf, tidak ada tanggapan dari sistem AI.' });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return res.status(500).json({
      error: error?.message || 'Gagal berkomunikasi dengan AI.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
