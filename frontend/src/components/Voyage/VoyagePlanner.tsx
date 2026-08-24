import React, { useState } from 'react';
import {
  Route,
  Navigation,
  Compass,
  Clock,
  Droplet,
  DollarSign,
  Leaf,
  Sliders,
  Wind,
  ShieldCheck
} from 'lucide-react';
import { MAJOR_PORTS } from '../../data/mockPorts';
import { calculateNauticalDistance, calculateBearing } from '../../utils/maritimeMath';
import { sounds } from '../../utils/soundEffects';

interface Waypoint {
  name: string;
  lat: number;
  lng: number;
}

export const VoyagePlanner: React.FC = () => {
  const [originPortCode, setOriginPortCode] = useState<string>('MACAS');
  const [destPortCode, setDestPortCode] = useState<string>('MACAS');
  const [steamingSpeed, setSteamingSpeed] = useState<number>(17.5); // Knots

  const originPort = MAJOR_PORTS.find((p) => p.code === originPortCode) || MAJOR_PORTS[0];
  const destPort = MAJOR_PORTS.find((p) => p.code === destPortCode) || MAJOR_PORTS[0];

  // Mock passage waypoints
  const waypoints: Waypoint[] = [
    { name: `Port of ${originPort.name}`, lat: originPort.lat, lng: originPort.lng },
    { name: 'English Channel TSS (Dover)', lat: 51.15, lng: 1.45 },
    { name: 'Ushant TSS (Finistère)', lat: 48.65, lng: -5.4 },
    { name: 'Cape Finisterre Traffic Separation', lat: 43.1, lng: -9.5 },
    { name: 'Strait of Gibraltar (Tarifa Passage)', lat: 36.0, lng: -5.6 },
    { name: 'Sicily Channel (Pantelleria)', lat: 36.8, lng: 12.0 },
    { name: 'Crete South Marine Corridor', lat: 34.5, lng: 25.0 },
    { name: `Arrival ${destPort.name}`, lat: destPort.lat, lng: destPort.lng }
  ];

  // Calculate passage legs
  let totalDistanceNM = 0;
  const legs = waypoints.slice(0, -1).map((wp, idx) => {
    const nextWp = waypoints[idx + 1];
    const dist = calculateNauticalDistance(
      { lat: wp.lat, lng: wp.lng },
      { lat: nextWp.lat, lng: nextWp.lng }
    );
    const brng = calculateBearing(
      { lat: wp.lat, lng: wp.lng },
      { lat: nextWp.lat, lng: nextWp.lng }
    );
    totalDistanceNM += dist;
    const hours = parseFloat((dist / steamingSpeed).toFixed(1));
    return {
      from: wp.name,
      to: nextWp.name,
      distanceNM: dist,
      bearing: brng,
      hours
    };
  });

  // Steaming time & bunker calculations
  // Fuel consumption ~ k * Speed^3 (Cubic law)
  const totalSteamingHours = totalDistanceNM / steamingSpeed;
  const daysEnroute = (totalSteamingHours / 24).toFixed(1);
  const tonsPerDay = Math.pow(steamingSpeed / 18, 3) * 65; // ~65 MT/day at 18 knots
  const totalBunkerTons = Math.round((totalSteamingHours / 24) * tonsPerDay);
  const bunkerPricePerTon = 620; // $ USD
  const totalBunkerCost = totalBunkerTons * bunkerPricePerTon;
  const totalCO2Tons = Math.round(totalBunkerTons * 3.114);

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
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Nautical Passage & Weather Routing</h2>
            <span className="badge badge-cyan">GREAT CIRCLE / RHUMB LINE</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Voyage Optimization Algorithm | Bunker & CII Minimization Engine
          </p>
        </div>

        {/* Port Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FROM:</span>
            <select
              value={originPortCode}
              onChange={(e) => { sounds.playButtonBeep(); setOriginPortCode(e.target.value); }}
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '0.4rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              {MAJOR_PORTS.map((p) => (
                <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>

          <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>&rarr;</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TO:</span>
            <select
              value={destPortCode}
              onChange={(e) => { sounds.playButtonBeep(); setDestPortCode(e.target.value); }}
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '0.4rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              {MAJOR_PORTS.map((p) => (
                <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Speed & Bunker Optimizer Slider */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem' }}>Speed vs. Bunker Optimization Profile</h3>
          </div>
          <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {steamingSpeed.toFixed(1)} Knots
          </span>
        </div>

        <input
          type="range"
          min="12.0"
          max="22.0"
          step="0.5"
          value={steamingSpeed}
          onChange={(e) => setSteamingSpeed(parseFloat(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--accent-cyan)',
            cursor: 'pointer'
          }}
        />

        {/* Dynamic Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Navigation size={14} /> TOTAL PASSAGE DISTANCE
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {totalDistanceNM.toLocaleString()} NM
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Nautical Miles Great Circle</div>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Clock size={14} /> DURATION ENROUTE
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', margin: '0.2rem 0' }}>
              {daysEnroute} Days
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{totalSteamingHours.toFixed(0)} Steaming Hours</div>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Droplet size={14} /> BUNKER VLSFO
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)', margin: '0.2rem 0' }}>
              {totalBunkerTons.toLocaleString()} MT
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>~{tonsPerDay.toFixed(1)} MT / Day @ {steamingSpeed} kts</div>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <DollarSign size={14} /> BUNKER EXPENSE
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)', margin: '0.2rem 0' }}>
              ${totalBunkerCost.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>@ $620 / MT VLSFO</div>
          </div>

          <div className="glass-card" style={{ padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <Leaf size={14} /> CO2 EMISSIONS
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-blue)', margin: '0.2rem 0' }}>
              {totalCO2Tons.toLocaleString()} MT
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>IMO CII Grade A Target</div>
          </div>
        </div>
      </div>

      {/* Waypoint Passage Table */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem' }}>Passage Plan Waypoints & Navigational Legs</h3>
          </div>
          <span className="badge badge-emerald">SOLAS Chapter V Compliant</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>LEG</th>
                <th style={{ padding: '0.75rem' }}>WAYPOINT DEPARTURE &rarr; ARRIVAL</th>
                <th style={{ padding: '0.75rem' }}>LEG DISTANCE</th>
                <th style={{ padding: '0.75rem' }}>TRUE BEARING</th>
                <th style={{ padding: '0.75rem' }}>EST. STEAMING TIME</th>
              </tr>
            </thead>
            <tbody>
              {legs.map((leg, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    Leg {index + 1}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{leg.from}</strong> &rarr; {leg.to}
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {leg.distanceNM} NM
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                    {leg.bearing}° True
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                    {leg.hours} hrs ({(leg.hours / 24).toFixed(1)} d)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
