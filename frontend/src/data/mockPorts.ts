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
    id: 'port-casablanca',
    name: 'Port de Casablanca',
    code: 'MACAS',
    country: 'Morocco',
    lat: 33.5731,
    lng: -7.5898,
    berthsTotal: 5,
    berthsOccupied: 3,
    waitingVessels: 2,
    averageTurnaroundHours: 24.0,
    bunkerAvailable: ['VLSFO', 'MGO'],
    tidesM: { high: 2.1, low: 0.4, nextHighTime: '18:45 UTC' },
    weather: { tempC: 24, windKnots: 14, windDir: 'W', waveHeightM: 0.8 }
  }
];
