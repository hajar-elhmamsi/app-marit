import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Flame, 
  AlertTriangle, 
  Radio,
  Compass
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { BridgeAlarm } from '../data/mockAlarms';

interface HeaderProps {
  bridgeMode: 'night' | 'day' | 'red';
  setBridgeMode: (mode: 'night' | 'day' | 'red') => void;
  alarms: BridgeAlarm[];
  onOpenAlarms: () => void;
  activeVesselName: string;
}

export const Header: React.FC<HeaderProps> = ({
  bridgeMode,
  setBridgeMode,
  alarms,
  onOpenAlarms,
  activeVesselName
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [localTime, setLocalTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
      setLocalTime(
        now.toLocaleTimeString('en-GB', { hour12: false }) + ' LOC'
      );
    };
    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMuteToggle = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sounds.playButtonBeep();
    }
  };

  const unacknowledgedCount = alarms.filter((a) => !a.acknowledged).length;

  return (
    <header className="glass-panel" style={{
      margin: '0.75rem 1rem 0 1rem',
      padding: '0.65rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000
    }}>
      {/* Brand & Vessel Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-marine))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--accent-cyan-glow)'
          }}>
            <Anchor size={22} color="#060c18" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontWeight: 800, 
                fontSize: '1.15rem', 
                letterSpacing: '0.04em',
                color: 'var(--text-primary)'
              }}>
                NAVIOS
              </span>
              <span style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.7rem', 
                fontWeight: 700,
                color: 'var(--accent-cyan)',
                border: '1px solid var(--accent-cyan-glow)',
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(0, 245, 212, 0.08)'
              }}>
                MARITIME OS v3.4
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1px' }}>
              <span className="live-dot" />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Flagship: <strong style={{ color: 'var(--text-primary)' }}>{activeVesselName}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Chronometer & Coordinates */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: 'rgba(0, 0, 0, 0.25)',
        padding: '0.4rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Clock size={16} color="var(--accent-cyan)" />
          <span className="mono" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-cyan)' }}>
            {utcTime || '2026-08-15 15:13:00 UTC'}
          </span>
        </div>
        <div style={{ width: '1px', height: '18px', background: 'var(--border-subtle)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Radio size={14} color="var(--accent-gold)" />
          <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            AIS RELAY: <strong style={{ color: 'var(--accent-gold)' }}>ONLINE</strong> (37/37 STATIONS)
          </span>
        </div>
      </div>

      {/* Tactical Controls (Vision Modes, Audio, SOS Alarms) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Audio Toggle */}
        <button
          className="btn btn-secondary btn-icon"
          onClick={handleMuteToggle}
          title={isMuted ? 'Bridge Audio: Muted' : 'Bridge Audio: Active'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} color="var(--accent-cyan)" />}
        </button>

        {/* Vision Mode Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: '2px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => { setBridgeMode('night'); sounds.playButtonBeep(); }}
            className={`btn btn-icon ${bridgeMode === 'night' ? 'btn-primary' : ''}`}
            style={{ width: '32px', height: '30px', borderRadius: '6px' }}
            title="Night Bridge Mode"
          >
            <Moon size={15} />
          </button>
          <button
            onClick={() => { setBridgeMode('day'); sounds.playButtonBeep(); }}
            className={`btn btn-icon ${bridgeMode === 'day' ? 'btn-primary' : ''}`}
            style={{ width: '32px', height: '30px', borderRadius: '6px' }}
            title="Day / Daylight Mode"
          >
            <Sun size={15} />
          </button>
          <button
            onClick={() => { setBridgeMode('red'); sounds.playButtonBeep(); }}
            className={`btn btn-icon ${bridgeMode === 'red' ? 'btn-danger' : ''}`}
            style={{ width: '32px', height: '30px', borderRadius: '6px' }}
            title="Red-Light Tactical Bridge Mode"
          >
            <Flame size={15} />
          </button>
        </div>

        {/* GMDSS Alarm Center Button */}
        <button
          className={`btn ${unacknowledgedCount > 0 ? 'btn-danger' : 'btn-tactical'}`}
          onClick={() => {
            sounds.playAlertAlarm();
            onOpenAlarms();
          }}
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
        >
          <AlertTriangle size={16} />
          <span>GMDSS ALARMS</span>
          {unacknowledgedCount > 0 && (
            <span style={{
              background: '#ffffff',
              color: '#be123c',
              fontWeight: 800,
              fontSize: '0.72rem',
              padding: '1px 6px',
              borderRadius: '999px'
            }}>
              {unacknowledgedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
