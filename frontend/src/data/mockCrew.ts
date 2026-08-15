export interface STCWCertificate {
  title: string;
  code: string;
  issueDate: string;
  expiryDate: string;
  isValid: boolean;
}

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: 'Deck' | 'Engine' | 'Galley' | 'Medical';
  nationality: string;
  flagCode: string;
  passportNo: string;
  seamansBookNo: string;
  vesselAssigned: string;
  onboardSince: string;
  restHours24h: number; // MLC requires min 10h in 24h
  restHours7d: number;  // MLC requires min 77h in 7d
  complianceMLC: 'Compliant' | 'Warning' | 'Violation';
  certificates: STCWCertificate[];
}

export const MOCK_CREW: CrewMember[] = [
  {
    id: 'cr-001',
    name: 'Capt. Alexander Lindqvist',
    rank: 'Master Mariner (Captain)',
    department: 'Deck',
    nationality: 'Sweden',
    flagCode: 'SE',
    passportNo: 'SWE-8831920',
    seamansBookNo: 'SB-SE-44912',
    vesselAssigned: 'EVER APEX',
    onboardSince: '2026-05-10',
    restHours24h: 11.5,
    restHours7d: 82.0,
    complianceMLC: 'Compliant',
    certificates: [
      { title: 'Master Unlimited (STCW II/2)', code: 'COC-II/2', issueDate: '2022-01-15', expiryDate: '2027-01-15', isValid: true },
      { title: 'GMDSS General Operator Certificate', code: 'GOC-IV/2', issueDate: '2023-04-10', expiryDate: '2028-04-10', isValid: true },
      { title: 'ECDIS Type Specific (Furuno/JRC)', code: 'ECDIS-TS', issueDate: '2024-02-20', expiryDate: '2029-02-20', isValid: true },
      { title: 'Ship Security Officer (ISPS)', code: 'SSO-VI/5', issueDate: '2023-09-01', expiryDate: '2028-09-01', isValid: true }
    ]
  },
  {
    id: 'cr-002',
    name: 'Dmitri Voronov',
    rank: 'Chief Engineer',
    department: 'Engine',
    nationality: 'Estonia',
    flagCode: 'EE',
    passportNo: 'EST-6192834',
    seamansBookNo: 'SB-EE-88219',
    vesselAssigned: 'EVER APEX',
    onboardSince: '2026-06-01',
    restHours24h: 10.0,
    restHours7d: 79.5,
    complianceMLC: 'Compliant',
    certificates: [
      { title: 'Chief Engineer Unlimited (STCW III/2)', code: 'COC-III/2', issueDate: '2021-11-20', expiryDate: '2026-11-20', isValid: true },
      { title: 'High Voltage Propulsion Systems', code: 'HV-III/1', issueDate: '2023-05-12', expiryDate: '2028-05-12', isValid: true },
      { title: 'Advanced Fire Fighting (STCW VI/3)', code: 'AFF-VI/3', issueDate: '2022-08-14', expiryDate: '2027-08-14', isValid: true }
    ]
  },
  {
    id: 'cr-003',
    name: 'Sarah Chen',
    rank: 'Chief Mate / Chief Officer',
    department: 'Deck',
    nationality: 'Singapore',
    flagCode: 'SG',
    passportNo: 'SGP-9482103',
    seamansBookNo: 'SB-SG-10928',
    vesselAssigned: 'EVER APEX',
    onboardSince: '2026-06-15',
    restHours24h: 9.0, // MLC Warning (below 10h)
    restHours7d: 74.0, // Below 77h
    complianceMLC: 'Warning',
    certificates: [
      { title: 'Chief Mate Unlimited (STCW II/2)', code: 'COC-II/2', issueDate: '2024-03-01', expiryDate: '2029-03-01', isValid: true },
      { title: 'Medical First Aid at Sea', code: 'MED-VI/4', issueDate: '2023-07-22', expiryDate: '2028-07-22', isValid: true },
      { title: 'Dangerous Goods Hazmat IMDG', code: 'IMDG-DG', issueDate: '2025-01-10', expiryDate: '2030-01-10', isValid: true }
    ]
  },
  {
    id: 'cr-004',
    name: 'Mateo Santos',
    rank: '2nd Officer / Navigation Officer',
    department: 'Deck',
    nationality: 'Philippines',
    flagCode: 'PH',
    passportNo: 'PHL-5521908',
    seamansBookNo: 'SB-PH-77291',
    vesselAssigned: 'EVER APEX',
    onboardSince: '2026-04-20',
    restHours24h: 12.0,
    restHours7d: 84.0,
    complianceMLC: 'Compliant',
    certificates: [
      { title: 'Officer of the Watch OOW (STCW II/1)', code: 'OOW-II/1', issueDate: '2023-10-15', expiryDate: '2028-10-15', isValid: true },
      { title: 'ARPA / Radar Navigation (STCW II/1)', code: 'ARPA-II/1', issueDate: '2023-11-01', expiryDate: '2028-11-01', isValid: true }
    ]
  },
  {
    id: 'cr-005',
    name: 'Klaus Richter',
    rank: '2nd Engineer',
    department: 'Engine',
    nationality: 'Germany',
    flagCode: 'DE',
    passportNo: 'DEU-7729104',
    seamansBookNo: 'SB-DE-39102',
    vesselAssigned: 'CMA CGM JACQUES SAADÉ',
    onboardSince: '2026-05-25',
    restHours24h: 10.5,
    restHours7d: 80.0,
    complianceMLC: 'Compliant',
    certificates: [
      { title: 'Second Engineer (STCW III/2)', code: '2ENG-III/2', issueDate: '2022-09-18', expiryDate: '2027-09-18', isValid: true },
      { title: 'LNG Fuel Bunkering & IGF Code', code: 'IGF-V/3', issueDate: '2023-03-10', expiryDate: '2028-03-10', isValid: true }
    ]
  }
];
