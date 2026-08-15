import React, { useState } from 'react';
import {
  Leaf,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Fuel,
  Activity,
  Award,
  Zap
} from 'lucide-react';
import { Vessel } from '../../data/mockVessels';
import { sounds } from '../../utils/soundEffects';

interface CIIAnalyticsProps {
  vessels: Vessel[];
}

export const CIIAnalytics: React.FC<CIIAnalyticsProps> = ({ vessels }) => {
  const [carbonTaxRateEur, setCarbonTaxRateEur] = useState<number>(75); // € per MT CO2

  const totalCO2FleetTons = vessels.reduce((acc, v) => acc + v.co2PerVoyageTons, 0);
  const totalCarbonTaxEur = totalCO2FleetTons * carbonTaxRateEur;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Decarbonization, IMO CII & EU ETS Intelligence</h2>
            <span className="badge badge-emerald">ESG COMPLIANCE</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            IMO Carbon Intensity Indicator (CII) & European Union Emissions Trading System (EU ETS)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-cyan">IMO 2030 GOAL: -40% CARBON INTENSITY</span>
        </div>
      </div>

      {/* Fleet Carbon KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FLEET CO2 EMISSIONS</span>
            <Leaf size={18} color="var(--accent-emerald)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.3rem 0' }}>
            {totalCO2FleetTons.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>MT</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Current Voyage Aggregate Footprint</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EU ETS EXPOSURE</span>
            <DollarSign size={18} color="var(--accent-gold)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.3rem 0' }}>
            €{totalCarbonTaxEur.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>@ €{carbonTaxRateEur}/MT EUA Carbon Price</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVERAGE FLEET CII</span>
            <Award size={18} color="var(--accent-cyan)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.3rem 0' }}>
            Grade A (94.2%)
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Superior Efficiency Bracket</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CLEAN FUEL PENETRATION</span>
            <Zap size={18} color="var(--accent-blue)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.3rem 0' }}>
            28.5%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Dual-Fuel LNG & Biofuel Fleet</div>
        </div>
      </div>

      {/* Vessel-by-Vessel CII Table */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem' }}>Fleet IMO CII Performance Matrix</h3>
          </div>
          <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>IMO MEPC.336(76) Standard</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>VESSEL NAME</th>
                <th style={{ padding: '0.75rem' }}>TYPE & DWT</th>
                <th style={{ padding: '0.75rem' }}>FUEL PROFILE</th>
                <th style={{ padding: '0.75rem' }}>VOYAGE CO2</th>
                <th style={{ padding: '0.75rem' }}>EU ETS COST (€75/t)</th>
                <th style={{ padding: '0.75rem' }}>CII GRADE</th>
                <th style={{ padding: '0.75rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {vessels.map((v) => {
                const getGradeClass = (g: string) => {
                  if (g === 'A' || g === 'B') return 'badge-emerald';
                  if (g === 'C') return 'badge-cyan';
                  return 'badge-rose';
                };

                return (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {v.name}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {v.type} ({(v.dwt / 1000).toFixed(0)}k DWT)
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {v.name.includes('JACQUES') ? 'Dual-Fuel LNG' : 'VLSFO + MGO'}
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {v.co2PerVoyageTons} MT
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                      €{(v.co2PerVoyageTons * carbonTaxRateEur).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${getGradeClass(v.ciiRating)}`} style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                        Grade {v.ciiRating}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: 'var(--accent-emerald)', fontSize: '0.76rem', fontWeight: 600 }}>
                        &check; Fully Compliant
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alternative Marine Fuel Comparison */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Fuel size={20} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem' }}>Alternative Marine Fuels & Well-to-Wake Carbon Reduction</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { fuel: 'VLSFO 0.5% Sulphur', reduction: '0% (Baseline)', cost: '$620 / MT', readiness: 'Current Global Standard', color: '#94a3b8' },
            { fuel: 'Liquefied Natural Gas (LNG)', reduction: '-23% CO2 / -99% SOx', cost: '$710 / MT', readiness: 'Commercial Maturity', color: '#00f5d4' },
            { fuel: 'Bio-MGO / Biofuel B30', reduction: '-85% Well-to-Wake', cost: '$980 / MT', readiness: 'Drop-in Ready', color: '#10b981' },
            { fuel: 'Green Methanol / Ammonia', reduction: '-95% Net Zero', cost: '$1,250 / MT', readiness: 'Newbuild Fleet 2026+', color: '#38bdf8' }
          ].map((f) => (
            <div key={f.fuel} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <strong style={{ fontSize: '0.95rem', color: f.color }}>{f.fuel}</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>CO2 Reduction: <strong>{f.reduction}</strong></div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Avg Bunker Cost: {f.cost}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: 'auto', paddingTop: '0.4rem' }}>{f.readiness}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
