import { Router } from 'express';
import { db } from '../db.js';

export const alarmsRouter = Router();

// GET all bridge alarms
alarmsRouter.get('/', (req, res) => {
  try {
    const alarmsStmt = db.prepare('SELECT * FROM bridge_alarms ORDER BY acknowledged ASC, id DESC');
    const rawAlarms = alarmsStmt.all() as any[];

    const formatted = rawAlarms.map((a) => ({
      id: a.id,
      timestamp: a.timestamp,
      level: a.level,
      source: a.source,
      vesselName: a.vessel_name,
      description: a.description,
      acknowledged: Boolean(a.acknowledged),
      actionRequired: a.action_required
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT acknowledge alarm
alarmsRouter.put('/:id/ack', (req, res) => {
  try {
    const updateStmt = db.prepare('UPDATE bridge_alarms SET acknowledged = 1 WHERE id = ?');
    updateStmt.run(req.params.id);
    res.json({ success: true, message: 'Alarm acknowledged' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST trigger GMDSS distress SOS
alarmsRouter.post('/sos', (req, res) => {
  try {
    const { type, vesselName, description } = req.body;
    const newId = `alm-${Date.now().toString().slice(-4)}`;
    const timestamp = new Date().toISOString().substring(11, 19) + ' UTC';

    const insertStmt = db.prepare(`
      INSERT INTO bridge_alarms (id, timestamp, level, source, vessel_name, description, acknowledged, action_required)
      VALUES (?, ?, 'CRITICAL', 'SAFETY_GMDSS', ?, ?, 0, 'Monitor VHF CH 16 emergency listening watch, muster emergency crew.')
    `);

    insertStmt.run(
      newId,
      timestamp,
      vesselName || 'FLAGSHIP',
      description || `GMDSS DISTRESS BROADCAST [${type}]: Inmarsat-C & VHF CH 70 DSC Activated.`
    );

    res.status(201).json({
      id: newId,
      timestamp,
      level: 'CRITICAL',
      source: 'SAFETY_GMDSS',
      vesselName: vesselName || 'FLAGSHIP',
      description: description || `GMDSS DISTRESS BROADCAST [${type}]`,
      acknowledged: false,
      actionRequired: 'Monitor VHF CH 16 emergency listening watch, muster emergency crew.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
