export interface VesselTelemetry {
  rpm: number;
  engineLoadPct: number;
  fuelFlowLitersPerHour: number;
  turboPressureBar: number;
  exhaustTempAvgC: number;
  cylinders: number[]; // Exhaust temp per cylinder
  shaftPowerKW: number;
  tanks: {
    hfoPct: number;
    mgoPct: number;
    freshWaterPct: number;
    ballastPct: number;
  };
}

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  callSign: string;
  flag: string;
  flagCode: string;
  type: 'Container' | 'Oil Tanker' | 'Bulk Carrier' | 'LNG Carrier' | 'Tug / Salvage' | 'Offshore DP2';
  dwt: number;
  lengthM: number;
  beamM: number;
  draughtM: number;
  maxDraughtM: number;
  lat: number;
  lng: number;
  course: number; // 0 - 360 deg
  speedKnots: number;
  status: 'Underway' | 'Moored' | 'At Anchor' | 'Drifting' | 'Drydock';
  destination: string;
  destCode: string;
  eta: string;
  origin: string;
  originCode: string;
  ciiRating: 'A' | 'B' | 'C' | 'D' | 'E';
  co2PerVoyageTons: number;
  telemetry: VesselTelemetry;
  routeWaypoints: [number, number][];
}

export const INITIAL_VESSELS: Vessel[] = [
  {
    id: 'v-001',
    name: 'EVER APEX',
    imo: '9893890',
    mmsi: '352001456',
    callSign: '3FQK8',
    flag: 'Panama',
    flagCode: 'PA',
    type: 'Container',
    dwt: 241960,
    lengthM: 400,
    beamM: 61.5,
    draughtM: 14.8,
    maxDraughtM: 16.5,
    lat: 36.14,
    lng: -5.35, // Strait of Gibraltar
    course: 82,
    speedKnots: 18.4,
    status: 'Underway',
    origin: 'Rotterdam (NLRTM)',
    originCode: 'NLRTM',
    destination: 'Port Said (EGPSD)',
    destCode: 'EGPSD',
    eta: '2026-08-19 14:00 UTC',
    ciiRating: 'A',
    co2PerVoyageTons: 1420.5,
    telemetry: {
      rpm: 78,
      engineLoadPct: 82,
      fuelFlowLitersPerHour: 3450,
      turboPressureBar: 2.8,
      exhaustTempAvgC: 385,
      cylinders: [382, 386, 384, 388, 383, 387, 385, 389, 381, 386, 384, 388],
      shaftPowerKW: 58400,
      tanks: {
        hfoPct: 78,
        mgoPct: 92,
        freshWaterPct: 84,
        ballastPct: 35
      }
    },
    routeWaypoints: [
      [51.92, 4.47],
      [49.5, -3.2],
      [43.8, -9.5],
      [36.14, -5.35],
      [37.2, 11.0],
      [33.5, 27.5],
      [31.26, 32.3]
    ]
  },
  {
    id: 'v-002',
    name: 'MAERSK MC-KINNEY MOLLER',
    imo: '9619907',
    mmsi: '219018271',
    callSign: 'OXER2',
    flag: 'Denmark',
    flagCode: 'DK',
    type: 'Container',
    dwt: 194849,
    lengthM: 399,
    beamM: 59.0,
    draughtM: 15.2,
    maxDraughtM: 16.0,
    lat: 1.25,
    lng: 103.85, // Singapore Strait
    course: 245,
    speedKnots: 16.2,
    status: 'Underway',
    origin: 'Shanghai (CNSHA)',
    originCode: 'CNSHA',
    destination: 'Suez Canal (EGSUZ)',
    destCode: 'EGSUZ',
    eta: '2026-08-23 06:30 UTC',
    ciiRating: 'B',
    co2PerVoyageTons: 1980.2,
    telemetry: {
      rpm: 72,
      engineLoadPct: 76,
      fuelFlowLitersPerHour: 3120,
      turboPressureBar: 2.5,
      exhaustTempAvgC: 372,
      cylinders: [370, 374, 371, 375, 369, 373, 376, 372],
      shaftPowerKW: 46200,
      tanks: {
        hfoPct: 64,
        mgoPct: 88,
        freshWaterPct: 76,
        ballastPct: 42
      }
    },
    routeWaypoints: [
      [31.23, 121.47],
      [22.3, 114.1],
      [10.0, 110.5],
      [1.25, 103.85],
      [5.9, 80.5],
      [12.5, 45.0],
      [29.9, 32.5]
    ]
  },
  {
    id: 'v-003',
    name: 'CMA CGM JACQUES SAADÉ',
    imo: '9839179',
    mmsi: '228386700',
    callSign: 'FNJY',
    flag: 'France',
    flagCode: 'FR',
    type: 'Container',
    dwt: 220000,
    lengthM: 400,
    beamM: 61.3,
    draughtM: 15.6,
    maxDraughtM: 16.0,
    lat: 50.8,
    lng: -1.1, // English Channel (Solent)
    course: 65,
    speedKnots: 17.1,
    status: 'Underway',
    origin: 'Le Havre (FRLEH)',
    originCode: 'FRLEH',
    destination: 'Hamburg (DEHAM)',
    destCode: 'DEHAM',
    eta: '2026-08-16 22:00 UTC',
    ciiRating: 'A',
    co2PerVoyageTons: 940.0, // LNG eco-efficiency
    telemetry: {
      rpm: 74,
      engineLoadPct: 79,
      fuelFlowLitersPerHour: 2890,
      turboPressureBar: 2.7,
      exhaustTempAvgC: 360,
      cylinders: [358, 362, 359, 364, 360, 361, 365, 359, 363, 361, 358, 362],
      shaftPowerKW: 52000,
      tanks: {
        hfoPct: 15,
        mgoPct: 70,
        freshWaterPct: 90,
        ballastPct: 38
      }
    },
    routeWaypoints: [
      [49.49, 0.1],
      [50.8, -1.1],
      [51.2, 1.8],
      [53.5, 7.5],
      [53.55, 9.99]
    ]
  },
  {
    id: 'v-004',
    name: 'PACIFIC ENTERPRISE',
    imo: '9784321',
    mmsi: '636018992',
    callSign: 'A8QK9',
    flag: 'Liberia',
    flagCode: 'LR',
    type: 'Oil Tanker',
    dwt: 318000,
    lengthM: 333,
    beamM: 60.0,
    draughtM: 21.5,
    maxDraughtM: 22.5,
    lat: 25.28,
    lng: 56.4, // Gulf of Oman
    course: 145,
    speedKnots: 13.8,
    status: 'Underway',
    origin: 'Ras Tanura (SARAS)',
    originCode: 'SARAS',
    destination: 'Ningbo-Zhoushan (CNNGB)',
    destCode: 'CNNGB',
    eta: '2026-08-29 18:00 UTC',
    ciiRating: 'B',
    co2PerVoyageTons: 3100.8,
    telemetry: {
      rpm: 62,
      engineLoadPct: 74,
      fuelFlowLitersPerHour: 2750,
      turboPressureBar: 2.2,
      exhaustTempAvgC: 395,
      cylinders: [392, 398, 394, 396, 393, 397, 395],
      shaftPowerKW: 29400,
      tanks: {
        hfoPct: 82,
        mgoPct: 95,
        freshWaterPct: 68,
        ballastPct: 15
      }
    },
    routeWaypoints: [
      [26.65, 50.15],
      [25.28, 56.4],
      [20.5, 62.0],
      [6.0, 80.0],
      [5.5, 98.0],
      [29.8, 122.0]
    ]
  },
  {
    id: 'v-005',
    name: 'GASLOG WARSAW',
    imo: '9819686',
    mmsi: '310789000',
    callSign: 'ZCEZ6',
    flag: 'Bermuda',
    flagCode: 'BM',
    type: 'LNG Carrier',
    dwt: 95000,
    lengthM: 293,
    beamM: 45.8,
    draughtM: 11.8,
    maxDraughtM: 12.5,
    lat: 25.8,
    lng: 52.5, // Arabian Gulf (Qatar)
    course: 330,
    speedKnots: 0.1,
    status: 'Moored',
    origin: 'Ras Laffan (QARAS)',
    originCode: 'QARAS',
    destination: 'Tokyo Bay (JPTYO)',
    destCode: 'JPTYO',
    eta: '2026-09-02 04:00 UTC',
    ciiRating: 'A',
    co2PerVoyageTons: 1180.0,
    telemetry: {
      rpm: 0,
      engineLoadPct: 10,
      fuelFlowLitersPerHour: 220,
      turboPressureBar: 0.2,
      exhaustTempAvgC: 180,
      cylinders: [180, 182, 179, 181, 180, 178],
      shaftPowerKW: 1200,
      tanks: {
        hfoPct: 90,
        mgoPct: 98,
        freshWaterPct: 92,
        ballastPct: 80
      }
    },
    routeWaypoints: [
      [25.8, 52.5],
      [26.2, 56.2],
      [15.0, 68.0],
      [5.8, 80.0],
      [35.3, 139.7]
    ]
  },
  {
    id: 'v-006',
    name: 'NORDIC VALIANT',
    imo: '9654123',
    mmsi: '538005432',
    callSign: 'V7XQ3',
    flag: 'Marshall Islands',
    flagCode: 'MH',
    type: 'Bulk Carrier',
    dwt: 180000,
    lengthM: 292,
    beamM: 45.0,
    draughtM: 18.2,
    maxDraughtM: 18.5,
    lat: -20.3,
    lng: 118.5, // Port Hedland, Australia
    course: 290,
    speedKnots: 11.2,
    status: 'Underway',
    origin: 'Port Hedland (AUPHE)',
    originCode: 'AUPHE',
    destination: 'Qingdao (CNTAO)',
    destCode: 'CNTAO',
    eta: '2026-08-25 11:00 UTC',
    ciiRating: 'C',
    co2PerVoyageTons: 2240.4,
    telemetry: {
      rpm: 68,
      engineLoadPct: 72,
      fuelFlowLitersPerHour: 2450,
      turboPressureBar: 2.1,
      exhaustTempAvgC: 388,
      cylinders: [385, 390, 387, 389, 386, 391],
      shaftPowerKW: 18500,
      tanks: {
        hfoPct: 72,
        mgoPct: 85,
        freshWaterPct: 70,
        ballastPct: 20
      }
    },
    routeWaypoints: [
      [-20.3, 118.5],
      [-10.0, 118.0],
      [0.0, 119.5],
      [15.0, 120.0],
      [36.0, 120.3]
    ]
  },
  {
    id: 'v-007',
    name: 'HERCULES TITAN',
    imo: '9554321',
    mmsi: '244123000',
    callSign: 'PBHT',
    flag: 'Netherlands',
    flagCode: 'NL',
    type: 'Tug / Salvage',
    dwt: 3200,
    lengthM: 65,
    beamM: 18.5,
    draughtM: 6.8,
    maxDraughtM: 7.2,
    lat: 51.95,
    lng: 4.12, // Hook of Holland
    course: 18,
    speedKnots: 9.5,
    status: 'Underway',
    origin: 'Rotterdam (NLRTM)',
    originCode: 'NLRTM',
    destination: 'North Sea Field (NSF)',
    destCode: 'NSF01',
    eta: '2026-08-16 08:00 UTC',
    ciiRating: 'A',
    co2PerVoyageTons: 110.0,
    telemetry: {
      rpm: 88,
      engineLoadPct: 85,
      fuelFlowLitersPerHour: 1150,
      turboPressureBar: 2.9,
      exhaustTempAvgC: 410,
      cylinders: [405, 412, 408, 415, 410, 409, 414, 407],
      shaftPowerKW: 16000,
      tanks: {
        hfoPct: 0,
        mgoPct: 88,
        freshWaterPct: 95,
        ballastPct: 50
      }
    },
    routeWaypoints: [
      [51.95, 4.12],
      [53.2, 3.8],
      [54.5, 4.2]
    ]
  }
];
