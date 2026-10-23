export type AlertLevel = 'normal' | 'waspada' | 'siaga' | 'awas';

export interface TelemetryPoint {
  timestamp: number;
  timeLabel: string;
  echoTimeMs: number; // time of flight t in milliseconds
  distanceSensorToWaterCm: number; // s in cm
  waterLevelCm: number; // h in cm
  rateOfRiseCmPerMin: number; // Vh = delta h / delta t
  rssi: number; // dBm (e.g. -78 dBm)
  snr: number; // dB (e.g. 9.5 dB)
  batteryVolts: number; // e.g. 3.95 V
}

export interface SensorStation {
  id: string;
  name: string;
  locationType: 'Cekungan Rendah' | 'Hulu Sungai' | 'Pintu Air Utama';
  poleHeightCm: number; // H total height from bed to sensor face (e.g. 400 cm)
  thresholds: {
    waspada: number; // Siaga 3 (e.g. 150 cm)
    siaga: number;   // Siaga 2 (e.g. 230 cm)
    awas: number;    // Siaga 1 (e.g. 300 cm)
    spillover: number; // Tanggul meluap (e.g. 350 cm)
  };
  currentLevelCm: number;
  currentDistanceCm: number;
  currentEchoTimeMs: number;
  rateOfRiseCmPerMin: number;
  alertLevel: AlertLevel;
  loraFreqMhz: number; // 915.0 or 433.0
  spreadingFactor: number; // SF7 - SF12
  rssi: number;
  snr: number;
  batteryPct: number;
  solarCharging: boolean;
  buzzerActive: boolean;
  drainageBlockedPct: number;
  rainfallIntensityMmHr: number;
  history: TelemetryPoint[];
}

export interface PhysicsParameters {
  airTemperatureC: number;
  soundVelocityMPerS: number; // v = 331.3 * sqrt(1 + T/273.15)
  ultrasonicFrequencyKhz: number; // 40 kHz
  poleHeightH: number; // H (cm)
}

export interface RiverTrashItem {
  id: string;
  type: 'plastic_bag' | 'bottle' | 'styrofoam' | 'wood_log' | 'trash_pile' | 'tire';
  name: string;
  category: 'Plastik Anorganik' | 'Limbah Organik' | 'Limbah Padat / Sedimen';
  x: number;
  yOffset: number;
  width: number;
  height: number;
  speed: number;
  rotation: number;
  color: string;
  confidence: number;
  isTrappedAtPier?: boolean;
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  resolution: string;
  fps: number;
  isOnline: boolean;
  nightVision: boolean;
  ptz: {
    pan: number; // -180 to 180
    tilt: number; // -90 to 90
    zoom: number; // 1x to 5x
  };
  opticalWaterlineCm: number;
  aiDetectionConfidence: number; // 0 to 1 (e.g. 0.94)
  description: string;
  trashStatus?: 'Bersih' | 'Ringan' | 'Tercemar' | 'Sumbatan Parah';
  trashCount?: number;
}

export interface RainSensorData {
  intensityMmHr: number;
  status: 'Kering (Aman)' | 'Hujan Ringan' | 'Hujan Sedang' | 'Hujan Lebat' | 'Badai Ekstrem';
  accumulated24hMm: number;
  sensorType: 'Tipping Bucket & Optik Piezoelektrik';
  surfaceWetnessPct: number;
}
