export interface BridgeAlarm {
  id: string;
  timestamp: string;
  level: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  source: 'ENGINE_ROOM' | 'NAVIGATION_AIS' | 'CARGO_REEFER' | 'SAFETY_GMDSS' | 'ENVIRONMENT_ECA';
  vesselName: string;
  description: string;
  acknowledged: boolean;
  actionRequired: string;
}

export const INITIAL_ALARMS: BridgeAlarm[] = [
  {
    id: 'alm-101',
    timestamp: '15:58:22 UTC',
    level: 'CRITICAL',
    source: 'NAVIGATION_AIS',
    vesselName: 'EVER APEX',
    description: 'Collision Alert: Target MMSI 257019280 (Fishing Vessel) CPA 0.42 NM, TCPA 8.5 min',
    acknowledged: false,
    actionRequired: 'Verify visual and ARPA contact, sound 1 prolonged blast if required.'
  },
  {
    id: 'alm-102',
    timestamp: '15:42:10 UTC',
    level: 'WARNING',
    source: 'ENGINE_ROOM',
    vesselName: 'EVER APEX',
    description: 'Main Engine Cylinder #4 Exhaust Temp High: 398°C (Threshold 395°C)',
    acknowledged: true,
    actionRequired: 'Chief Engineer notified, fuel injector trim balanced.'
  },
  {
    id: 'alm-103',
    timestamp: '15:10:05 UTC',
    level: 'WARNING',
    source: 'CARGO_REEFER',
    vesselName: 'CMA CGM JACQUES SAADÉ',
    description: 'Reefer Unit MSKU-42901 Temp Drift: -14.2°C (Set Point -20.0°C)',
    acknowledged: false,
    actionRequired: 'Duty electrician to inspect compressor power supply in Bay 14.'
  },
  {
    id: 'alm-104',
    timestamp: '14:20:00 UTC',
    level: 'ADVISORY',
    source: 'ENVIRONMENT_ECA',
    vesselName: 'EVER APEX',
    description: 'Entering Mediterranean Emission Control Area (Med SECA 0.1% Sulphur)',
    acknowledged: true,
    actionRequired: 'Fuel switch-over from VLSFO to MGO completed and logged.'
  }
];
