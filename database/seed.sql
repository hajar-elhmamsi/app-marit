-- ==============================================================================
-- NAVIOS MARITIME OS - Seed Data Insertion
-- ==============================================================================

-- 1. Insert Vessels
INSERT INTO vessels (id, name, imo, mmsi, call_sign, flag, flag_code, type, dwt, length_m, beam_m, draught_m, max_draught_m, lat, lng, course, speed_knots, status, origin, origin_code, destination, dest_code, eta, cii_rating, co2_per_voyage_tons) VALUES
('v-001', 'EVER APEX', '9893890', '352001456', '3FQK8', 'Panama', 'PA', 'Container', 241960, 400.0, 61.5, 14.8, 16.5, 36.14, -5.35, 82.0, 18.4, 'Underway', 'Rotterdam (NLRTM)', 'NLRTM', 'Port Said (EGPSD)', 'EGPSD', '2026-08-19 14:00 UTC', 'A', 1420.5),
('v-002', 'MAERSK MC-KINNEY MOLLER', '9619907', '219018271', 'OXER2', 'Denmark', 'DK', 'Container', 194849, 399.0, 59.0, 15.2, 16.0, 1.25, 103.85, 245.0, 16.2, 'Underway', 'Shanghai (CNSHA)', 'CNSHA', 'Suez Canal (EGSUZ)', 'EGSUZ', '2026-08-23 06:30 UTC', 'B', 1980.2),
('v-003', 'CMA CGM JACQUES SAADÉ', '9839179', '228386700', 'FNJY', 'France', 'FR', 'Container', 220000, 400.0, 61.3, 15.6, 16.0, 50.8, -1.1, 65.0, 17.1, 'Underway', 'Le Havre (FRLEH)', 'FRLEH', 'Hamburg (DEHAM)', 'DEHAM', '2026-08-16 22:00 UTC', 'A', 940.0),
('v-004', 'PACIFIC ENTERPRISE', '9784321', '636018992', 'A8QK9', 'Liberia', 'LR', 'Oil Tanker', 318000, 333.0, 60.0, 21.5, 22.5, 25.28, 56.4, 145.0, 13.8, 'Underway', 'Ras Tanura (SARAS)', 'SARAS', 'Ningbo-Zhoushan (CNNGB)', 'CNNGB', '2026-08-29 18:00 UTC', 'B', 3100.8),
('v-005', 'GASLOG WARSAW', '9819686', '310789000', 'ZCEZ6', 'Bermuda', 'BM', 'LNG Carrier', 95000, 293.0, 45.8, 11.8, 12.5, 25.8, 52.5, 330.0, 0.1, 'Moored', 'Ras Laffan (QARAS)', 'QARAS', 'Tokyo Bay (JPTYO)', 'JPTYO', '2026-09-02 04:00 UTC', 'A', 1180.0),
('v-006', 'NORDIC VALIANT', '9654123', '538005432', 'V7XQ3', 'Marshall Islands', 'MH', 'Bulk Carrier', 180000, 292.0, 45.0, 18.2, 18.5, -20.3, 118.5, 290.0, 11.2, 'Underway', 'Port Hedland (AUPHE)', 'AUPHE', 'Qingdao (CNTAO)', 'CNTAO', '2026-08-25 11:00 UTC', 'C', 2240.4),
('v-007', 'HERCULES TITAN', '9554321', '244123000', 'PBHT', 'Netherlands', 'NL', 'Tug / Salvage', 3200, 65.0, 18.5, 6.8, 7.2, 51.95, 4.12, 18.0, 9.5, 'Underway', 'Rotterdam (NLRTM)', 'NLRTM', 'North Sea Field (NSF)', 'NSF01', '2026-08-16 08:00 UTC', 'A', 110.0);

