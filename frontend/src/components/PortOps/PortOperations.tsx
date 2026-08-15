import React, { useState } from 'react';
import {
  Anchor,
  Clock,
  Waves,
  Wind,
  Thermometer,
  Fuel,
  Ship,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { MAJOR_PORTS, PortCall } from '../../data/mockPorts';
import { sounds } from '../../utils/soundEffects';

interface BerthSlot {
  berthNumber: string;
  vesselName: string;
  type: string;
  etaTime: string;
  etdTime: string;
  status: 'All Fast (Discharging)' | 'Bunkering' | 'Pilot Boarded' | 'Scheduled';
  progressPct: number;
  craneCount: number;
}

export const PortOperations: React.FC = () => {
  const [selectedPort, setSelectedPort] = useState<PortCall>(MAJOR_PORTS[0]);

  const mockBerthSlots: BerthSlot[] = [
    { berthNumber: 'Berth 101-A', vesselName: 'EVER APEX', type: 'Container (24k TEU)', etaTime: '06:00 UTC', etdTime: '22:00 UTC', status: 'All Fast (Discharging)', progressPct: 68, craneCount: 6 },
    { berthNumber: 'Berth 102-B', vesselName: 'CMA CGM JACQUES SAADÉ', type: 'Container (23k TEU)', etaTime: '08:30 UTC', etdTime: '02:00 UTC+1', status: 'Bunkering', progressPct: 42, craneCount: 5 },
    { berthNumber: 'Berth 201-Oil', vesselName: 'PACIFIC ENTERPRISE', type: 'VLCC Crude Tanker', etaTime: '12:00 UTC', etdTime: '18:00 UTC+1', status: 'Pilot Boarded', progressPct: 15, craneCount: 2 },
    { berthNumber: 'Berth 304-Gas', vesselName: 'GASLOG WARSAW', type: 'LNG Carrier', etaTime: '16:00 UTC', etdTime: '08:00 UTC+1', status: 'Scheduled', progressPct: 0, craneCount: 0 }
  ];

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
      {/* Port Cards Carousel / Selector */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {MAJOR_PORTS.map((port) => {
          const isSelected = selectedPort.id === port.id;
          return (
            <div
              key={port.id}
              onClick={() => { sounds.playButtonBeep(); setSelectedPort(port); }}
              className="glass-panel"
              style={{
                minWidth: '240px',
                padding: '1rem',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(0, 245, 212, 0.1)' : 'var(--bg-glass)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{port.name}</span>
                <span className="mono badge badge-cyan">{port.code}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{port.country}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Berth Occupancy:</span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {port.berthsOccupied}/{port.berthsTotal} ({( (port.berthsOccupied / port.berthsTotal) * 100 ).toFixed(0)}%)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Anchorage Queue:</span>
                <span className="mono" style={{ color: 'var(--accent-cyan)' }}>{port.waitingVessels} Vessels</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Port Environmental & Operational HUD */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>{selectedPort.name} ({selectedPort.code}) - Harbor Master Telemetry</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Avg Turnaround Time: <strong>{selectedPort.averageTurnaroundHours} Hours</strong> | UN/LOCODE: <strong>{selectedPort.code}</strong>
            </p>
          </div>
          <span className="badge badge-emerald">PORT STATE CONTROL: NORMAL</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem'
        }}>
          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Waves size={14} color="var(--accent-cyan)" /> TIDE STATUS
            </div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-cyan)', margin: '0.2rem 0' }}>
              High {selectedPort.tidesM.high}m
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Next High: {selectedPort.tidesM.nextHighTime}</div>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Wind size={14} color="var(--accent-blue)" /> HARBOR WIND
            </div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.2rem 0' }}>
              {selectedPort.weather.windKnots} kts {selectedPort.weather.windDir}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Swell: {selectedPort.weather.waveHeightM}m</div>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Thermometer size={14} color="var(--accent-gold)" /> AMBIENT TEMP
            </div>
            <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.2rem 0' }}>
              {selectedPort.weather.tempC} °C
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Barometer: 1014.2 hPa</div>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Fuel size={14} color="var(--accent-emerald)" /> BUNKER FUELS
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              {selectedPort.bunkerAvailable.map((f) => (
                <span key={f} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Berth Allocation & Operations Gantt */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem' }}>Berth Allocation & Stevedoring Operations</h3>
          </div>
          <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shift: 06:00 - 18:00 UTC</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {mockBerthSlots.map((berth) => (
            <div
              key={berth.berthNumber}
              className="glass-card"
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className="mono" style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
                    {berth.berthNumber}
                  </span>
                  <strong style={{ fontSize: '1rem' }}>{berth.vesselName}</strong>
                  <span className="badge badge-blue">{berth.type}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-emerald">{berth.status}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ETA: {berth.etaTime} | ETD: {berth.etdTime}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Cranes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Cargo Handling Progress</span>
                    <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{berth.progressPct}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${berth.progressPct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-marine))',
                      boxShadow: '0 0 10px var(--accent-cyan-glow)'
                    }} />
                  </div>
                </div>

                {berth.craneCount > 0 && (
                  <span className="mono badge badge-gold" style={{ fontSize: '0.72rem' }}>
                    {berth.craneCount} STS Gantry Cranes Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
