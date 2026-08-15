import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Bell,
  CheckCircle2,
  VolumeX,
  Send,
  LifeBuoy,
  Flame,
  AlertOctagon,
  HelpCircle
} from 'lucide-react';
import { BridgeAlarm } from '../../data/mockAlarms';
import { sounds } from '../../utils/soundEffects';

interface GMDSSCenterProps {
  alarms: BridgeAlarm[];
  onAcknowledgeAlarm: (id: string) => void;
  onTriggerSOS: (type: 'MAYDAY' | 'PAN-PAN' | 'EPIRB') => void;
}

export const GMDSSCenter: React.FC<GMDSSCenterProps> = ({
  alarms,
  onAcknowledgeAlarm,
  onTriggerSOS
}) => {
  const [distressNature, setDistressNature] = useState<string>('Collision Risk / Flooding');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  const handleBroadcast = (type: 'MAYDAY' | 'PAN-PAN' | 'EPIRB') => {
    sounds.playAlertAlarm();
    onTriggerSOS(type);
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 5000);
  };

  const getLevelBadge = (level: BridgeAlarm['level']) => {
    switch (level) {
      case 'CRITICAL': return <span className="badge badge-rose">CRITICAL ALARM</span>;
      case 'WARNING': return <span className="badge badge-gold">WARNING</span>;
      default: return <span className="badge badge-cyan">ADVISORY</span>;
    }
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
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        borderColor: 'var(--accent-rose)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f43f5e, #be123c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--accent-rose-glow)'
          }}>
            <ShieldAlert size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 style={{ fontSize: '1.45rem', color: 'var(--text-primary)' }}>GMDSS Emergency & Bridge Alarm Center</h2>
              <span className="live-dot alarm" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Global Maritime Distress and Safety System (VHF CH 16 / MF 2182 kHz / DSC Relay)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="mono badge badge-cyan">DSC CHANNEL 70 READY</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(340px, 1fr)',
        gap: '1.25rem'
      }}>
        {/* Left Alarm Matrix */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} color="var(--accent-rose)" />
              <h3 style={{ fontSize: '1.15rem' }}>Active Bridge Alarm Matrix</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {alarms.filter((a) => !a.acknowledged).length} Unacknowledged
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="glass-card"
                style={{
                  padding: '1rem',
                  borderColor: !alarm.acknowledged ? 'var(--accent-rose)' : 'var(--border-subtle)',
                  background: !alarm.acknowledged ? 'rgba(244, 63, 94, 0.08)' : 'var(--bg-glass-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getLevelBadge(alarm.level)}
                    <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{alarm.timestamp}</span>
                    <strong style={{ fontSize: '0.88rem' }}>{alarm.vesselName}</strong>
                  </div>

                  {!alarm.acknowledged ? (
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        sounds.playButtonBeep();
                        onAcknowledgeAlarm(alarm.id);
                      }}
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Acknowledge Alarm</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Acknowledged
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {alarm.description}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem' }}>
                  Required Action: <em>{alarm.actionRequired}</em>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right GMDSS Distress Broadcast Console */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={20} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '1.15rem' }}>GMDSS Distress Transmission</h3>
          </div>

          {broadcastSent && (
            <div className="glass-card" style={{
              background: 'rgba(16, 185, 129, 0.2)',
              borderColor: 'var(--accent-emerald)',
              padding: '0.85rem',
              color: 'var(--accent-emerald)',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} />
              <span>DISTRESS ALERT TRANSMITTED ACROSS INMARSAT-C & VHF CH 70 DSC!</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Nature of Distress Incident:</label>
            <select
              value={distressNature}
              onChange={(e) => setDistressNature(e.target.value)}
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value="Collision Risk / Flooding">Collision Risk / Ingress of Water</option>
              <option value="Fire / Explosion in Hold">Fire / Explosion in Cargo Hold</option>
              <option value="Man Overboard (MOB)">Man Overboard (MOB SAR Procedure)</option>
              <option value="Main Engine Blackout / Drifting">Main Engine Blackout / Uncommanded Drifting</option>
              <option value="Piracy Attack / Security Incident">Security Incident / Piracy Repulsion</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Mayday Button */}
            <button
              className="btn btn-danger"
              onClick={() => handleBroadcast('MAYDAY')}
              style={{ padding: '0.85rem', fontSize: '0.95rem', fontWeight: 800 }}
            >
              <AlertOctagon size={20} />
              <span>TRANSMIT MAYDAY (DISTRESS)</span>
            </button>

            {/* Pan-Pan Button */}
            <button
              className="btn btn-secondary"
              onClick={() => handleBroadcast('PAN-PAN')}
              style={{ padding: '0.75rem', fontSize: '0.85rem', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}
            >
              <AlertTriangle size={18} />
              <span>TRANSMIT PAN-PAN (URGENCY)</span>
            </button>

            {/* EPIRB Test Button */}
            <button
              className="btn btn-tactical"
              onClick={() => handleBroadcast('EPIRB')}
              style={{ padding: '0.75rem', fontSize: '0.85rem' }}
            >
              <LifeBuoy size={18} />
              <span>TEST 406 MHz EPIRB SATELLITE BEACON</span>
            </button>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5
          }}>
            <strong>SOLAS Chapter IV Warning:</strong> Activating the distress alert transmits emergency DSC bursts to all Maritime Rescue Coordination Centers (MRCC) within 300 NM range.
          </div>
        </div>
      </div>
    </div>
  );
};
