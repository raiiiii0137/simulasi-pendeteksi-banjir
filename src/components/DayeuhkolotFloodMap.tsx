import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SensorStation } from '../types/flood';
import {
  MapPin,
  Layers,
  Radio,
  LifeBuoy,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Maximize2
} from 'lucide-react';

interface DayeuhkolotFloodMapProps {
  station: SensorStation;
  onUpdateLevel: (newLevelCm: number) => void;
}

// Key Geographic Locations in Dayeuhkolot, Bandung
const DAYEUHKOLOT_LOCATIONS = [
  {
    id: 'citarum-bridge',
    name: 'Jembatan Citarum Dayeuhkolot',
    sub: 'Pos Sensor LoRa 01 Utama',
    lat: -6.9838,
    lng: 107.6255,
    elevationMdpl: 658,
    type: 'sensor' as const,
    criticalThresholdCm: 300,
  },
  {
    id: 'bojong-asih',
    name: 'Kampung Bojong Asih (RW 04 & 05)',
    sub: 'Titik Cekungan Terendah (Rawan Parah)',
    lat: -6.9885,
    lng: 107.6225,
    elevationMdpl: 654,
    type: 'basin_critical' as const,
    criticalThresholdCm: 180,
  },
  {
    id: 'cieunteung',
    name: 'Kolam Retensi Cieunteung',
    sub: 'Polder Penampung Limpasan Citarum',
    lat: -6.9925,
    lng: 107.6185,
    elevationMdpl: 655,
    type: 'retention' as const,
    criticalThresholdCm: 250,
  },
  {
    id: 'bolero',
    name: 'Kampung Bolero Dayeuhkolot',
    sub: 'Bantaran Sungai Citarum Lama',
    lat: -6.9855,
    lng: 107.6205,
    elevationMdpl: 656,
    type: 'settlement' as const,
    criticalThresholdCm: 220,
  },
  {
    id: 'posko-kecamatan',
    name: 'Kantor Kecamatan Dayeuhkolot',
    sub: 'Posko Evakuasi Dataran Tinggi Utama',
    lat: -6.9785,
    lng: 107.6295,
    elevationMdpl: 668,
    type: 'shelter' as const,
    criticalThresholdCm: 999,
  },
  {
    id: 'posko-ash-shofia',
    name: 'Masjid Agung Ash-Shofia',
    sub: 'Posko Pengungsian Siaga 24 Jam',
    lat: -6.9755,
    lng: 107.6248,
    elevationMdpl: 666,
    type: 'shelter' as const,
    criticalThresholdCm: 999,
  },
];

