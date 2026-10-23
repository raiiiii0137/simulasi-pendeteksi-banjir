import { AlertLevel } from '../types/flood';

/**
 * Menghitung kecepatan suara di udara berdasarkan suhu (°C)
 * v = 331.3 * sqrt(1 + T / 273.15)
 * Pada ~20°C: v ≈ 343 m/s; pada ~15°C: v ≈ 340 m/s
 */
export function calculateSpeedOfSound(temperatureC: number): number {
  return Number((331.3 * Math.sqrt(1 + temperatureC / 273.15)).toFixed(1));
}

/**
 * Menghitung jarak sensor ke permukaan air (s)
 * Rumus Fisika Ultrasonik:
 * s = v * (t / 2)
 * @param echoTimeMs Waktu tempuh bolak-balik pulsa ultrasonik 40 kHz (dalam milidetik)
 * @param soundSpeedMPerS Kecepatan suara (m/s), default 340 m/s
 * @returns Jarak dalam centimeter (cm)
 */
export function calculateEchoDistanceCm(echoTimeMs: number, soundSpeedMPerS: number = 340): number {
  // s = (v [m/s] * (t [ms] / 1000) / 2) * 100 [cm/m]
  const distanceCm = (soundSpeedMPerS * (echoTimeMs / 1000) / 2) * 100;
  return Math.max(0, Number(distanceCm.toFixed(1)));
}

/**
 * Menghitung waktu pantul ultrasonik (t) dari jarak (s)
 * t = (2 * s) / v
 * @param distanceCm Jarak dalam centimeter
 * @param soundSpeedMPerS Kecepatan suara dalam m/s
 * @returns Waktu tempuh bolak-balik dalam milidetik (ms)
 */
export function calculateEchoTimeMs(distanceCm: number, soundSpeedMPerS: number = 340): number {
  const distanceM = distanceCm / 100;
  const timeSec = (2 * distanceM) / soundSpeedMPerS;
  return Number((timeSec * 1000).toFixed(2));
}

/**
 * Menghitung ketinggian air sungai / saluran (h)
 * Rumus: h = H - s
 * @param poleHeightCm Total tinggi tiang sensor ke dasar saluran (H)
 * @param sensorDistanceCm Jarak sensor ke permukaan air (s)
 * @returns Ketinggian air (h) dalam cm
 */
export function calculateWaterLevelCm(poleHeightCm: number, sensorDistanceCm: number): number {
  const h = poleHeightCm - sensorDistanceCm;
  return Math.max(0, Number(h.toFixed(1)));
}

/**
 * Menghitung laju kenaikan air (Vh)
 * Rumus: Vh = delta_h / delta_t (cm/menit)
 */
export function calculateRateOfRise(
  deltaHeightCm: number,
  deltaTimeMinutes: number
): number {
  if (deltaTimeMinutes <= 0) return 0;
  const vh = deltaHeightCm / deltaTimeMinutes;
  return Number(vh.toFixed(2));
}

/**
 * Menentukan tingkat siaga banjir sesuai batas ambang
 */
export function determineAlertLevel(
  waterLevelCm: number,
  thresholds: { waspada: number; siaga: number; awas: number }
): AlertLevel {
  if (waterLevelCm >= thresholds.awas) return 'awas';
  if (waterLevelCm >= thresholds.siaga) return 'siaga';
  if (waterLevelCm >= thresholds.waspada) return 'waspada';
  return 'normal';
}

/**
 * Menghitung estimasi waktu menuju luapan / banjir (Time to Spillover)
 */
export function calculateTimeToSpilloverMin(
  currentLevelCm: number,
  spilloverHeightCm: number,
  rateOfRiseCmPerMin: number
): number | null {
  if (rateOfRiseCmPerMin <= 0.05) return null; // Air surut atau stabil
  const remainingCm = spilloverHeightCm - currentLevelCm;
  if (remainingCm <= 0) return 0;
  return Math.max(1, Math.round(remainingCm / rateOfRiseCmPerMin));
}
