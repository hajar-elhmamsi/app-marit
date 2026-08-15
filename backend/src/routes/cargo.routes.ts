import { Router } from 'express';
import { db } from '../db.js';

export const cargoRouter = Router();

// GET container bay plan
cargoRouter.get('/bay/:bayNumber', (req, res) => {
  try {
    const bayNum = parseInt(req.params.bayNumber, 10) || 14;
    const rows = [6, 4, 2, 0, 1, 3, 5];
    const tiers = [88, 86, 84, 82, 6, 4, 2];
    const destinations = ['Rotterdam', 'Port Said', 'Hamburg', 'Singapore', 'Antwerp'];
    const shippers = ['Tesla Giga Logistics', 'Samsung Semi', 'Pfizer Pharma', 'IKEA Supply AG', 'BMW Group'];

    const slots: any[] = [];
    let counter = 100;

    for (const tier of tiers) {
      for (const row of rows) {
        counter++;
        const isOccupied = (row + tier + bayNum) % 5 !== 0;
        if (!isOccupied) {
          slots.push({
            bay: bayNum,
            row,
            tier,
            size: 'Empty',
            weightTons: 0,
            type: 'Empty',
            destinationPort: '-',
            consignee: '-',
            status: 'Transit'
          });
          continue;
        }

        const isReefer = (counter % 7 === 0);
        const isDangerous = (counter % 11 === 0);
        const is40 = (row % 2 === 0);

        slots.push({
          bay: bayNum,
          row,
          tier,
          containerId: `MSKU-${counter * 41 + 1000}`,
          size: is40 ? '40ft HC' : '20ft',
          weightTons: parseFloat((14 + (counter % 16)).toFixed(1)),
          type: isDangerous ? 'Dangerous (IMDG)' : (isReefer ? 'Reefer (Cold-Chain)' : 'Dry Standard'),
          imdgClass: isDangerous ? (counter % 2 === 0 ? 'Class 3 - Flammable Liquid' : 'Class 8 - Corrosives') : undefined,
          imdgDescription: isDangerous ? 'UN 1993 / Flashpoint 18°C' : undefined,
          reeferTempC: isReefer ? -20.5 : undefined,
          destinationPort: destinations[counter % destinations.length],
          consignee: shippers[counter % shippers.length],
          status: counter % 9 === 0 ? 'Hold-Inspect' : 'Loaded'
        });
      }
    }

    res.json(slots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET all Bills of Lading
cargoRouter.get('/bills-of-lading', (req, res) => {
  try {
    const blStmt = db.prepare('SELECT * FROM bills_of_lading');
    const rawBls = blStmt.all() as any[];

    const formatted = rawBls.map((b) => ({
      blNumber: b.bl_number,
      shipper: b.shipper,
      consignee: b.consignee,
      vesselName: b.vessel_name,
      voyageNumber: b.voyage_number,
      pol: b.pol,
      pod: b.pod,
      totalContainers: b.total_containers,
      grossWeightMT: b.gross_weight_mt,
      customsStatus: b.customs_status,
      issueDate: b.issue_date
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
