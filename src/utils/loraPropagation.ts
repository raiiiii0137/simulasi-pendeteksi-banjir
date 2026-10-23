/**
 * LoRa RF Propagation & Link Budget Physics Calculations
 * Berdasarkan model Free Space Path Loss (FSPL) & Log-Distance Path Loss
 * untuk transmisi Sub-GHz (915 MHz / 433 MHz) pada topografi Cekungan Dayeuhkolot / Sungai Citarum.
 */

export type TerrainType = 'los' | 'suburban' | 'dense_foliage' | 'heavy_rain';

export interface LoraRfConfig {
  distanceKm: number;
  freqMhz: number; // 915 or 433
  txPowerDbm: number; // 2 to 20 dBm (default: 14 dBm)
  txGainDbi: number; // Node antenna gain (default: 2.15 dBi)
  rxGainDbi: number; // Gateway antenna gain (default: 5.8 dBi)
  gatewayHeightM: number; // 10 to 45m
  nodeHeightM: number; // 2 to 8m
  spreadingFactor: number; // 7 to 12
  bandwidthKhz: number; // 125, 250, 500
  terrain: TerrainType;
  rainMmHr: number;
}

export interface LoraSimulationResult {
  fsplDb: number;
  totalPathLossDb: number;
  rssiDbm: number;
  snrDb: number;
  sensitivityDbm: number;
  linkMarginDb: number;
  packetDeliveryRatePct: number;
  timeOnAirMs: number;
  fresnelRadiusM: number;
  maxTheoreticalRangeKm: number;
  signalStatus: 'Sangat Kuat' | 'Baik' | 'Cukup' | 'Batas Sensitivitas' | 'Sinyal Putus';
  statusColor: string;
}

// Sensitivitas receiver Semtech SX1276 berdasarkan Spreading Factor (BW 125 kHz)
export const SF_SPECS: Record<number, { sensitivity: number; snrLimit: number; dataRateBps: number; toa16BytesMs: number }> = {
  7: { sensitivity: -123.0, snrLimit: -7.5, dataRateBps: 5468, toa16BytesMs: 46 },
  8: { sensitivity: -126.0, snrLimit: -10.0, dataRateBps: 3125, toa16BytesMs: 82 },
  9: { sensitivity: -129.0, snrLimit: -12.5, dataRateBps: 1757, toa16BytesMs: 164 },
  10: { sensitivity: -132.0, snrLimit: -15.0, dataRateBps: 976, toa16BytesMs: 328 },
  11: { sensitivity: -134.5, snrLimit: -17.5, dataRateBps: 537, toa16BytesMs: 656 },
  12: { sensitivity: -137.0, snrLimit: -20.0, dataRateBps: 293, toa16BytesMs: 1312 },
};

/**
 * Free Space Path Loss (FSPL)
 * FSPL(dB) = 20*log10(d_km) + 20*log10(f_MHz) + 32.44
 */
export function calculateFSPL(distanceKm: number, freqMhz: number): number {
  const d = Math.max(0.01, distanceKm);
  return 20 * Math.log10(d) + 20 * Math.log10(freqMhz) + 32.44;
}

/**
 * Total Path Loss dengan mempertimbangkan medan & redaman lingkungan
 */
export function calculateTotalPathLoss(
  distanceKm: number,
  freqMhz: number,
  terrain: TerrainType,
  rainMmHr: number,
  gatewayHeightM: number,
  nodeHeightM: number
): number {
  const fspl = calculateFSPL(distanceKm, freqMhz);

  // Exponent penyesuaian kontur
  let terrainExcessLossDb = 0;
  if (terrain === 'suburban') {
    // Pemukiman padat Dayeuhkolot / Bojong Asih
    terrainExcessLossDb = 6.5 + 4.2 * Math.log10(Math.max(1, distanceKm));
  } else if (terrain === 'dense_foliage') {
    // Rimbun pepohonan hulu sungai Citarum
    terrainExcessLossDb = 11.0 + 6.0 * Math.log10(Math.max(1, distanceKm));
  } else if (terrain === 'heavy_rain') {
    // Redaman akibat partikel air hujan lebat di udara
    terrainExcessLossDb = 5.0 + (rainMmHr / 100) * 0.35 * distanceKm;
  }

  // Pengaruh tinggi tiang antena (Height gain)
  // Tiang lebih tinggi memberikan elevasi clearance Fresnel yang lebih baik
  const heightCorrectionDb = Math.max(0, 10 * Math.log10((gatewayHeightM * nodeHeightM) / 50));

  const totalLoss = Math.max(fspl, fspl + terrainExcessLossDb - heightCorrectionDb);
  return Number(totalLoss.toFixed(1));
}

