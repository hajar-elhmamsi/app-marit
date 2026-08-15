import React, { useState } from 'react';
import {
  Box,
  AlertTriangle,
  Thermometer,
  FileText,
  ShieldAlert,
  Search,
  CheckCircle2,
  Info,
  Scale
} from 'lucide-react';
import { generateBayPlan, ContainerSlot, MOCK_BILL_OF_LADINGS, BillOfLading } from '../../data/mockCargo';
import { calculateStabilityGM } from '../../utils/maritimeMath';
import { sounds } from '../../utils/soundEffects';

export const ContainerStowage: React.FC = () => {
  const [selectedBay, setSelectedBay] = useState<number>(14);
  const [baySlots, setBaySlots] = useState<ContainerSlot[]>(() => generateBayPlan(14));
  const [selectedSlot, setSelectedSlot] = useState<ContainerSlot | null>(() => {
    const slots = generateBayPlan(14);
    return slots.find((s) => s.type === 'Dangerous (IMDG)') || slots[0];
  });
  const [activeSubTab, setActiveSubTab] = useState<'bay' | 'bl'>('bay');
  const [blSearch, setBlSearch] = useState<string>('');

  const handleBayChange = (bay: number) => {
    sounds.playButtonBeep();
    setSelectedBay(bay);
    const newSlots = generateBayPlan(bay);
    setBaySlots(newSlots);
    setSelectedSlot(newSlots.find((s) => s.type !== 'Empty') || null);
  };

  // Stability GM Calculation
  const totalWeight = baySlots.reduce((acc, s) => acc + s.weightTons, 0);
  const stability = calculateStabilityGM(180000, totalWeight, 8.9);

  const getContainerColor = (slot: ContainerSlot) => {
    if (slot.type === 'Empty') return 'rgba(255, 255, 255, 0.04)';
    if (slot.type === 'Dangerous (IMDG)') return '#f43f5e'; // Rose
    if (slot.type === 'Reefer (Cold-Chain)') return '#00f5d4'; // Cyan
    return '#38bdf8'; // Sky blue standard
  };

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
      {/* Top Header & Sub-Tab Switcher */}
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
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Container Stowage & Cargo Manifest</h2>
            <span className="badge badge-cyan">24,000 TEU CLASS</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Vessel: <strong>EVER APEX (IMO 9893890)</strong> | Voyage: <strong>VY-2026-08E</strong> | Rotterdam to Port Said
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className={`btn ${activeSubTab === 'bay' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { sounds.playButtonBeep(); setActiveSubTab('bay'); }}
          >
            <Box size={16} />
            <span>Bay Plan Grid</span>
          </button>
          <button
            className={`btn ${activeSubTab === 'bl' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { sounds.playButtonBeep(); setActiveSubTab('bl'); }}
          >
            <FileText size={16} />
            <span>Bill of Lading (B/L)</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'bay' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
          gap: '1.25rem'
        }}>
          {/* Left Bay View */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Bay Selector Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Select Vessel Bay:</span>
                {[2, 6, 10, 14, 18, 22, 26, 30].map((bay) => (
                  <button
                    key={bay}
                    onClick={() => handleBayChange(bay)}
                    className={`btn ${selectedBay === bay ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    Bay {bay < 10 ? `0${bay}` : bay}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#38bdf8', borderRadius: '2px' }} /> Standard
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#00f5d4', borderRadius: '2px' }} /> Reefer
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#f43f5e', borderRadius: '2px' }} /> IMDG Hazmat
                </span>
              </div>
            </div>

            {/* Visual 2D Bay Container Matrix */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowX: 'auto'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                --- ON DECK STACK (TIER 88 to 82) ---
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 48px)',
                gap: '6px',
                padding: '0.5rem'
              }}>
                {baySlots.map((slot, index) => {
                  const isSelected = selectedSlot?.containerId === slot.containerId && slot.type !== 'Empty';
                  const bg = getContainerColor(slot);
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (slot.type !== 'Empty') {
                          sounds.playSonarBlip();
                          setSelectedSlot(slot);
                        }
                      }}
                      style={{
                        width: '48px',
                        height: '34px',
                        borderRadius: '4px',
                        border: isSelected ? '2px solid #ffffff' : `1px solid ${slot.type === 'Empty' ? 'rgba(255,255,255,0.06)' : bg}`,
                        background: isSelected ? `${bg}ee` : `${bg}33`,
                        boxShadow: isSelected ? `0 0 12px ${bg}` : 'none',
                        cursor: slot.type !== 'Empty' ? 'pointer' : 'default',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      title={slot.containerId ? `${slot.containerId} (${slot.type}) - ${slot.weightTons} MT` : 'Empty Slot'}
                    >
                      {slot.type !== 'Empty' ? (
                        <>
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                            {slot.size === '40ft HC' ? '40H' : '20F'}
                          </span>
                          <span style={{ fontSize: '0.52rem', color: isSelected ? '#ffffff' : 'var(--text-secondary)' }}>
                            {slot.weightTons}t
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.1)' }}>·</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                --- UNDER DECK CARGO HOLD (TIER 06 to 02) ---
              </div>
            </div>

            {/* Vessel Stability Metrics Footer */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>METACENTRIC HEIGHT (GM)</div>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {stability.gm} m <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>({stability.status})</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>BAY TOTAL WEIGHT</div>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-cyan)' }}>
                  {totalWeight.toFixed(1)} MT
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>STOWAGE UTILIZATION</div>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  87.4%
                </div>
              </div>
            </div>
          </div>

          {/* Right Container Inspector */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Box size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.15rem' }}>Container Inspector</h3>
            </div>

            {selectedSlot && selectedSlot.containerId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="glass-card" style={{ padding: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                      {selectedSlot.containerId}
                    </span>
                    <span className="badge badge-emerald">{selectedSlot.status}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Bay: <strong>{selectedSlot.bay}</strong> | Row: <strong>{selectedSlot.row}</strong> | Tier: <strong>{selectedSlot.tier}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CONTAINER TYPE</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{selectedSlot.type}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>GROSS WEIGHT</div>
                    <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-cyan)', marginTop: '2px' }}>
                      {selectedSlot.weightTons} MT
                    </div>
                  </div>
                </div>

                {/* IMDG Dangerous Goods Alert */}
                {selectedSlot.imdgClass && (
                  <div className="glass-card" style={{
                    padding: '0.85rem',
                    background: 'rgba(244, 63, 94, 0.12)',
                    borderColor: 'var(--accent-rose)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <AlertTriangle size={16} />
                      <span>IMDG DANGEROUS GOODS</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '4px' }}>
                      {selectedSlot.imdgClass}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {selectedSlot.imdgDescription} - Segregation rule compliant.
                    </div>
                  </div>
                )}

                {/* Reefer Temperature Sensor */}
                {selectedSlot.reeferTempC !== undefined && (
                  <div className="glass-card" style={{
                    padding: '0.85rem',
                    background: 'rgba(0, 245, 212, 0.1)',
                    borderColor: 'var(--accent-cyan)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Thermometer size={16} />
                      <span>REEFER COLD-CHAIN TELEMETRY</span>
                    </div>
                    <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>
                      {selectedSlot.reeferTempC} °C
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      Set point: -21.0°C | Supply power active.
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Destination Port:</span>
                    <span style={{ fontWeight: 600 }}>{selectedSlot.destinationPort}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Shipper / Consignee:</span>
                    <span style={{ fontWeight: 600 }}>{selectedSlot.consignee}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                Select a container slot in the bay grid to inspect manifest telemetry.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Bill of Lading (B/L) Manager */
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.85rem',
              width: '320px'
            }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search B/L number, shipper, vessel..."
                value={blSearch}
                onChange={(e) => setBlSearch(e.target.value)}
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
            <span className="badge badge-emerald">Electronic B/L Validated</span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>B/L NUMBER</th>
                  <th style={{ padding: '0.75rem' }}>SHIPPER</th>
                  <th style={{ padding: '0.75rem' }}>CONSIGNEE</th>
                  <th style={{ padding: '0.75rem' }}>POL &rarr; POD</th>
                  <th style={{ padding: '0.75rem' }}>TEU COUNT</th>
                  <th style={{ padding: '0.75rem' }}>GROSS MT</th>
                  <th style={{ padding: '0.75rem' }}>CUSTOMS STATUS</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_BILL_OF_LADINGS.map((bl) => (
                  <tr key={bl.blNumber} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {bl.blNumber}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{bl.shipper}</td>
                    <td style={{ padding: '0.75rem' }}>{bl.consignee}</td>
                    <td style={{ padding: '0.75rem' }}>{bl.pol} &rarr; {bl.pod}</td>
                    <td style={{ padding: '0.75rem' }}>{bl.totalContainers}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>{bl.grossWeightMT} MT</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${bl.customsStatus === 'Cleared' ? 'badge-emerald' : 'badge-gold'}`}>
                        {bl.customsStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
