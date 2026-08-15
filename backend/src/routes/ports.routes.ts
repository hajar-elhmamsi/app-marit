import { Router } from 'express';
import { db } from '../db.js';

export const portsRouter = Router();

// GET all ports
portsRouter.get('/', (req, res) => {
  try {
    const portsStmt = db.prepare('SELECT * FROM ports');
    const rawPorts = portsStmt.all() as any[];

    const formatted = rawPorts.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      country: p.country,
      lat: p.lat,
      lng: p.lng,
      berthsTotal: p.berths_total,
      berthsOccupied: p.berths_occupied,
      waitingVessels: p.waiting_vessels,
      averageTurnaroundHours: p.average_turnaround_hours,
      bunkerAvailable: JSON.parse(p.bunker_available || '["VLSFO","MGO"]'),
      tidesM: { high: p.tide_high, low: p.tide_low, nextHighTime: p.next_high_time },
      weather: { tempC: p.temp_c, windKnots: p.wind_knots, windDir: p.wind_dir, waveHeightM: p.wave_height_m }
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
