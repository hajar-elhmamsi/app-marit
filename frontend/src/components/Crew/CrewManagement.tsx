import React, { useState } from 'react';
import {
  Users,
  Award,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { MOCK_CREW, CrewMember } from '../../data/mockCrew';
import { sounds } from '../../utils/soundEffects';

export const CrewManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCrew, setSelectedCrew] = useState<CrewMember>(MOCK_CREW[0]);

  const filteredCrew = MOCK_CREW.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.vesselAssigned.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Crew Roster & STCW / MLC Compliance</h2>
            <span className="badge badge-cyan">MLC 2006 AUDITED</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Maritime Labour Convention Hours of Rest & STCW Certificate Monitoring
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.45rem 0.85rem',
          width: '280px'
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search crew name, rank, ship..."
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
      </div>

      {/* Main Grid: Roster List & Member Inspector */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
        gap: '1.25rem'
      }}>
        {/* Left Crew Table / Cards */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.1rem' }}>Active Shipboard Roster</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{filteredCrew.length} Seafarers Onboard</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredCrew.map((crew) => {
              const isSelected = selectedCrew.id === crew.id;
              return (
                <div
                  key={crew.id}
                  onClick={() => { sounds.playSonarBlip(); setSelectedCrew(crew); }}
                  className="glass-card"
                  style={{
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(0, 245, 212, 0.1)' : 'var(--bg-glass-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: 'var(--accent-blue)'
                    }}>
                      {crew.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>{crew.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {crew.rank} &bull; {crew.nationality}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{crew.vesselAssigned}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Since {crew.onboardSince}</div>
                    </div>

                    <span className={`badge ${crew.complianceMLC === 'Compliant' ? 'badge-emerald' : 'badge-rose'}`}>
                      {crew.complianceMLC}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Seafarer Profile & MLC Rest Hours */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem' }}>Seafarer Profile & Certificates</h3>
          </div>

          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>{selectedCrew.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{selectedCrew.rank}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Nationality: {selectedCrew.nationality} | Passport: <span className="mono">{selectedCrew.passportNo}</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Seaman's Discharge Book: <span className="mono">{selectedCrew.seamansBookNo}</span>
                </p>
              </div>
              <span className="badge badge-blue">{selectedCrew.department}</span>
            </div>
          </div>

          {/* MLC 2006 Rest Hours Box */}
          <div className="glass-card" style={{
            padding: '1rem',
            background: selectedCrew.complianceMLC === 'Compliant' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
            borderColor: selectedCrew.complianceMLC === 'Compliant' ? 'var(--accent-emerald-glow)' : 'var(--accent-rose-glow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700 }}>
                <Clock size={16} color={selectedCrew.complianceMLC === 'Compliant' ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
                <span>MLC 2006 HOURS OF REST</span>
              </div>
              <span className={`badge ${selectedCrew.complianceMLC === 'Compliant' ? 'badge-emerald' : 'badge-rose'}`}>
                {selectedCrew.complianceMLC}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>REST IN 24H (MIN 10H)</div>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedCrew.restHours24h < 10 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                  {selectedCrew.restHours24h} Hours
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>REST IN 7 DAYS (MIN 77H)</div>
                <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: selectedCrew.restHours7d < 77 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                  {selectedCrew.restHours7d} Hours
                </div>
              </div>
            </div>
          </div>

          {/* STCW Certificates List */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              STCW Endorsements & Competencies
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedCrew.certificates.map((cert) => (
                <div key={cert.code} style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{cert.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {cert.code} | Expires: {cert.expiryDate}</div>
                  </div>
                  <CheckCircle2 size={16} color="var(--accent-emerald)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
