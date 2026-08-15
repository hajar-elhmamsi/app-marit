// Maritime Mathematical & Navigational Formulas

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculates Great Circle distance between two coordinates in Nautical Miles (NM)
 */
export function calculateNauticalDistance(p1: LatLng, p2: LatLng): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

/**
 * Calculates initial true bearing (heading) from point 1 to point 2 (0-360 deg)
 */
export function calculateBearing(p1: LatLng, p2: LatLng): number {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Format decimal coordinates to traditional Nautical format: DD° MM.MM' N/S, DDD° MM.MM' E/W
 */
export function formatNauticalCoords(lat: number, lng: number): string {
  const latHem = lat >= 0 ? 'N' : 'S';
  const lngHem = lng >= 0 ? 'E' : 'W';
  
  const absLat = Math.abs(lat);
  const latDeg = Math.floor(absLat);
  const latMin = ((absLat - latDeg) * 60).toFixed(2);

  const absLng = Math.abs(lng);
  const lngDeg = Math.floor(absLng);
  const lngMin = ((absLng - lngDeg) * 60).toFixed(2);

  return `${latDeg}°${latMin}' ${latHem}, ${lngDeg}°${lngMin}' ${lngHem}`;
}

/**
 * Calculates Closest Point of Approach (CPA in NM) and Time to CPA (TCPA in minutes)
 */
export function calculateCPA(
  ownPos: LatLng,
  ownSpeed: number, // knots
  ownCourse: number, // degrees
  targetPos: LatLng,
  targetSpeed: number, // knots
  targetCourse: number // degrees
): { cpa: number; tcpa: number; isRisk: boolean } {
  // Convert speeds and courses to Cartesian velocity vectors (knots)
  const ownVx = ownSpeed * Math.sin((ownCourse * Math.PI) / 180);
  const ownVy = ownSpeed * Math.cos((ownCourse * Math.PI) / 180);

  const targetVx = targetSpeed * Math.sin((targetCourse * Math.PI) / 180);
  const targetVy = targetSpeed * Math.cos((targetCourse * Math.PI) / 180);

  // Relative velocity
  const relVx = targetVx - ownVx;
  const relVy = targetVy - ownVy;

  // Relative position in nautical miles (approx planar locally)
  const dLat = (targetPos.lat - ownPos.lat) * 60; // 1 degree lat = 60 NM
  const dLng =
    (targetPos.lng - ownPos.lng) *
    60 *
    Math.cos(((ownPos.lat + targetPos.lat) / 2 * Math.PI) / 180);

  const relSpeedSq = relVx * relVx + relVy * relVy;
  if (relSpeedSq < 0.0001) {
    const dist = Math.sqrt(dLng * dLng + dLat * dLat);
    return { cpa: parseFloat(dist.toFixed(2)), tcpa: 0, isRisk: false };
  }

  // Time to CPA in hours
  const tCpaHours = -(dLng * relVx + dLat * relVy) / relSpeedSq;
  const tcpaMinutes = Math.max(0, tCpaHours * 60);

  // Position at CPA
  const cpaX = dLng + relVx * Math.max(0, tCpaHours);
  const cpaY = dLat + relVy * Math.max(0, tCpaHours);
  const cpaDist = Math.sqrt(cpaX * cpaX + cpaY * cpaY);

  const cpa = parseFloat(cpaDist.toFixed(2));
  const tcpa = parseFloat(tcpaMinutes.toFixed(1));
  const isRisk = cpa < 1.5 && tcpa < 25 && tcpa > 0;

  return { cpa, tcpa, isRisk };
}

/**
 * Calculates IMO Carbon Intensity Indicator (CII) Rating (A to E)
 * Based on grams CO2 / (DWT * Distance Nautical Miles)
 */
export function calculateCIIRating(
  fuelConsumedTons: number,
  dwt: number,
  distanceNM: number,
  shipType: string = 'Container'
): { attainedCII: number; requiredCII: number; ratio: number; grade: 'A' | 'B' | 'C' | 'D' | 'E' } {
  // Conversion factor: HFO / VLSFO emits ~3.114 g CO2 per g fuel
  const co2Grams = fuelConsumedTons * 1000 * 1000 * 3.114;
  const capacityDistance = dwt * Math.max(1, distanceNM);
  const attainedCII = parseFloat((co2Grams / capacityDistance).toFixed(2));

  // Reference baseline approximation
  const requiredCII = 7.45; // baseline for mid-size container
  const ratio = parseFloat((attainedCII / requiredCII).toFixed(2));

  let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  if (ratio <= 0.83) grade = 'A';
  else if (ratio <= 0.94) grade = 'B';
  else if (ratio <= 1.06) grade = 'C';
  else if (ratio <= 1.19) grade = 'D';
  else grade = 'E';

  return { attainedCII, requiredCII, ratio, grade };
}

/**
 * Calculates Metacentric Height (GM) for vessel stability
 * GM = KM - KG (Transverse metacentric height)
 */
export function calculateStabilityGM(
  displacementTons: number,
  totalCargoWeightTons: number,
  vcgCargo: number // Vertical Center of Gravity
): { gm: number; status: 'Optimal' | 'Tender (Stiff warning)' | 'Critical (Unstable)' } {
  const kmBase = 12.5; // transverse metacenter height above baseline in meters
  const baseKG = 8.2;
  const calculatedKG = (baseKG * 0.4 + vcgCargo * 0.6);
  const gm = parseFloat((kmBase - calculatedKG).toFixed(2));

  let status: 'Optimal' | 'Tender (Stiff warning)' | 'Critical (Unstable)' = 'Optimal';
  if (gm < 0.5) status = 'Critical (Unstable)';
  else if (gm > 3.0) status = 'Tender (Stiff warning)';

  return { gm, status };
}