-- 2. Insert Telemetry
INSERT INTO vessel_telemetry (vessel_id, rpm, engine_load_pct, fuel_flow_liters_per_hour, turbo_pressure_bar, exhaust_temp_avg_c, shaft_power_kw, hfo_pct, mgo_pct, fresh_water_pct, ballast_pct) VALUES
('v-001', 78, 82.0, 3450, 2.8, 385.0, 58400, 78, 92, 84, 35),
('v-002', 72, 76.0, 3120, 2.5, 372.0, 46200, 64, 88, 76, 42),
('v-003', 74, 79.0, 2890, 2.7, 360.0, 52000, 15, 70, 90, 38),
('v-004', 62, 74.0, 2750, 2.2, 395.0, 29400, 82, 95, 68, 15),
('v-005', 0, 10.0, 220, 0.2, 180.0, 1200, 90, 98, 92, 80),
('v-006', 68, 72.0, 2450, 2.1, 388.0, 18500, 72, 85, 70, 20),
('v-007', 88, 85.0, 1150, 2.9, 410.0, 16000, 0, 88, 95, 50);

-- 3. Insert Cylinders (Sample for EVER APEX v-001)
INSERT INTO cylinder_telemetry (vessel_id, cylinder_number, temp_c) VALUES
('v-001', 1, 382), ('v-001', 2, 386), ('v-001', 3, 384), ('v-001', 4, 388),
('v-001', 5, 383), ('v-001', 6, 387), ('v-001', 7, 385), ('v-001', 8, 389),
('v-001', 9, 381), ('v-001', 10, 386), ('v-001', 11, 384), ('v-001', 12, 388);

-- 4. Insert Ports
INSERT INTO ports (id, name, code, country, lat, lng, berths_total, berths_occupied, waiting_vessels, average_turnaround_hours, bunker_available, tide_high, tide_low, next_high_time, temp_c, wind_knots, wind_dir, wave_height_m) VALUES
('port-rotterdam', 'Port of Rotterdam', 'NLRTM', 'Netherlands', 51.9244, 4.4777, 142, 118, 12, 28.5, '["VLSFO","MGO","LNG","Biofuel"]', 2.4, 0.3, '18:45 UTC', 19, 16, 'SW', 1.1),
('port-singapore', 'Port of Singapore', 'SGSIN', 'Singapore', 1.2644, 103.8223, 210, 189, 28, 22.0, '["VLSFO","MGO","LNG","Biofuel"]', 3.1, 0.6, '21:10 UTC', 31, 8, 'E', 0.5),
('port-shanghai', 'Port of Shanghai (Yangshan)', 'CNSHA', 'China', 30.6272, 122.0645, 185, 168, 34, 24.8, '["VLSFO","MGO","LNG"]', 4.2, 0.8, '17:30 UTC', 28, 12, 'SE', 0.9),
('port-said', 'Port Said (Suez North)', 'EGPSD', 'Egypt', 31.2653, 32.3019, 45, 38, 19, 18.0, '["VLSFO","MGO"]', 1.1, 0.2, '20:00 UTC', 33, 14, 'NW', 0.8),
('port-jebel-ali', 'Jebel Ali Port (Dubai)', 'AEJEA', 'United Arab Emirates', 25.0083, 55.0603, 67, 52, 7, 21.4, '["VLSFO","MGO","LNG"]', 1.8, 0.4, '19:15 UTC', 39, 11, 'NNE', 0.4),
('port-tangermed', 'Tanger Med', 'MAPTM', 'Morocco', 35.8883, -5.5056, 58, 46, 8, 19.8, '["VLSFO","MGO"]', 2.2, 0.5, '22:40 UTC', 26, 20, 'E', 1.6);

-- 5. Insert Bills of Lading
INSERT INTO bills_of_lading (bl_number, shipper, consignee, vessel_name, voyage_number, pol, pod, total_containers, gross_weight_mt, customs_status, issue_date) VALUES
('MAEU-982144510', 'Foxconn Electronics Corp', 'Apple Distribution B.V.', 'EVER APEX', 'VY-2026-08E', 'Shanghai (CNSHA)', 'Rotterdam (NLRTM)', 240, 3840.5, 'Cleared', '2026-08-02'),
('MSCU-661290314', 'Bayer Pharmaceuticals AG', 'Middle East Healthcare Logistics', 'CMA CGM JACQUES SAADÉ', 'VY-2026-11W', 'Hamburg (DEHAM)', 'Port Said (EGPSD)', 45, 620.0, 'Cleared', '2026-08-08'),
('CMAU-110948275', 'BASF Special Chemicals', 'Sinopec Petrochemicals Corp', 'PACIFIC ENTERPRISE', 'VY-2026-04S', 'Antwerp (BEANR)', 'Ningbo-Zhoushan (CNNGB)', 82, 1980.2, 'Under Inspection', '2026-08-11');

