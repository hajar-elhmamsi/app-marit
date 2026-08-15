export interface ContainerSlot {
  bay: number;     // Longitudinal coordinate (Bay 01, 03, 05...)
  row: number;     // Transverse coordinate (Port: 02,04,06, Starboard: 01,03,05, Center: 00)
  tier: number;    // Vertical tier (Hold: 02,04,06, Deck: 82,84,86,88)
  containerId?: string;
  size: '20ft' | '40ft' | '40ft HC' | 'Empty';
  weightTons: number;
  type: 'Dry Standard' | 'Reefer (Cold-Chain)' | 'Dangerous (IMDG)' | 'Open Top' | 'Empty';
  imdgClass?: string;
  imdgDescription?: string;
  reeferTempC?: number;
  destinationPort: string;
  consignee: string;
  status: 'Loaded' | 'Discharged' | 'Transit' | 'Hold-Inspect';
}

export interface BillOfLading {
  blNumber: string;
  shipper: string;
  consignee: string;
  vesselName: string;
  voyageNumber: string;
  pol: string; // Port of Loading
  pod: string; // Port of Discharge
  totalContainers: number;
  grossWeightMT: number;
  customsStatus: 'Cleared' | 'Under Inspection' | 'Bonded' | 'Released';
  issueDate: string;
}

export const MOCK_BILL_OF_LADINGS: BillOfLading[] = [
  {
    blNumber: 'MAEU-982144510',
    shipper: 'Foxconn Electronics Corp',
    consignee: 'Apple Distribution B.V.',
    vesselName: 'EVER APEX',
    voyageNumber: 'VY-2026-08E',
    pol: 'Shanghai (CNSHA)',
    pod: 'Rotterdam (NLRTM)',
    totalContainers: 240,
    grossWeightMT: 3840.5,
    customsStatus: 'Cleared',
    issueDate: '2026-08-02'
  },
  {
    blNumber: 'MSCU-661290314',
    shipper: 'Bayer Pharmaceuticals AG',
    consignee: 'Middle East Healthcare Logistics',
    vesselName: 'CMA CGM JACQUES SAADÉ',
    voyageNumber: 'VY-2026-11W',
    pol: 'Hamburg (DEHAM)',
    pod: 'Port Said (EGPSD)',
    totalContainers: 45,
    grossWeightMT: 620.0,
    customsStatus: 'Cleared',
    issueDate: '2026-08-08'
  },
  {
    blNumber: 'CMAU-110948275',
    shipper: 'BASF Special Chemicals',
    consignee: 'Sinopec Petrochemicals Corp',
    vesselName: 'PACIFIC ENTERPRISE',
    voyageNumber: 'VY-2026-04S',
    pol: 'Antwerp (BEANR)',
    pod: 'Ningbo-Zhoushan (CNNGB)',
    totalContainers: 82,
    grossWeightMT: 1980.2,
    customsStatus: 'Under Inspection',
    issueDate: '2026-08-11'
  }
];

// Generates a mock 6x6 bay grid for interactive stowage
export const generateBayPlan = (bayNumber: number = 14): ContainerSlot[] => {
  const slots: ContainerSlot[] = [];
  const rows = [6, 4, 2, 0, 1, 3, 5]; // Transverse rows: port to starboard
  const tiers = [88, 86, 84, 82, 6, 4, 2]; // Tiers: deck & hold

  const destinations = ['Rotterdam', 'Port Said', 'Hamburg', 'Singapore', 'Antwerp'];
  const shippers = ['Tesla Giga Logistics', 'Samsung Semi', 'Pfizer Pharma', 'IKEA Supply AG', 'BMW Group'];

  let counter = 100;
  for (const tier of tiers) {
    for (const row of rows) {
      counter++;
      const isOccupied = (row + tier + bayNumber) % 5 !== 0;
      if (!isOccupied) {
        slots.push({
          bay: bayNumber,
          row,
          tier,
          size: 'Empty',
          weightTons: 0,
          type: 'Empty',
          destinationPort: '-',
          consignee: '-',
          status: 'Empty' as unknown as 'Transit'
        });
        continue;
      }

      const isReefer = (counter % 7 === 0);
      const isDangerous = (counter % 11 === 0);
      const is40 = (row % 2 === 0);

      slots.push({
        bay: bayNumber,
        row,
        tier,
        containerId: `MSKU-${counter * 41 + 1000}`,
        size: is40 ? '40ft HC' : '20ft',
        weightTons: parseFloat((14 + (counter % 16)).toFixed(1)),
        type: isDangerous ? 'Dangerous (IMDG)' : (isReefer ? 'Reefer (Cold-Chain)' : 'Dry Standard'),
        imdgClass: isDangerous ? (counter % 2 === 0 ? 'Class 3 - Flammable Liquid' : 'Class 8 - Corrosives') : undefined,
        imdgDescription: isDangerous ? 'UN 1993 / Flashpoint 18°C' : undefined,
        reeferTempC: isReefer ? -20.5 : undefined,
        destinationPort: destinations[counter % destinations.length],
        consignee: shippers[counter % shippers.length],
        status: counter % 9 === 0 ? 'Hold-Inspect' : 'Loaded'
      });
    }
  }
  return slots;
};
