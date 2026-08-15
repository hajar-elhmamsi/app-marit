import { Router } from 'express';
import { db } from '../db.js';

export const crewRouter = Router();

// GET all crew with certificates
crewRouter.get('/', (req, res) => {
  try {
    const crewStmt = db.prepare('SELECT * FROM crew_members');
    const rawCrew = crewStmt.all() as any[];

    const results = rawCrew.map((c) => {
      const certStmt = db.prepare('SELECT title, code, issue_date, expiry_date, is_valid FROM crew_certificates WHERE crew_id = ?');
      const certs = (certStmt.all(c.id) as any[]).map((cert) => ({
        title: cert.title,
        code: cert.code,
        issueDate: cert.issue_date,
        expiryDate: cert.expiry_date,
        isValid: Boolean(cert.is_valid)
      }));

      return {
        id: c.id,
        name: c.name,
        rank: c.rank,
        department: c.department,
        nationality: c.nationality,
        flagCode: c.flag_code,
        passportNo: c.passport_no,
        seamansBookNo: c.seamans_book_no,
        vesselAssigned: c.vessel_assigned,
        onboardSince: c.onboard_since,
        restHours24h: c.rest_hours_24h,
        restHours7d: c.rest_hours_7d,
        complianceMLC: c.compliance_mlc,
        certificates: certs
      };
    });

    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update crew rest hours
crewRouter.put('/:id/rest-hours', (req, res) => {
  try {
    const { restHours24h, restHours7d } = req.body;
    const compliance = restHours24h >= 10 && restHours7d >= 77 ? 'Compliant' : 'Warning';

    const updateStmt = db.prepare('UPDATE crew_members SET rest_hours_24h = ?, rest_hours_7d = ?, compliance_mlc = ? WHERE id = ?');
    updateStmt.run(restHours24h, restHours7d, compliance, req.params.id);

    res.json({ success: true, compliance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