export const DayeuhkolotFloodMap: React.FC<DayeuhkolotFloodMapProps> = ({
  station,
  onUpdateLevel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const inundationLayersRef = useRef<L.LayerGroup | null>(null);
  const radioCircleRef = useRef<L.Circle | null>(null);
  const evacuationRouteRef = useRef<L.Polyline | null>(null);

  // Layer toggles
  const [showInundation, setShowInundation] = useState(true);
  const [showLoraCoverage, setShowLoraCoverage] = useState(true);
  const [showEvacRoute, setShowEvacRoute] = useState(true);
  const [showShelters, setShowShelters] = useState(true);

  const waterLevel = station.currentLevelCm;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-6.9855, 107.6240], // Dayeuhkolot center
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Dark style tile layer (CartoDB Dark Matter)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      // Layer group for dynamic inundation polygons
      const inundationGroup = L.layerGroup().addTo(map);
      inundationLayersRef.current = inundationGroup;

      // Add LoRa Gateway Coverage Circle (radius ~1500m around Jembatan Citarum)
      const loraCircle = L.circle([-6.9838, 107.6255], {
        radius: 1400,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);
      radioCircleRef.current = loraCircle;

      // Add Evacuation Path from Bojong Asih to Kantor Kecamatan
      const evacCoords: L.LatLngExpression[] = [
        [-6.9885, 107.6225], // Bojong Asih
        [-6.9850, 107.6240], // Simpang Jalan Dayeuhkolot
        [-6.9815, 107.6265], // Jembatan Menuju Jalur Kering
        [-6.9785, 107.6295], // Kantor Kecamatan Dayeuhkolot (+668 mdpl)
      ];

      const evacLine = L.polyline(evacCoords, {
        color: '#10b981',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(map);
      evacuationRouteRef.current = evacLine;

      // Add Locations Markers
      DAYEUHKOLOT_LOCATIONS.forEach((loc) => {
        let markerColor = '#3b82f6';
        let iconHtml = '📍';

        if (loc.type === 'sensor') {
          markerColor = '#06b6d4';
          iconHtml = '📡';
        } else if (loc.type === 'basin_critical') {
          markerColor = '#ef4444';
          iconHtml = '🌊';
        } else if (loc.type === 'retention') {
          markerColor = '#0284c7';
          iconHtml = '💧';
        } else if (loc.type === 'shelter') {
          markerColor = '#10b981';
          iconHtml = '🛡️';
        }

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="background-color: ${markerColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 14px;">
              ${iconHtml}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; line-height: 1.4;">
            <strong style="font-size: 13px; color: #0284c7;">${loc.name}</strong><br/>
            <span style="color: #64748b;">${loc.sub}</span><br/>
            <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
            <div><strong>Elevasi:</strong> ${loc.elevationMdpl} mdpl</div>
            <div><strong>Batas Kritis:</strong> ${loc.criticalThresholdCm === 999 ? 'Bebas Banjir (Dataran Tinggi)' : loc.criticalThresholdCm + ' cm'}</div>
          </div>
        `);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map reference stable across renders
    };
  }, []);

  // Update Dynamic Inundation Layer based on current water level
  useEffect(() => {
    if (!mapInstanceRef.current || !inundationLayersRef.current) return;

    inundationLayersRef.current.clearLayers();

    if (!showInundation) return;

    // Simulation calculation:
    // If waterLevel >= 150 cm (Waspada): Bojong Asih & Cieunteung perimeter start flooding
    if (waterLevel >= 150) {
      // Stage 1: Lower Basin (Bojong Asih core & Cieunteung margin)
      const stage1Polygon = L.polygon(
        [
          [-6.9870, 107.6210],
          [-6.9895, 107.6200],
          [-6.9910, 107.6235],
          [-6.9880, 107.6250],
        ],
        {
          color: '#38bdf8',
          fillColor: '#0284c7',
          fillOpacity: Math.min(0.65, 0.25 + ((waterLevel - 150) / 100) * 0.3),
          weight: 1.5,
        }
      ).bindTooltip(`Genangan Bojong Asih (Kedalaman ~${Math.round((waterLevel - 130) * 0.8)} cm)`, {
        permanent: false,
      });

      inundationLayersRef.current.addLayer(stage1Polygon);
    }

    // If waterLevel >= 230 cm (Siaga): Spreads to Kampung Bolero & Jalan Raya Dayeuhkolot
    if (waterLevel >= 230) {
      const stage2Polygon = L.polygon(
        [
          [-6.9840, 107.6185],
          [-6.9870, 107.6190],
          [-6.9930, 107.6160],
          [-6.9940, 107.6210],
          [-6.9865, 107.6270],
          [-6.9830, 107.6240],
        ],
        {
          color: '#f97316',
          fillColor: '#ea580c',
          fillOpacity: Math.min(0.7, 0.35 + ((waterLevel - 230) / 100) * 0.3),
          weight: 2,
        }
      ).bindTooltip(`Luapan Meluas: Bolero & Akses Jalan Tergenang (Kedalaman ~${Math.round((waterLevel - 180) * 0.9)} cm)`, {
        permanent: false,
      });

      inundationLayersRef.current.addLayer(stage2Polygon);
    }

    // If waterLevel >= 300 cm (Awas / Siaga 1): Massive Inundation covering the entire Dayeuhkolot basin bowl
    if (waterLevel >= 300) {
      const stage3Polygon = L.polygon(
        [
          [-6.9810, 107.6160],
          [-6.9860, 107.6140],
          [-6.9960, 107.6150],
          [-6.9950, 107.6250],
          [-6.9880, 107.6300],
          [-6.9805, 107.6260],
        ],
        {
          color: '#ef4444',
          fillColor: '#dc2626',
          fillOpacity: 0.65,
          weight: 2.5,
          dashArray: '6, 4',
        }
      ).bindTooltip(`BANJIR PARAH CEKUNGAN DAYEUHKOLOT (Kedalaman 1.8 - 2.8 meter)`, {
        permanent: true,
      });

      inundationLayersRef.current.addLayer(stage3Polygon);
    }
  }, [waterLevel, showInundation]);

  // Update visibility of radio & evacuation layers
  useEffect(() => {
    if (radioCircleRef.current) {
      if (showLoraCoverage) radioCircleRef.current.setStyle({ opacity: 1, fillOpacity: 0.08 });
      else radioCircleRef.current.setStyle({ opacity: 0, fillOpacity: 0 });
    }
  }, [showLoraCoverage]);

  useEffect(() => {
    if (evacuationRouteRef.current) {
      if (showEvacRoute) evacuationRouteRef.current.setStyle({ opacity: 0.9 });
      else evacuationRouteRef.current.setStyle({ opacity: 0 });
    }
  }, [showEvacRoute]);

  // Local depth estimates for Bojong Asih based on Citarum river level
  const bojongAsihDepth = Math.max(0, waterLevel - 140);
  const cieunteungVolumePct = Math.min(100, Math.round((waterLevel / 320) * 100));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              <span>Peta Simulasi Banjir Cekungan Dayeuhkolot (DAS Citarum)</span>
            </h2>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
              KAB. BANDUNG
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pemodelan geospasial genangan air Sungai Citarum, Kampung Bojong Asih, Kolam Cieunteung, dan Posko Evakuasi
          </p>
        </div>

        {/* Quick Simulation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateLevel(Math.min(350, waterLevel + 40))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/80 border border-rose-600/60 text-rose-300 hover:bg-rose-900 transition-colors shadow-sm"
          >
            <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
            <span>Naikkan Air (+40 cm)</span>
          </button>
          <button
            onClick={() => onUpdateLevel(95)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Surut Normal</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles & Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>Lapisan Peta:</span>
          </span>

          <button
            onClick={() => setShowInundation(!showInundation)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
              showInundation
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            Simulasi Genangan Air
          </button>

          <button
            onClick={() => setShowLoraCoverage(!showLoraCoverage)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
              showLoraCoverage
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            Cakupan LoRa (1.4 km)
          </button>

          <button
            onClick={() => setShowEvacRoute(!showEvacRoute)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
              showEvacRoute
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            Rute Evakuasi Aman
          </button>
        </div>

        {/* Live Inundation Diagnosis for Dayeuhkolot */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div>
            <span className="text-slate-400">Genangan Bojong Asih:</span>{' '}
            <span
              className={`font-bold tabular-nums ${
                bojongAsihDepth > 100
                  ? 'text-rose-400 font-bold'
                  : bojongAsihDepth > 0
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {bojongAsihDepth > 0 ? `${bojongAsihDepth} cm` : 'Kering'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span className="text-slate-400">Kolam Cieunteung:</span>{' '}
            <span className="text-cyan-400 font-bold tabular-nums">{cieunteungVolumePct}%</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Legend Overlay Card */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-slate-950/95 border border-slate-800 p-3 text-[11px] shadow-xl backdrop-blur-md space-y-1.5">
          <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5 pb-1 border-b border-slate-800">
            <span>Legenda Topografi Dayeuhkolot</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block border border-white shrink-0"></span>
            <span>Sensor Ultrasonik LoRa (Jembatan Citarum)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block border border-white shrink-0"></span>
            <span>Bojong Asih (Cekungan Kritis +654 mdpl)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-white shrink-0"></span>
            <span>Posko Evakuasi Dataran Tinggi (+668 mdpl)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-5 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block shrink-0"></span>
            <span>Rute Evakuasi Bebas Banjir</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-4 h-2 bg-rose-600/60 border border-rose-500 inline-block shrink-0"></span>
            <span>Zona Genangan Air Sungai Citarum</span>
          </div>
        </div>
      </div>

      {/* Interactive Water Level Slider for Dayeuhkolot Inundation */}
      <div className="rounded-lg bg-slate-950 border border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span>Pengatur Simulasi Ketinggian Muka Air Sungai Citarum (Dayeuhkolot)</span>
          </label>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Tinggi Muka Air (h):</span>
            <span
              className={`text-sm font-bold tabular-nums ${
                waterLevel >= 300
                  ? 'text-rose-400 animate-pulse'
                  : waterLevel >= 230
                  ? 'text-amber-400'
                  : waterLevel >= 150
                  ? 'text-yellow-400'
                  : 'text-cyan-400'
              }`}
            >
              {waterLevel} cm
            </span>
          </div>
        </div>

        <input
          type="range"
          min="40"
          max="350"
          value={waterLevel}
          onChange={(e) => onUpdateLevel(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="grid grid-cols-4 text-[10px] font-mono text-slate-400 mt-2 gap-1">
          <div className="text-left">
            <strong className="text-emerald-400 block">Normal (&lt;150cm)</strong>
            <span>Air dalam palung sungai</span>
          </div>
          <div className="text-center">
            <strong className="text-yellow-400 block">Waspada (150-229cm)</strong>
            <span>Genangan Bojong Asih 20-50cm</span>
          </div>
          <div className="text-center">
            <strong className="text-amber-400 block">Siaga (230-299cm)</strong>
            <span>Bolero & Jalan terputus</span>
          </div>
          <div className="text-right">
            <strong className="text-rose-400 block">Awas (&ge;300cm)</strong>
            <span>Banjir parah 1.5 - 2.8m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
