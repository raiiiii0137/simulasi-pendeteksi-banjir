import React, { useState, useEffect, useRef } from 'react';
import { SensorStation, CCTVCamera, RiverTrashItem } from '../types/flood';
import { soundManager } from '../utils/audioSynth';
import {
  Video,
  Camera,
  Moon,
  Sun,
  Compass,
  ZoomIn,
  ZoomOut,
  CloudRain,
  ShieldAlert,
  Trash2,
  Sparkles,
  Waves,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CCTVMonitoringStationProps {
  station: SensorStation;
  onUpdateLevel: (newLevelCm: number) => void;
  onUpdateRainfall: (mmHr: number) => void;
  onUpdateBlockage?: (pct: number) => void;
}

const CAMERAS_INITIAL: CCTVCamera[] = [
  {
    id: 'CAM-01',
    name: 'CAM 01: Jembatan Citarum Dayeuhkolot',
    location: 'Jembatan Citarum Utama, Dayeuhkolot (-6.9838, 107.6255)',
    resolution: '1920x1080 (1080p 60FPS)',
    fps: 60,
    isOnline: true,
    nightVision: false,
    ptz: { pan: 0, tilt: -12, zoom: 1.0 },
    opticalWaterlineCm: 165,
    aiDetectionConfidence: 0.96,
    description: 'Menyorot langsung tiang sensor LoRa, pilar jembatan, dan titik akumulasi sampah Citarum.',
    trashStatus: 'Sumbatan Parah',
    trashCount: 24,
  },
  {
    id: 'CAM-02',
    name: 'CAM 02: Gang Cekungan Bojong Asih RW 04',
    location: 'Bojong Asih RT 02/RW 04, Dayeuhkolot (-6.9885, 107.6225)',
    resolution: '1920x1080 (1080p 30FPS)',
    fps: 30,
    isOnline: true,
    nightVision: false,
    ptz: { pan: 15, tilt: -20, zoom: 1.2 },
    opticalWaterlineCm: 45,
    aiDetectionConfidence: 0.92,
    description: 'Titik cekungan terendah permukiman. Memantau limpasan air dan sedimen/sampah drainase warga.',
    trashStatus: 'Tercemar',
    trashCount: 14,
  },
  {
    id: 'CAM-03',
    name: 'CAM 03: Kolam Retensi Cieunteung & Inlet',
    location: 'Kolam Retensi Cieunteung, Dayeuhkolot (-6.9925, 107.6185)',
    resolution: '1920x1080 (1080p 30FPS)',
    fps: 30,
    isOnline: true,
    nightVision: false,
    ptz: { pan: -30, tilt: -15, zoom: 1.0 },
    opticalWaterlineCm: 120,
    aiDetectionConfidence: 0.94,
    description: 'Memantau kapasitas kolam polder dan trash-boom terapung pencegah sampah masuk pompa.',
    trashStatus: 'Ringan',
    trashCount: 6,
  },
  {
    id: 'CAM-04',
    name: 'CAM 04: Polder Andir & Pintu Air Barat',
    location: 'Saluran Pembuang Polder Andir (-6.9800, 107.6120)',
    resolution: '1920x1080 (1080p 30FPS)',
    fps: 30,
    isOnline: true,
    nightVision: false,
    ptz: { pan: 0, tilt: -10, zoom: 1.0 },
    opticalWaterlineCm: 85,
    aiDetectionConfidence: 0.89,
    description: 'Memantau akumulasi sampah plastik pada saringan hidrolik dan kelancaran debit pembuang.',
    trashStatus: 'Tercemar',
    trashCount: 18,
  },
];

// Initial procedural trash templates
const INITIAL_TRASH_TEMPLATES: Omit<RiverTrashItem, 'id' | 'x'>[] = [
  { type: 'plastic_bag', name: 'Kantong Kresek Merah', category: 'Plastik Anorganik', yOffset: 2, width: 26, height: 18, speed: 0.9, rotation: 0.2, color: '#ef4444', confidence: 0.94 },
  { type: 'bottle', name: 'Botol Plastik PET', category: 'Plastik Anorganik', yOffset: 6, width: 22, height: 10, speed: 1.2, rotation: -0.15, color: '#38bdf8', confidence: 0.92 },
  { type: 'styrofoam', name: 'Kotak Styrofoam Makanan', category: 'Plastik Anorganik', yOffset: -2, width: 28, height: 16, speed: 1.0, rotation: 0.05, color: '#f8fafc', confidence: 0.95 },
  { type: 'wood_log', name: 'Batang & Ranting Kayu', category: 'Limbah Organik', yOffset: 8, width: 44, height: 12, speed: 0.7, rotation: 0.35, color: '#854d0e', confidence: 0.89 },
  { type: 'plastic_bag', name: 'Kantong Plastik Hitam', category: 'Plastik Anorganik', yOffset: 4, width: 24, height: 16, speed: 0.85, rotation: -0.3, color: '#334155', confidence: 0.91 },
  { type: 'tire', name: 'Ban Bekas Hanyut', category: 'Limbah Padat / Sedimen', yOffset: 12, width: 32, height: 20, speed: 0.65, rotation: 0.1, color: '#1e293b', confidence: 0.96 },
  { type: 'bottle', name: 'Botol Minuman Hijau', category: 'Plastik Anorganik', yOffset: 7, width: 20, height: 9, speed: 1.3, rotation: 0.4, color: '#22c55e', confidence: 0.93 },
  { type: 'plastic_bag', name: 'Kantong Kresek Kuning', category: 'Plastik Anorganik', yOffset: 3, width: 25, height: 17, speed: 1.05, rotation: -0.25, color: '#eab308', confidence: 0.90 },
  { type: 'styrofoam', name: 'Pecahan Gabus Styrofoam', category: 'Plastik Anorganik', yOffset: 0, width: 20, height: 12, speed: 1.15, rotation: 0.18, color: '#fef08a', confidence: 0.88 },
  { type: 'wood_log', name: 'Dahan Bambu Citarum', category: 'Limbah Organik', yOffset: 9, width: 50, height: 10, speed: 0.75, rotation: -0.12, color: '#a16207', confidence: 0.92 },
  { type: 'bottle', name: 'Gelas Air Mineral Plastik', category: 'Plastik Anorganik', yOffset: 5, width: 16, height: 12, speed: 1.25, rotation: 0.5, color: '#cbd5e1', confidence: 0.89 },
  { type: 'plastic_bag', name: 'Karung Plastik Limbah', category: 'Plastik Anorganik', yOffset: 8, width: 36, height: 22, speed: 0.6, rotation: 0.08, color: '#64748b', confidence: 0.94 },
];

export const CCTVMonitoringStation: React.FC<CCTVMonitoringStationProps> = ({
  station,
  onUpdateLevel,
  onUpdateRainfall,
  onUpdateBlockage,
}) => {
  const [cameras, setCameras] = useState<CCTVCamera[]>(CAMERAS_INITIAL);
  const [selectedCamId, setSelectedCamId] = useState<string>('CAM-01');
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [showAiWaterline, setShowAiWaterline] = useState<boolean>(true);
  const [showAiTrashBoxes, setShowAiTrashBoxes] = useState<boolean>(true);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [cleaningStatus, setCleaningStatus] = useState<string | null>(null);

  const activeCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];
  const waterLevel = station.currentLevelCm;
  const rainIntensity = station.rainfallIntensityMmHr;
  const drainageBlockage = station.drainageBlockedPct;

  // Real-time canvas render loop & procedural trash tracking
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const waveOffsetRef = useRef<number>(0);

  // Trash particles simulation state in ref for 60fps canvas loop
  const trashItemsRef = useRef<RiverTrashItem[]>([]);
  const [detectedTrashCount, setDetectedTrashCount] = useState<number>(0);

  // Initialize or reseed trash items based on blockage percentage
  useEffect(() => {
    // Generate active trash count based on blockage percentage
    // 0% -> 2 items, 50% -> 12 items, 100% -> 24 items
    const targetCount = Math.max(1, Math.round(2 + (drainageBlockage / 100) * 22));

    const newItems: RiverTrashItem[] = [];
    for (let i = 0; i < targetCount; i++) {
      const template = INITIAL_TRASH_TEMPLATES[i % INITIAL_TRASH_TEMPLATES.length];
      const spacing = 960 / targetCount;
      newItems.push({
        id: `trash-${i}-${Date.now()}`,
        ...template,
        x: (i * spacing + Math.random() * 40) % 960,
        yOffset: template.yOffset + (Math.random() - 0.5) * 8,
        speed: template.speed * (0.8 + Math.random() * 0.4),
        rotation: template.rotation + (Math.random() - 0.5) * 0.3,
        confidence: Number((0.87 + Math.random() * 0.11).toFixed(2)),
        isTrappedAtPier: false,
      });
    }

    trashItemsRef.current = newItems;
    setDetectedTrashCount(newItems.length);
  }, [drainageBlockage]);

  // Take photo snapshot
  const handleTakeSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `CCTV-Dayeuhkolot-${activeCam.id}-${Date.now()}.png`;
    a.click();
    soundManager.playPingChirp();
    setSnapshotToast(`Foto snapshot ${activeCam.id} berhasil diunduh dengan deteksi AI!`);
    setTimeout(() => setSnapshotToast(null), 3500);
  };

  // PTZ adjustments
  const handlePtzAdjust = (axis: 'pan' | 'tilt' | 'zoom', delta: number) => {
    setCameras((prev) =>
      prev.map((c) => {
        if (c.id === selectedCamId) {
          const newPtz = { ...c.ptz };
          if (axis === 'pan') newPtz.pan = Math.max(-90, Math.min(90, newPtz.pan + delta));
          if (axis === 'tilt') newPtz.tilt = Math.max(-45, Math.min(45, newPtz.tilt + delta));
          if (axis === 'zoom') newPtz.zoom = Math.max(1.0, Math.min(3.5, Number((newPtz.zoom + delta).toFixed(1))));
          return { ...c, ptz: newPtz };
        }
        return c;
      })
    );
  };

  // Deploy Satgas Citarum Harum cleanup operation
  const handleDeployCleanUp = () => {
    soundManager.playPingChirp();
    setCleaningStatus('🚜 Satgas Citarum Harum & Alat Berat BBWS dikerahkan mengangkat tumpukan sampah...');
    
    // Animate cleanup and reset blockage to 5%
    setTimeout(() => {
      if (onUpdateBlockage) {
        onUpdateBlockage(5);
      }
      soundManager.playBuzzerBeep();
      setCleaningStatus('✅ Pembersihan selesai! Saluran & kolong jembatan kembali lancar (Aliran air normal).');
      setTimeout(() => setCleaningStatus(null), 4000);
    }, 1200);
  };

  // Inject trash wave simulation
  const handleInjectTrashSurge = () => {
    soundManager.playPingChirp();
    setCleaningStatus('⚠️ Gelombang sampah hanyut dari Hulu Citarum terdeteksi di CCTV!');
    if (onUpdateBlockage) {
      onUpdateBlockage(Math.min(95, drainageBlockage + 40));
    }
    setTimeout(() => setCleaningStatus(null), 3500);
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      waveOffsetRef.current += 0.04;

      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Save for PTZ transformations (zoom & pan/tilt shift)
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(activeCam.ptz.zoom, activeCam.ptz.zoom);
      ctx.translate(
        -width / 2 + activeCam.ptz.pan * 2,
        -height / 2 + activeCam.ptz.tilt * 2
      );

      // Background Scene (Riverbank, Bridge Pier, Sky)
      if (isNightMode) {
        // Night IR illumination (Greenish night vision)
        ctx.fillStyle = '#05180f';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Daytime or Overcast rainy sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
        if (rainIntensity > 30) {
          skyGrad.addColorStop(0, '#1e293b');
          skyGrad.addColorStop(1, '#334155');
        } else {
          skyGrad.addColorStop(0, '#38bdf8');
          skyGrad.addColorStop(1, '#94a3b8');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Distant mountains / Bandung basin hills
      ctx.fillStyle = isNightMode ? '#0a2a1a' : '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width * 0.25, height * 0.35);
      ctx.lineTo(width * 0.55, height * 0.42);
      ctx.lineTo(width * 0.85, height * 0.32);
      ctx.lineTo(width, height * 0.45);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Concrete Bridge Structure / Dayeuhkolot Embankment
      ctx.fillStyle = isNightMode ? '#123824' : '#475569';
      ctx.fillRect(width * 0.65, height * 0.1, width * 0.35, height * 0.85);

      // Bridge Girder Span across top
      ctx.fillStyle = isNightMode ? '#0d281a' : '#334155';
      ctx.fillRect(0, height * 0.15, width, height * 0.12);

      // Embankment sloped retaining wall (Tanggul Cekungan)
      ctx.fillStyle = isNightMode ? '#14402a' : '#334155';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.4);
      ctx.lineTo(width * 0.4, height * 0.85);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Peilschaal Water Gauge Ruler on Bridge Pier
      const rulerX = width * 0.68;
      const rulerYTop = height * 0.25;
      const rulerHeight = height * 0.65;
      const rulerWidth = 36;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(rulerX, rulerYTop, rulerWidth, rulerHeight);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rulerX, rulerYTop, rulerWidth, rulerHeight);

      // Peilschaal Marks (0 to 400 cm)
      ctx.fillStyle = '#0f172a';
      ctx.font = '9px monospace';
      for (let mark = 0; mark <= 400; mark += 20) {
        const markY = rulerYTop + rulerHeight - (mark / 400) * rulerHeight;
        ctx.beginPath();
        ctx.moveTo(rulerX, markY);
        ctx.lineTo(rulerX + (mark % 100 === 0 ? 20 : 10), markY);
        ctx.stroke();

        if (mark % 100 === 0) {
          ctx.fillText(`${mark}`, rulerX + 22, markY + 3);
        }
      }

      // Calculate Water Surface Y based on station water level (0 to 400 cm)
      const waterHeightRatio = Math.max(0.05, Math.min(0.95, waterLevel / 400));
      const waterY = rulerYTop + rulerHeight - waterHeightRatio * rulerHeight;

      // Draw Dynamic Water Waves
      const waterGrad = ctx.createLinearGradient(0, waterY, 0, height);
      if (isNightMode) {
        waterGrad.addColorStop(0, '#064e3b');
        waterGrad.addColorStop(1, '#022c22');
      } else {
        if (waterLevel >= 300) {
          // Turbid muddy floodwater with silt
          waterGrad.addColorStop(0, '#854d0e');
          waterGrad.addColorStop(1, '#713f12');
        } else if (drainageBlockage > 60) {
          // Darker murky water polluted by debris
          waterGrad.addColorStop(0, '#334155');
          waterGrad.addColorStop(1, '#1e293b');
        } else {
          waterGrad.addColorStop(0, '#0284c7');
          waterGrad.addColorStop(1, '#0f172a');
        }
      }

      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, waterY);

      // Sine wave surface
      for (let x = 0; x <= width; x += 15) {
        const wave = Math.sin(x * 0.02 + waveOffsetRef.current) * 4;
        ctx.lineTo(x, waterY + wave);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Water Ripple Highlights
      ctx.strokeStyle = isNightMode ? '#34d399' : '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 15) {
        const wave = Math.sin(x * 0.02 + waveOffsetRef.current) * 4;
        if (x === 0) ctx.moveTo(x, waterY + wave);
        else ctx.lineTo(x, waterY + wave);
      }
      ctx.stroke();

      // ==========================================================
      // DRAW FLOATING RIVER TRASH / SAMPAH SUNGAI CITARUM
      // ==========================================================
      const currentTrashList = trashItemsRef.current;
      const pierCollisionX = rulerX - 10;

      currentTrashList.forEach((item) => {
        // Move trash with river current towards the pier
        if (!item.isTrappedAtPier) {
          item.x += item.speed;

          // Check if item gets trapped against bridge pier when blockage > 30%
          if (drainageBlockage > 30 && item.x >= pierCollisionX - 35 && item.x <= pierCollisionX) {
            item.isTrappedAtPier = true;
          }

          // Wrap around if passes right screen boundary
          if (item.x > width + 50) {
            item.x = -40;
            item.isTrappedAtPier = false;
          }
        }

        // Compute vertical bobbing with wave height
        const waveAtX = Math.sin(item.x * 0.02 + waveOffsetRef.current) * 4;
        const currentItemY = waterY + waveAtX + item.yOffset;

        ctx.save();
        ctx.translate(item.x, currentItemY);
        ctx.rotate(item.rotation + Math.sin(waveOffsetRef.current * 0.5) * 0.1);

        // Draw individual trash object geometry
        if (item.type === 'plastic_bag') {
          // Crinkled Plastic Bag (Kantong Kresek)
          ctx.fillStyle = isNightMode ? 'rgba(52, 211, 153, 0.75)' : item.color;
          ctx.beginPath();
          ctx.moveTo(-item.width / 2, -item.height / 3);
          ctx.quadraticCurveTo(-item.width / 4, -item.height, 0, -item.height / 2);
          ctx.quadraticCurveTo(item.width / 4, -item.height, item.width / 2, -item.height / 3);
          ctx.quadraticCurveTo(item.width / 2 + 3, item.height / 2, item.width / 4, item.height / 2);
          ctx.quadraticCurveTo(0, item.height / 2 + 4, -item.width / 4, item.height / 2);
          ctx.closePath();
          ctx.fill();

          // Bag handles / tie knot
          ctx.strokeStyle = isNightMode ? '#10b981' : '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else if (item.type === 'bottle') {
          // PET Plastic Bottle with Cap
          ctx.fillStyle = isNightMode ? 'rgba(16, 185, 129, 0.65)' : item.color;
          ctx.fillRect(-item.width / 2, -item.height / 2, item.width * 0.7, item.height);

          // Bottle neck & cap
          ctx.fillStyle = isNightMode ? '#34d399' : '#0284c7';
          ctx.fillRect(item.width * 0.2, -item.height * 0.3, item.width * 0.25, item.height * 0.6);
          ctx.fillStyle = '#dc2626'; // Red Cap
          ctx.fillRect(item.width * 0.45, -item.height * 0.35, item.width * 0.1, item.height * 0.7);

          // Specular plastic highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(-item.width / 2 + 2, -item.height / 2 + 1, item.width * 0.6, 2);
        } else if (item.type === 'styrofoam') {
          // Styrofoam block / food box
          ctx.fillStyle = isNightMode ? '#a7f3d0' : '#f8fafc';
          ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);

          // Foam pores texture
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-item.width / 3, -item.height / 4, 3, 3);
          ctx.fillRect(item.width / 5, item.height / 5, 2, 2);
        } else if (item.type === 'wood_log') {
          // Wooden branch / driftwood
          ctx.fillStyle = isNightMode ? '#064e3b' : '#78350f';
          ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);

          // Small branch offshoot
          ctx.beginPath();
          ctx.moveTo(-item.width / 5, -item.height / 2);
          ctx.lineTo(-item.width / 8, -item.height - 4);
          ctx.lineWidth = 3;
          ctx.strokeStyle = isNightMode ? '#064e3b' : '#78350f';
          ctx.stroke();
        } else if (item.type === 'tire') {
          // Rubber Tire
          ctx.fillStyle = isNightMode ? '#022c22' : '#0f172a';
          ctx.beginPath();
          ctx.ellipse(0, 0, item.width / 2, item.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rim hole
          ctx.fillStyle = isNightMode ? '#064e3b' : '#334155';
          ctx.beginPath();
          ctx.ellipse(0, 0, item.width / 4, item.height / 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // AI Computer Vision Bounding Box for Trash Item
        if (showAiTrashBoxes) {
          ctx.strokeStyle = '#f59e0b'; // Amber / Orange for Trash detection
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);

          const boxPad = 5;
          const boxX = item.x - item.width / 2 - boxPad;
          const boxY = currentItemY - item.height / 2 - boxPad;
          const boxW = item.width + boxPad * 2;
          const boxH = item.height + boxPad * 2;

          ctx.strokeRect(boxX, boxY, boxW, boxH);
          ctx.setLineDash([]);

          // AI Tag Pill
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          const labelText = `AI: ${item.name} (${Math.round(item.confidence * 100)}%)`;
          ctx.font = 'bold 8.5px monospace';
          const labelWidth = ctx.measureText(labelText).width + 8;
          ctx.fillRect(boxX, boxY - 14, labelWidth, 13);

          ctx.fillStyle = '#fbbf24'; // Warm yellow text
          ctx.fillText(labelText, boxX + 4, boxY - 4);
        }
      });

      // ==========================================================
      // MASSIVE ACCUMULATED TRASH PILE AT BRIDGE PIER (TIMBUNAN MASIF)
      // ==========================================================
      if (drainageBlockage >= 25) {
        const pileWidth = Math.min(130, 40 + (drainageBlockage / 100) * 90);
        const pileHeight = Math.min(75, 20 + (drainageBlockage / 100) * 55);
        const pileX = rulerX - pileWidth + 12;
        const pileY = waterY - pileHeight * 0.45;

        // Trash Clump Background Mat
        ctx.fillStyle = isNightMode ? '#064e3b' : '#451a03';
        ctx.beginPath();
        ctx.ellipse(pileX + pileWidth / 2, pileY + pileHeight / 2, pileWidth / 2, pileHeight / 2, -0.05, 0, Math.PI * 2);
        ctx.fill();

        // Scattered trash textures inside the pier pile
        const clumpColors = isNightMode
          ? ['#10b981', '#34d399', '#059669', '#047857']
          : ['#ef4444', '#f8fafc', '#38bdf8', '#eab308', '#78350f', '#0f172a', '#64748b'];

        for (let i = 0; i < Math.floor(drainageBlockage / 4); i++) {
          const cx = pileX + 10 + ((i * 19) % (pileWidth - 20));
          const cy = pileY + 6 + ((i * 13) % (pileHeight - 12));
          ctx.fillStyle = clumpColors[i % clumpColors.length];
          ctx.beginPath();
          ctx.arc(cx, cy, 3 + (i % 4), 0, Math.PI * 2);
          ctx.fill();
        }

        // Foam & Eddies around the blockage
        ctx.strokeStyle = isNightMode ? 'rgba(52, 211, 153, 0.6)' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pileX - 6, pileY + pileHeight / 2, 8, 0, Math.PI);
        ctx.stroke();

        // AI Bounding Box for Massive Pile
        if (showAiTrashBoxes) {
          ctx.strokeStyle = '#ef4444'; // Red alert for massive blockage
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 2]);
          ctx.strokeRect(pileX - 5, pileY - 5, pileWidth + 10, pileHeight + 10);
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
          const pileText = `AI: TIMBUNAN SUMBATAN MASIF (${drainageBlockage}%)`;
          ctx.font = 'bold 9.5px monospace';
          const pw = ctx.measureText(pileText).width + 10;
          ctx.fillRect(pileX - 5, pileY - 20, pw, 16);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(pileText, pileX, pileY - 8);
        }
      }

      // Rain Streaks & Ripples if raining
      if (rainIntensity > 5) {
        ctx.strokeStyle = isNightMode ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1;
        const dropsCount = Math.min(180, Math.round(rainIntensity * 1.5));
        for (let i = 0; i < dropsCount; i++) {
          const rx = (Math.sin(i * 99 + waveOffsetRef.current * 10) * 0.5 + 0.5) * width;
          const ry = ((i * 17 + waveOffsetRef.current * 40) % height);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 12);
          ctx.stroke();
        }
      }

      // AI Computer Vision Bounding Box on Water Line
      if (showAiWaterline) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        const boxX = rulerX - 25;
        const boxY = waterY - 20;
        const boxW = rulerWidth + 50;
        const boxH = 40;

        ctx.strokeRect(boxX, boxY, boxW, boxH);
        ctx.setLineDash([]);

        // AI Label Pill
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(boxX, boxY - 20, 160, 18);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`AI WATERLINE: ${waterLevel.toFixed(1)} cm`, boxX + 6, boxY - 7);
      }

      ctx.restore();

      // Overlay Scanlines & Noise in Night Mode
      if (isNightMode) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      // On-Screen Display (OSD) Telemetry HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, width - 20, 26);

      // LIVE REC dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(24, 23, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('REC ● LIVE', 34, 26);

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour12: false });
      ctx.fillText(`CCTV: ${activeCam.id} · ${timeStr}`, 130, 26);

      // Debris indicator on OSD
      if (drainageBlockage > 50) {
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`⚠️ SUMBATAN SAMPAH: ${drainageBlockage}%`, 330, 26);
      } else if (drainageBlockage > 20) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`SAMPAH: ${drainageBlockage}% (${currentTrashList.length} OBJ)`, 330, 26);
      } else {
        ctx.fillStyle = '#10b981';
        ctx.fillText(`SAMPAH: MINIMAL (${currentTrashList.length} OBJ)`, 330, 26);
      }

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`PTZ: P${activeCam.ptz.pan}° T${activeCam.ptz.tilt}° Z${activeCam.ptz.zoom}x`, width - 310, 26);

      // Night Vision Badge on OSD
      if (isNightMode) {
        ctx.fillStyle = '#10b981';
        ctx.fillText('IR [ON]', width - 85, 26);
      }

      // Crosshair Target in center of camera
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 16, height / 2);
      ctx.lineTo(width / 2 + 16, height / 2);
      ctx.moveTo(width / 2, height / 2 - 16);
      ctx.lineTo(width / 2, height / 2 + 16);
      ctx.stroke();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [activeCam, isNightMode, showAiWaterline, showAiTrashBoxes, waterLevel, rainIntensity, drainageBlockage]);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/20">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Stasiun CCTV Pantau Banjir & Sampah Sungai Dayeuhkolot</h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  LIVE 4 CHANNELS
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold">
                  AI DEBRIS DETECTOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pengawasan visual Sungai Citarum, deteksi sampah hanyut, sumbatan jembatan, dan korelasi kenaikan air
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isNightMode
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-sm shadow-emerald-950'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isNightMode ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
              <span>{isNightMode ? 'Inframerah IR (Malam)' : 'Mode Siang (Day)'}</span>
            </button>

            <button
              onClick={handleTakeSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm shadow-cyan-600/30"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Ambil Snapshot</span>
            </button>
          </div>
        </div>
      </div>

      {snapshotToast && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between animate-fade-in font-mono">
          <span>✓ {snapshotToast}</span>
          <span className="text-[10px] text-emerald-400">Tersimpan di folder Unduhan</span>
        </div>
      )}

      {cleaningStatus && (
        <div className="p-3.5 rounded-lg bg-cyan-950/90 border border-cyan-500/80 text-cyan-200 text-xs flex items-center justify-between animate-fade-in shadow-lg shadow-cyan-950">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
            <span className="font-semibold">{cleaningStatus}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-300">BBWS CITARUM</span>
        </div>
      )}

      {/* Main CCTV Feed Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left: Video Canvas (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
            {/* HTML5 Canvas Stream */}
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              className="w-full h-auto block select-none bg-slate-950"
            />

            {/* Quick Overlay Floating Controls */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-slate-950/85 border border-slate-800/80 p-1.5 rounded-lg backdrop-blur-md">
              <button
                onClick={() => handlePtzAdjust('zoom', 0.2)}
                title="Zoom In"
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePtzAdjust('zoom', -0.2)}
                title="Zoom Out"
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-mono text-cyan-400 px-1 font-bold">
                {activeCam.ptz.zoom}x
              </span>

              {/* Waterline Box Toggle */}
              <button
                onClick={() => setShowAiWaterline(!showAiWaterline)}
                title="Toggle AI Waterline Bounding Box"
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  showAiWaterline
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-900 text-slate-500'
                }`}
              >
                AI MUKA AIR
              </button>

              {/* Trash AI Detection Toggle */}
              <button
                onClick={() => setShowAiTrashBoxes(!showAiTrashBoxes)}
                title="Toggle AI River Trash Bounding Boxes"
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  showAiTrashBoxes
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-slate-900 text-slate-500'
                }`}
              >
                <Trash2 className="h-3 w-3" />
                <span>AI SAMPAH</span>
              </button>
            </div>
          </div>

          {/* PTZ Joystick & Directional Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Kendali Sudut Kamera (PTZ Pan/Tilt):</span>
              </span>
              <button
                onClick={() => handlePtzAdjust('pan', -10)}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                ◀ Kiri (-10°)
              </button>
              <button
                onClick={() => handlePtzAdjust('pan', 10)}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                Kanan (+10°) ▶
              </button>
              <button
                onClick={() => handlePtzAdjust('tilt', -5)}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                ▲ Atas
              </button>
              <button
                onClick={() => handlePtzAdjust('tilt', 5)}
                className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                ▼ Bawah
              </button>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span>Posisi Pan: <strong className="text-white">{activeCam.ptz.pan}°</strong></span>
              <span>·</span>
              <span>Tilt: <strong className="text-white">{activeCam.ptz.tilt}°</strong></span>
              <span>·</span>
              <span>Muka Air: <strong className="text-emerald-400">{waterLevel.toFixed(1)} cm</strong></span>
              <span>·</span>
              <span>Sampah: <strong className={drainageBlockage > 50 ? 'text-rose-400' : 'text-amber-400'}>{drainageBlockage}%</strong></span>
            </div>
          </div>

          {/* Dedicated River Trash Detection & Mitigation Action Section */}
          <div className="rounded-xl border border-amber-900/40 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 p-4 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-600/50 text-amber-400">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Deteksi Sampah Sungai & Bahaya Sumbatan Aliran</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-semibold">
                      CV YOLOv8-Water
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sesuai bagan Mind Map: Sampah & sedimen merupakan penyebab utama penyumbatan drainase yang meluapkan Citarum
                  </p>
                </div>
              </div>

              {/* Action Buttons for Cleaning Satgas & Surge */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeployCleanUp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-950"
                  title="Kerahkan Satgas Citarum Harum untuk membersihkan sampah dan membuka sumbatan"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>🧹 Kerahkan Satgas (Bersihkan)</span>
                </button>

                <button
                  onClick={handleInjectTrashSurge}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md shadow-amber-950"
                  title="Simulasikan gelombang sampah hanyut dari hulu"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>+ Banjir Sampah Hulu</span>
                </button>
              </div>
            </div>

            {/* Slider for River Trash Density */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-amber-400" />
                  <span>Tingkat Kepadatan Sampah & Penyumbatan Aliran Sungai:</span>
                </span>
                <span className={`font-mono text-base font-bold tabular-nums ${
                  drainageBlockage > 60 ? 'text-rose-400' : drainageBlockage > 25 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {drainageBlockage}% Tersumbat
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={drainageBlockage}
                onChange={(e) => onUpdateBlockage && onUpdateBlockage(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              {/* Presets */}
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                <button
                  onClick={() => onUpdateBlockage && onUpdateBlockage(0)}
                  className={`px-2 py-0.5 rounded border ${
                    drainageBlockage === 0
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Sungai Bersih (0%)
                </button>
                <button
                  onClick={() => onUpdateBlockage && onUpdateBlockage(25)}
                  className={`px-2 py-0.5 rounded border ${
                    drainageBlockage === 25
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Sampah Ringan (25%)
                </button>
                <button
                  onClick={() => onUpdateBlockage && onUpdateBlockage(50)}
                  className={`px-2 py-0.5 rounded border ${
                    drainageBlockage === 50
                      ? 'bg-amber-950 text-amber-300 border-amber-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Timbunan Sedang (50%)
                </button>
                <button
                  onClick={() => onUpdateBlockage && onUpdateBlockage(85)}
                  className={`px-2 py-0.5 rounded border ${
                    drainageBlockage >= 80
                      ? 'bg-rose-950 text-rose-300 border-rose-600'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Sumbatan Masif Jembatan (85%)
                </button>
              </div>
            </div>

            {/* Trash Real-time Telemetry Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Objek Sampah di Kamera:</span>
                <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                  {detectedTrashCount} Item
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Deteksi Optik Real-time</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Komposisi Sampah:</span>
                <span className="font-mono text-xs font-bold text-white block">
                  68% Plastik · 22% Kayu
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">10% Ban & Sedimen</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Reduksi Kapasitas Debit (Q):</span>
                <span className={`font-mono text-base font-bold tabular-nums ${
                  drainageBlockage > 50 ? 'text-rose-400' : 'text-cyan-400'
                }`}>
                  -{(drainageBlockage * 0.52).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Kapasitas Aliran Kolong</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 text-[11px] block">Risiko Luapan Tanggul:</span>
                <span className={`font-bold block ${
                  drainageBlockage > 60
                    ? 'text-rose-400'
                    : drainageBlockage > 30
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {drainageBlockage > 60
                    ? 'TINGGI (Siaga 1)'
                    : drainageBlockage > 30
                    ? 'SEDANG (Waspada)'
                    : 'RENDAH (Aman)'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Efek Hambatan Air</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Camera Switcher & Rain Detector Telemetry */}
        <div className="space-y-4">
          {/* Camera Selection List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Video className="h-4 w-4 text-cyan-400" />
                <span>Saluran Kamera CCTV</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Pilih Feed</span>
            </h3>

            <div className="space-y-2">
              {cameras.map((cam) => {
                const isSelected = cam.id === selectedCamId;
                return (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCamId(cam.id)}
                    className={`cursor-pointer rounded-lg p-3 border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-950'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">{cam.id}</span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>ONLINE</span>
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white line-clamp-1">{cam.name}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{cam.location}</div>

                    {/* Camera Trash Level Tag */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Trash2 className="h-3 w-3 text-amber-400" />
                        <span>Kondisi Sampah:</span>
                      </span>
                      <span className={`font-semibold ${
                        cam.id === 'CAM-01' && drainageBlockage > 50
                          ? 'text-rose-400 font-bold'
                          : 'text-amber-300'
                      }`}>
                        {cam.id === 'CAM-01' ? `${drainageBlockage}% Tersumbat` : cam.trashStatus || 'Tercemar'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Integrated Rain Detector Sensor Panel */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CloudRain className="h-4 w-4 text-cyan-400" />
                <span>Pendeteksi Hujan Terintegrasi</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">Tipping Bucket</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Intensitas Curah Hujan:</span>
                <span className="font-mono text-base font-bold text-cyan-400 tabular-nums">
                  {rainIntensity} mm/jam
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={rainIntensity}
                onChange={(e) => onUpdateRainfall(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Cerah (0)</span>
                <span>Sedang (25)</span>
                <span>Lebat (60)</span>
                <span className="text-rose-400">Ekstrem (&gt;90)</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Status Sensor Optik:</span>
                <span
                  className={`font-semibold ${
                    rainIntensity > 60
                      ? 'text-rose-400 font-bold'
                      : rainIntensity > 20
                      ? 'text-amber-400'
                      : rainIntensity > 0
                      ? 'text-yellow-300'
                      : 'text-emerald-400'
                  }`}
                >
                  {rainIntensity > 60
                    ? 'Badai Ekstrem'
                    : rainIntensity > 20
                    ? 'Hujan Lebat'
                    : rainIntensity > 0
                    ? 'Hujan Ringan'
                    : 'Kering / Cerah'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Akumulasi 24 Jam:</span>
                <span className="font-mono text-slate-200">
                  {(rainIntensity * 1.8 + 14.5).toFixed(1)} mm
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Korelasi Muka Air:</span>
                <span className="font-mono text-cyan-400">
                  {rainIntensity > 40 ? '+ Kenaikan Cepat' : 'Fluktuasi Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
