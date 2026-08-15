import { Router } from 'express';
import { db } from '../db.js';

export const vesselsRouter = Router();

// GET all vessels with joined telemetry
vesselsRouter.get('/', (req, res) => {
  try {
    const vesselsStmt = db.prepare('SELECT * FROM vessels');
    const rawVessels = vesselsStmt.all() as any[];

    const results = rawVessels.map((v) => {
      // Get telemetry
      const telStmt = db.prepare('SELECT * FROM vessel_telemetry WHERE vessel_id = ?');
      const tel = (telStmt.get(v.id) as any) || {
        rpm: 75,
        engine_load_pct: 80,
        fuel_flow_liters_per_hour: 3000,
        turbo_pressure_bar: 2.5,
        exhaust_temp_avg_c: 380,
        shaft_power_kw: 50000,
        hfo_pct: 75,
        mgo_pct: 90,
        fresh_water_pct: 85,
        ballast_pct: 35
      };

      // Get cylinders
      const cylStmt = db.prepare('SELECT temp_c FROM cylinder_telemetry WHERE vessel_id = ? ORDER BY cylinder_number ASC');
      const cylinders = (cylStmt.all(v.id) as any[]).map((c) => c.temp_c);
      const fallbackCylinders = cylinders.length > 0 ? cylinders : [380, 385, 382, 386, 384, 388, 383, 387];

      // Route waypoints mock coordinates
      const waypoints = [
        [v.lat - 2, v.lng - 3],
        [v.lat, v.lng],
        [v.lat + 3, v.lng + 5]
      ];

      return {
        id: v.id,
        name: v.name,
        imo: v.imo,
        mmsi: v.mmsi,
        callSign: v.call_sign,
        flag: v.flag,
        flagCode: v.flag_code,
        type: v.type,
        dwt: v.dwt,
        lengthM: v.length_m,
        beamM: v.beam_m,
        draughtM: v.draught_m,
        maxDraughtM: v.max_draught_m,
        lat: v.lat,
        lng: v.lng,
        course: v.course,
        speedKnots: v.speed_knots,
        status: v.status,
        origin: v.origin,
        originCode: v.origin_code,
        destination: v.destination,
        destCode: v.dest_code,
        eta: v.eta,
        ciiRating: v.cii_rating,
        co2PerVoyageTons: v.co2_per_voyage_tons,
        telemetry: {
          rpm: tel.rpm,
          engineLoadPct: tel.engine_load_pct,
          fuelFlowLitersPerHour: tel.fuel_flow_liters_per_hour,
          turboPressureBar: tel.turbo_pressure_bar,
          exhaustTempAvgC: tel.exhaust_temp_avg_c,
          shaftPowerKW: tel.shaft_power_kw,
          cylinders: fallbackCylinders,
          tanks: {
            hfoPct: tel.hfo_pct,
            mgoPct: tel.mgo_pct,
            freshWaterPct: tel.fresh_water_pct,
            ballastPct: tel.ballast_pct
          }
        },
        routeWaypoints: waypoints
      };
    });

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single vessel
vesselsRouter.get('/:id', (req, res) => {
  try {
    const vesselStmt = db.prepare('SELECT * FROM vessels WHERE id = ?');
    const vessel = vesselStmt.get(req.params.id) as any;
    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(vessel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update telemetry / position
vesselsRouter.put('/:id/telemetry', (req, res) => {
  try {
    const { rpm, engineLoadPct, fuelFlowLitersPerHour, lat, lng, course } = req.body;
    
    if (lat !== undefined && lng !== undefined) {
      const updatePos = db.prepare('UPDATE vessels SET lat = ?, lng = ?, course = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      updatePos.run(lat, lng, course || 0, req.params.id);
    }

    if (rpm !== undefined) {
      const updateTel = db.prepare('UPDATE vessel_telemetry SET rpm = ?, engine_load_pct = ?, fuel_flow_liters_per_hour = ?, updated_at = CURRENT_TIMESTAMP WHERE vessel_id = ?');
      updateTel.run(rpm, engineLoadPct || 80, fuelFlowLitersPerHour || 3000, req.params.id);
    }

    res.json({ success: true, message: 'Telemetry updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
