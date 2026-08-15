import React, { useState } from 'react';
import {
  Ship,
  Gauge,
  Zap,
  Droplet,
  Flame,
  Wind,
  Shield,
  Activity,
  Layers,
  CheckCircle2,
  AlertOctagon,
  ArrowLeft
} from 'lucide-react';
import { Vessel } from '../../data/mockVessels';
import { formatNauticalCoords } from '../../utils/maritimeMath';
import { sounds } from '../../utils/soundEffects';

interface VesselDigitalTwinProps {
  vessel: Vessel;
  onBack: () => void;
}

export const VesselDigitalTwin: React.FC<VesselDigitalTwinProps> = ({ vessel, onBack }) => {
  const [engineState, setEngineState] = useState<'AUTO' | 'MANUAL' | 'ECO'>('ECO');
  const [rpmOffset, setRpmOffset] = useState<number>(0);

  const currentRpm = Math.max(0, vessel.telemetry.rpm + rpmOffset);
  const currentLoad = Math.min(100, Math.max(0, vessel.telemetry.engineLoadPct + rpmOffset * 0.8));
  const currentFuelFlow = Math.round(vessel.telemetry.fuelFlowLitersPerHour * (1 + rpmOffset * 0.015));

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => { sounds.playButtonBeep(); onBack(); }}
            className="btn btn-secondary btn-icon"
            title="Back to Fleet Overview"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.45rem', color: 'var(--text-primary)' }}>{vessel.name}</h2>
              <span className="badge badge-cyan">{vessel.type}</span>
              <span className="badge badge-emerald">DIGITAL TWIN SYNCHRONIZED</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              IMO: <span className="mono">{vessel.imo}</span> | Call Sign: <span className="mono">{vessel.callSign}</span> | Flag: {vessel.flag} | Class Survey: DNV-GL
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: '4px'
          }}>
            {(['ECO', 'AUTO', 'MANUAL'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { sounds.playButtonBeep(); setEngineState(mode); }}
                className={`btn ${engineState === mode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {mode} GOVERNOR
              </button>
            ))}
          </div>

          <button
            className="btn btn-tactical"
            onClick={() => {
              sounds.playSonarBlip();
              setRpmOffset((prev) => (prev >= 6 ? -6 : prev + 2));
            }}
          >
            <Activity size={16} />
            <span>Throttle Step ({rpmOffset >= 0 ? `+${rpmOffset}` : rpmOffset} RPM)</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Module 1: Main Engine Propulsion Diagnostics */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gauge size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem' }}>Main Engine (MAN B&W 2-Stroke)</h3>
            </div>
            <span className="live-dot" />
          </div>

          {/* RPM & Power Meters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SHAFT SPEED</div>
              <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.2rem 0' }}>
                {currentRpm.toFixed(0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RPM (Revs/min)</div>
            </div>

            <div className="glass-card" style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MCR ENGINE LOAD</div>
              <div className="mono" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.2rem 0' }}>
                {currentLoad.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Continuous Load</div>
            </div>
          </div>

          {/* Telemetry Metrics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fuel Flow Rate:</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--text-cyan)' }}>{currentFuelFlow.toLocaleString()} L/h</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shaft Power Output:</span>
              <span className="mono" style={{ fontWeight: 700 }}>{(vessel.telemetry.shaftPowerKW / 1000).toFixed(1)} MW ({((vessel.telemetry.shaftPowerKW * 1.341) / 1000).toFixed(1)}k BHP)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Turbocharger Boost:</span>
              <span className="mono" style={{ fontWeight: 700 }}>{vessel.telemetry.turboPressureBar} bar</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Scavenge Air Temp:</span>
              <span className="mono" style={{ fontWeight: 700 }}>42.5 °C</span>
            </div>
          </div>
        </div>

        {/* Module 2: Cylinder Thermal Balance (12-Cylinder Graph) */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flame size={20} color="var(--accent-rose)" />
              <h3 style={{ fontSize: '1.1rem' }}>Cylinder Exhaust Temps (°C)</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Avg: {vessel.telemetry.exhaustTempAvgC}°C</span>
          </div>

          {/* Bar chart representation */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '140px',
            padding: '0.5rem 0.25rem',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: '4px'
          }}>
            {vessel.telemetry.cylinders.map((temp, i) => {
              const heightPct = Math.min(100, Math.max(10, ((temp - 300) / 150) * 100));
              const isHot = temp > 392;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.62rem', color: isHot ? 'var(--accent-rose)' : 'var(--text-muted)', marginBottom: '3px' }}>
                    {temp}
                  </span>
                  <div style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    borderRadius: '3px 3px 0 0',
                    background: isHot 
                      ? 'linear-gradient(180deg, #f43f5e, #be123c)' 
                      : 'linear-gradient(180deg, var(--accent-cyan), var(--accent-marine))',
                    transition: 'all 0.4s ease'
                  }} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    #{i + 1}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Deviation Range: ±4.2°C</span>
            <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={13} />
              Thermal Balance Normal
            </span>
          </div>
        </div>

        {/* Module 3: Bunker & Ballast Tank Management */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplet size={20} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '1.1rem' }}>Tank Telemetry & Volumes</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', height: '140px' }}>
            {[
              { name: 'HFO / VLSFO', pct: vessel.telemetry.tanks.hfoPct, color: '#f59e0b', capacity: '7,200 MT' },
              { name: 'MGO', pct: vessel.telemetry.tanks.mgoPct, color: '#38bdf8', capacity: '1,450 MT' },
              { name: 'Fresh Water', pct: vessel.telemetry.tanks.freshWaterPct, color: '#00f5d4', capacity: '850 MT' },
              { name: 'Ballast Water', pct: vessel.telemetry.tanks.ballastPct, color: '#a855f7', capacity: '42,000 MT' }
            ].map((tank) => (
              <div key={tank.name} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.4rem',
                border: '1px solid var(--border-subtle)',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>{tank.name}</span>
                
                <div style={{
                  width: '28px',
                  height: '70px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end'
                }}>
                  <div style={{
                    width: '100%',
                    height: `${tank.pct}%`,
                    background: tank.color,
                    boxShadow: `0 0 10px ${tank.color}88`,
                    transition: 'height 0.6s ease'
                  }} />
                </div>

                <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: tank.color }}>
                  {tank.pct}%
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Trim: 0.4m By Stern</span>
            <span>List / Heel: 0.0° Even Keel</span>
          </div>
        </div>

        {/* Module 4: IMO CII & Decarbonization Status */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '1.1rem' }}>IMO CII & Decarbonization</h3>
            </div>
            <span className="badge badge-emerald">IMO Tier III</span>
          </div>

          {/* Rating Scale Bar */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
            {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => {
              const isCurrent = vessel.ciiRating === grade;
              return (
                <div
                  key={grade}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0.4rem 0',
                    borderRadius: 'var(--radius-sm)',
                    background: isCurrent ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                    color: isCurrent ? '#050b14' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    boxShadow: isCurrent ? '0 0 14px var(--accent-cyan-glow)' : 'none'
                  }}
                >
                  {grade}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Voyage CO2 Footprint:</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--text-cyan)' }}>{vessel.co2PerVoyageTons} MT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>EU ETS Carbon Price:</span>
              <span className="mono" style={{ fontWeight: 700 }}>€{(vessel.co2PerVoyageTons * 72).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>EEXI Energy Efficiency Index:</span>
              <span className="mono" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>Compliant (3.82 g/t·nm)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
