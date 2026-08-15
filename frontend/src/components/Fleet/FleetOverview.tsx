import React, { useState } from 'react';
import {
  Ship,
  Search,
  Filter,
  Compass,
  Gauge,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { Vessel } from '../../data/mockVessels';
import { sounds } from '../../utils/soundEffects';

interface FleetOverviewProps {
  vessels: Vessel[];
  onSelectVesselOnMap: (vessel: Vessel) => void;
  onInspectDigitalTwin: (vessel: Vessel) => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({
  vessels,
  onSelectVesselOnMap,
  onInspectDigitalTwin
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filtered vessels
  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.imo.includes(searchTerm) ||
      v.flag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalDWT = vessels.reduce((acc, v) => acc + v.dwt, 0);
  const underwayCount = vessels.filter((v) => v.status === 'Underway').length;
  const avgSpeed = (
    vessels.reduce((acc, v) => acc + v.speedKnots, 0) / vessels.length
  ).toFixed(1);

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
      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL FLEET ACTIVE</span>
            <Ship size={18} color="var(--accent-cyan)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.3rem 0' }}>
            {vessels.length} <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>({underwayCount} Underway)</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>100% AIS Satellite Tracking</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FLEET TONNAGE (DWT)</span>
            <TrendingUp size={18} color="var(--accent-gold)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.3rem 0' }}>
            {(totalDWT / 1000).toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>k DWT</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Combined Merchant Deadweight</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVERAGE STEAMING SPEED</span>
            <Zap size={18} color="var(--accent-blue)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.3rem 0' }}>
            {avgSpeed} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>knots</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Eco-Speed Speed Profile Optimized</div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FLEET CII COMPLIANCE</span>
            <ShieldCheck size={18} color="var(--accent-emerald)" />
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.3rem 0' }}>
            94.5% <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Grade A-B</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>IMO 2026 Carbon Target Aligned</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.45rem 0.85rem',
          minWidth: '280px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by ship name, IMO, port, flag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
        </div>

        {/* Type & Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Ship Classes</option>
            <option value="Container">Container Vessels</option>
            <option value="Oil Tanker">Oil Tankers</option>
            <option value="Bulk Carrier">Bulk Carriers</option>
            <option value="LNG Carrier">LNG Carriers</option>
            <option value="Tug / Salvage">Tugs & Salvage</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Underway">Underway</option>
            <option value="Moored">Moored</option>
            <option value="At Anchor">At Anchor</option>
          </select>
        </div>
      </div>

      {/* Vessel Grid Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredVessels.map((v) => (
          <div
            key={v.id}
            className="glass-panel glass-panel-hover"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{v.name}</h3>
                  <span className="badge badge-cyan">{v.type}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  IMO: <span className="mono">{v.imo}</span> | Flag: <strong>{v.flag}</strong>
                </div>
              </div>
              <span className="badge badge-emerald">Grade {v.ciiRating}</span>
            </div>

            {/* Vessel Specs Quick Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.22)',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SPEED</div>
                <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {v.speedKnots} kts
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DRAUGHT</div>
                <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {v.draughtM}m
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DWT CAPACITY</div>
                <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {(v.dwt / 1000).toFixed(0)}k MT
                </div>
              </div>
            </div>

            {/* Current Route */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Route: <strong>{v.originCode} &rarr; {v.destCode}</strong></span>
                <span style={{ color: 'var(--accent-cyan)' }}>ETA: {v.eta.split(' ')[0]}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Dest: {v.destination}
              </div>
            </div>

            {/* Engine Quick Telemetry */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
              <span>Main Engine: <strong style={{ color: 'var(--accent-cyan)' }}>{v.telemetry.rpm} RPM</strong></span>
              <span>Flow: <strong>{v.telemetry.fuelFlowLitersPerHour} L/h</strong></span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  sounds.playButtonBeep();
                  onSelectVesselOnMap(v);
                }}
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.78rem' }}
              >
                <Compass size={15} />
                <span>Locate on Map</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  sounds.playButtonBeep();
                  onInspectDigitalTwin(v);
                }}
                style={{ flex: 1, padding: '0.55rem', fontSize: '0.78rem' }}
              >
                <Gauge size={15} />
                <span>Digital Twin</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
