import { Vessel } from '../data/mockVessels';
import { PortCall } from '../data/mockPorts';
import { CrewMember } from '../data/mockCrew';
import { BridgeAlarm } from '../data/mockAlarms';
import { ContainerSlot, BillOfLading } from '../data/mockCargo';

const API_BASE_URL = 'http://localhost:4000/api';

export const maritimeApi = {
  // Check API health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Vessels
  async getVessels(): Promise<Vessel[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/vessels`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateVesselTelemetry(id: string, telemetry: Partial<Vessel['telemetry']> & { lat?: number; lng?: number; course?: number }) {
    try {
      const res = await fetch(`${API_BASE_URL}/vessels/${id}/telemetry`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetry)
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Ports
  async getPorts(): Promise<PortCall[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/ports`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Cargo
  async getBayContainers(bayNumber: number): Promise<ContainerSlot[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/cargo/bay/${bayNumber}`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getBillsOfLading(): Promise<BillOfLading[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/cargo/bills-of-lading`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Crew
  async getCrew(): Promise<CrewMember[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/crew`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateCrewRestHours(id: string, restHours24h: number, restHours7d: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/crew/${id}/rest-hours`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restHours24h, restHours7d })
      });
      return await res.json();
    } catch {
      return null;
    }
  },

  // Alarms
  async getAlarms(): Promise<BridgeAlarm[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/alarms`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async acknowledgeAlarm(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/alarms/${id}/ack`, { method: 'PUT' });
      return await res.json();
    } catch {
      return null;
    }
  },

  async triggerSOS(type: 'MAYDAY' | 'PAN-PAN' | 'EPIRB', vesselName: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/alarms/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, vesselName })
      });
      return await res.json();
    } catch {
      return null;
    }
  }
};