/**
 * Radius Zona Fresnel Ke-1 di titik tengah
 * R1 = 8.65 * sqrt(d_km / f_GHz)
 */
export function calculateFresnelRadiusM(distanceKm: number, freqMhz: number): number {
  const freqGhz = freqMhz / 1000;
  return Number((8.65 * Math.sqrt(Math.max(0.05, distanceKm) / freqGhz)).toFixed(1));
}

/**
 * Menghitung keseluruhan simulasi telemetri LoRa link budget
 */
export function simulateLoraLink(config: LoraRfConfig): LoraSimulationResult {
  const {
    distanceKm,
    freqMhz,
    txPowerDbm,
    txGainDbi,
    rxGainDbi,
    gatewayHeightM,
    nodeHeightM,
    spreadingFactor,
    terrain,
    rainMmHr,
  } = config;

  const sfData = SF_SPECS[spreadingFactor] || SF_SPECS[9];
  const fsplDb = Number(calculateFSPL(distanceKm, freqMhz).toFixed(1));
  const totalPathLossDb = calculateTotalPathLoss(
    distanceKm,
    freqMhz,
    terrain,
    rainMmHr,
    gatewayHeightM,
    nodeHeightM
  );

  // Link budget RSSI = Ptx + Gtx + Grx - PathLoss
  const rawRssi = txPowerDbm + txGainDbi + rxGainDbi - totalPathLossDb;
  const rssiDbm = Number(rawRssi.toFixed(1));

  // Noise floor untuk BW 125 kHz ~ -117 dBm (Thermal noise + NF ~6 dB)
  const noiseFloorDbm = -117.0;
  let rawSnr = rssiDbm - noiseFloorDbm;
  // Batasi SNR realistis antara -22 dB sampai +12 dB
  rawSnr = Math.max(-25, Math.min(12, rawSnr));
  const snrDb = Number(rawSnr.toFixed(1));

  const sensitivityDbm = sfData.sensitivity;
  const linkMarginDb = Number((rssiDbm - sensitivityDbm).toFixed(1));

  // Packet Delivery Rate (PDR)
  let pdr = 100;
  if (linkMarginDb > 8) {
    pdr = 99.8;
  } else if (linkMarginDb > 3) {
    pdr = 96.5 + linkMarginDb * 0.6;
  } else if (linkMarginDb > 0) {
    pdr = 75 + linkMarginDb * 7;
  } else if (linkMarginDb > -3) {
    pdr = Math.max(10, 45 + linkMarginDb * 15);
  } else {
    pdr = 0; // Sinyal terputus
  }
  const packetDeliveryRatePct = Number(pdr.toFixed(1));

  // Menentukan status sinyal
  let signalStatus: LoraSimulationResult['signalStatus'] = 'Sangat Kuat';
  let statusColor = '#10b981'; // Emerald

  if (linkMarginDb < -3 || rssiDbm < -137) {
    signalStatus = 'Sinyal Putus';
    statusColor = '#ef4444'; // Red
  } else if (linkMarginDb <= 3) {
    signalStatus = 'Batas Sensitivitas';
    statusColor = '#f59e0b'; // Amber
  } else if (rssiDbm < -110) {
    signalStatus = 'Cukup';
    statusColor = '#eab308'; // Yellow
  } else if (rssiDbm < -90) {
    signalStatus = 'Baik';
    statusColor = '#06b6d4'; // Cyan
  } else {
    signalStatus = 'Sangat Kuat';
    statusColor = '#10b981'; // Emerald
  }

  // Maksimum jangkauan teoritis pada SF dan daya saat ini
  // Max Loss = Ptx + Gtx + Grx - Sensitivity
  const maxAllowableLoss = txPowerDbm + txGainDbi + rxGainDbi - sensitivityDbm;
  // Approx distance: d = 10^((MaxLoss - 32.44 - 20*log10(f)) / 20)
  const constLoss = 32.44 + 20 * Math.log10(freqMhz);
  let maxRangeLos = Math.pow(10, (maxAllowableLoss - constLoss) / 20);
  if (terrain === 'suburban') maxRangeLos *= 0.55;
  if (terrain === 'dense_foliage') maxRangeLos *= 0.42;
  if (terrain === 'heavy_rain') maxRangeLos *= 0.68;
  const maxTheoreticalRangeKm = Number(Math.min(35, Math.max(1.5, maxRangeLos)).toFixed(1));

  return {
    fsplDb,
    totalPathLossDb,
    rssiDbm,
    snrDb,
    sensitivityDbm,
    linkMarginDb,
    packetDeliveryRatePct,
    timeOnAirMs: sfData.toa16BytesMs,
    fresnelRadiusM: calculateFresnelRadiusM(distanceKm, freqMhz),
    maxTheoreticalRangeKm,
    signalStatus,
    statusColor,
  };
}
