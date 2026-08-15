export interface PortCall {
  id: string;
  name: string;
  code: string;
  country: string;
  lat: number;
  lng: number;
  berthsTotal: number;
  berthsOccupied: number;
  waitingVessels: number;
  averageTurnaroundHours: number;
  bunkerAvailable: ('VLSFO' | 'MGO' | 'LNG' | 'Biofuel')[];
  tidesM: { high: number; low: number; nextHighTime: string };
  weather: { tempC: number; windKnots: number; windDir: string; waveHeightM: number };
}

export const MAJOR_PORTS: PortCall[] = [
  {
    id: 'port-rotterdam',
    name: 'Port of Rotterdam',
    code: 'NLRTM',
    country: 'Netherlands',
    lat: 51.9244,
    lng: 4.4777,
    berthsTotal: 142,
    berthsOccupied: 118,
    waitingVessels: 12,
    averageTurnaroundHours: 28.5,
    bunkerAvailable: ['VLSFO', 'MGO', 'LNG', 'Biofuel'],
    tidesM: { high: 2.4, low: 0.3, nextHighTime: '18:45 UTC' },
    weather: { tempC: 19, windKnots: 16, windDir: 'SW', waveHeightM: 1.1 }
  },
  {
    id: 'port-singapore',
    name: 'Port of Singapore',
    code: 'SGSIN',
    country: 'Singapore',
    lat: 1.2644,
    lng: 103.8223,
    berthsTotal: 210,
    berthsOccupied: 189,
    waitingVessels: 28,
    averageTurnaroundHours: 22.0,
    bunkerAvailable: ['VLSFO', 'MGO', 'LNG', 'Biofuel'],
    tidesM: { high: 3.1, low: 0.6, nextHighTime: '21:10 UTC' },
    weather: { tempC: 31, windKnots: 8, windDir: 'E', waveHeightM: 0.5 }
  },
  {
    id: 'port-shanghai',
    name: 'Port of Shanghai (Yangshan)',
    code: 'CNSHA',
    country: 'China',
    lat: 30.6272,
    lng: 122.0645,
    berthsTotal: 185,
    berthsOccupied: 168,
    waitingVessels: 34,
    averageTurnaroundHours: 24.8,
    bunkerAvailable: ['VLSFO', 'MGO', 'LNG'],
    tidesM: { high: 4.2, low: 0.8, nextHighTime: '17:30 UTC' },
    weather: { tempC: 28, windKnots: 12, windDir: 'SE', waveHeightM: 0.9 }
  },
  {
    id: 'port-said',
    name: 'Port Said (Suez North)',
    code: 'EGPSD',
    country: 'Egypt',
    lat: 31.2653,
    lng: 32.3019,
    berthsTotal: 45,
    berthsOccupied: 38,
    waitingVessels: 19,
    averageTurnaroundHours: 18.0,
    bunkerAvailable: ['VLSFO', 'MGO'],
    tidesM: { high: 1.1, low: 0.2, nextHighTime: '20:00 UTC' },
    weather: { tempC: 33, windKnots: 14, windDir: 'NW', waveHeightM: 0.8 }
  },
  {
    id: 'port-jebel-ali',
    name: 'Jebel Ali Port (Dubai)',
    code: 'AEJEA',
    country: 'United Arab Emirates',
    lat: 25.0083,
    lng: 55.0603,
    berthsTotal: 67,
    berthsOccupied: 52,
    waitingVessels: 7,
    averageTurnaroundHours: 21.4,
    bunkerAvailable: ['VLSFO', 'MGO', 'LNG'],
    tidesM: { high: 1.8, low: 0.4, nextHighTime: '19:15 UTC' },
    weather: { tempC: 39, windKnots: 11, windDir: 'NNE', waveHeightM: 0.4 }
  },
  {
    id: 'port-tangermed',
    name: 'Tanger Med',
    code: 'MAPTM',
    country: 'Morocco',
    lat: 35.8883,
    lng: -5.5056,
    berthsTotal: 58,
    berthsOccupied: 46,
    waitingVessels: 8,
    averageTurnaroundHours: 19.8,
    bunkerAvailable: ['VLSFO', 'MGO'],
    tidesM: { high: 2.2, low: 0.5, nextHighTime: '22:40 UTC' },
    weather: { tempC: 26, windKnots: 20, windDir: 'E', waveHeightM: 1.6 }
  }
];