-- 6. Insert Crew Members
INSERT INTO crew_members (id, name, rank, department, nationality, flag_code, passport_no, seamans_book_no, vessel_assigned, onboard_since, rest_hours_24h, rest_hours_7d, compliance_mlc) VALUES
('cr-001', 'Capt. Alexander Lindqvist', 'Master Mariner (Captain)', 'Deck', 'Sweden', 'SE', 'SWE-8831920', 'SB-SE-44912', 'EVER APEX', '2026-05-10', 11.5, 82.0, 'Compliant'),
('cr-002', 'Dmitri Voronov', 'Chief Engineer', 'Engine', 'Estonia', 'EE', 'EST-6192834', 'SB-EE-88219', 'EVER APEX', '2026-06-01', 10.0, 79.5, 'Compliant'),
('cr-003', 'Sarah Chen', 'Chief Mate / Chief Officer', 'Deck', 'Singapore', 'SG', 'SGP-9482103', 'SB-SG-10928', 'EVER APEX', '2026-06-15', 9.0, 74.0, 'Warning'),
('cr-004', 'Mateo Santos', '2nd Officer / Navigation Officer', 'Deck', 'Philippines', 'PH', 'PHL-5521908', 'SB-PH-77291', 'EVER APEX', '2026-04-20', 12.0, 84.0, 'Compliant'),
('cr-005', 'Klaus Richter', '2nd Engineer', 'Engine', 'Germany', 'DE', 'DEU-7729104', 'SB-DE-39102', 'CMA CGM JACQUES SAADÉ', '2026-05-25', 10.5, 80.0, 'Compliant');

-- 7. Insert Crew Certificates
INSERT INTO crew_certificates (crew_id, title, code, issue_date, expiry_date, is_valid) VALUES
('cr-001', 'Master Unlimited (STCW II/2)', 'COC-II/2', '2022-01-15', '2027-01-15', 1),
('cr-001', 'GMDSS General Operator Certificate', 'GOC-IV/2', '2023-04-10', '2028-04-10', 1),
('cr-001', 'ECDIS Type Specific (Furuno/JRC)', 'ECDIS-TS', '2024-02-20', '2029-02-20', 1),
('cr-002', 'Chief Engineer Unlimited (STCW III/2)', 'COC-III/2', '2021-11-20', '2026-11-20', 1),
('cr-003', 'Chief Mate Unlimited (STCW II/2)', 'COC-II/2', '2024-03-01', '2029-03-01', 1);

-- 8. Insert Bridge Alarms
INSERT INTO bridge_alarms (id, timestamp, level, source, vessel_name, description, acknowledged, action_required) VALUES
('alm-101', '15:58:22 UTC', 'CRITICAL', 'NAVIGATION_AIS', 'EVER APEX', 'Collision Alert: Target MMSI 257019280 (Fishing Vessel) CPA 0.42 NM, TCPA 8.5 min', 0, 'Verify visual and ARPA contact, sound 1 prolonged blast if required.'),
('alm-102', '15:42:10 UTC', 'WARNING', 'ENGINE_ROOM', 'EVER APEX', 'Main Engine Cylinder #4 Exhaust Temp High: 398°C (Threshold 395°C)', 1, 'Chief Engineer notified, fuel injector trim balanced.'),
('alm-103', '15:10:05 UTC', 'WARNING', 'CARGO_REEFER', 'CMA CGM JACQUES SAADÉ', 'Reefer Unit MSKU-42901 Temp Drift: -14.2°C (Set Point -20.0°C)', 0, 'Duty electrician to inspect compressor power supply in Bay 14.'),
('alm-104', '14:20:00 UTC', 'ADVISORY', 'ENVIRONMENT_ECA', 'EVER APEX', 'Entering Mediterranean Emission Control Area (Med SECA 0.1% Sulphur)', 1, 'Fuel switch-over from VLSFO to MGO completed and logged.');
