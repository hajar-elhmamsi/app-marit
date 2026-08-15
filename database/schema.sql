-- ==============================================================================
-- NAVIOS MARITIME OS - Relational Database Schema
-- Compatible with PostgreSQL, MySQL 8+, and SQLite 3
-- ==============================================================================

-- 1. Vessels Table (Fleet Register)
CREATE TABLE IF NOT EXISTS vessels (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    imo VARCHAR(16) NOT NULL UNIQUE,
    mmsi VARCHAR(16) NOT NULL UNIQUE,
    call_sign VARCHAR(16) NOT NULL,
    flag VARCHAR(64) NOT NULL,
    flag_code VARCHAR(8) NOT NULL,
    type VARCHAR(32) NOT NULL,
    dwt INTEGER NOT NULL,
    length_m REAL NOT NULL,
    beam_m REAL NOT NULL,
    draught_m REAL NOT NULL,
    max_draught_m REAL NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    course REAL NOT NULL,
    speed_knots REAL NOT NULL,
    status VARCHAR(32) NOT NULL,
    origin VARCHAR(128) NOT NULL,
    origin_code VARCHAR(16) NOT NULL,
    destination VARCHAR(128) NOT NULL,
    dest_code VARCHAR(16) NOT NULL,
    eta VARCHAR(64) NOT NULL,
    cii_rating VARCHAR(4) NOT NULL,
    co2_per_voyage_tons REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vessel Telemetry Table (Engine & Tanks)
CREATE TABLE IF NOT EXISTS vessel_telemetry (
    vessel_id VARCHAR(32) PRIMARY KEY,
    rpm INTEGER NOT NULL,
    engine_load_pct REAL NOT NULL,
    fuel_flow_liters_per_hour INTEGER NOT NULL,
    turbo_pressure_bar REAL NOT NULL,
    exhaust_temp_avg_c REAL NOT NULL,
    shaft_power_kw INTEGER NOT NULL,
    hfo_pct INTEGER NOT NULL,
    mgo_pct INTEGER NOT NULL,
    fresh_water_pct INTEGER NOT NULL,
    ballast_pct INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- 3. Cylinder Telemetry Table (12 Cylinder Heat Balance)
CREATE TABLE IF NOT EXISTS cylinder_telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_id VARCHAR(32) NOT NULL,
    cylinder_number INTEGER NOT NULL,
    temp_c INTEGER NOT NULL,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- 4. Ports Table (Harbor Master & Berth Allocation)
CREATE TABLE IF NOT EXISTS ports (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(16) NOT NULL UNIQUE,
    country VARCHAR(64) NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    berths_total INTEGER NOT NULL,
    berths_occupied INTEGER NOT NULL,
    waiting_vessels INTEGER NOT NULL,
    average_turnaround_hours REAL NOT NULL,
    bunker_available TEXT NOT NULL, -- JSON array
    tide_high REAL NOT NULL,
    tide_low REAL NOT NULL,
    next_high_time VARCHAR(32) NOT NULL,
    temp_c INTEGER NOT NULL,
    wind_knots INTEGER NOT NULL,
    wind_dir VARCHAR(8) NOT NULL,
    wave_height_m REAL NOT NULL
);

-- 5. Container Slots Table (2D/3D Bay Stowage)
CREATE TABLE IF NOT EXISTS container_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_id VARCHAR(32) NOT NULL,
    bay INTEGER NOT NULL,
    row INTEGER NOT NULL,
    tier INTEGER NOT NULL,
    container_id VARCHAR(32),
    size VARCHAR(16) NOT NULL,
    weight_tons REAL NOT NULL,
    type VARCHAR(32) NOT NULL,
    imdg_class VARCHAR(64),
    imdg_description TEXT,
    reefer_temp_c REAL,
    destination_port VARCHAR(64),
    consignee VARCHAR(128),
    status VARCHAR(32) NOT NULL,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- 6. Bills of Lading Table (Cargo Manifest)
CREATE TABLE IF NOT EXISTS bills_of_lading (
    bl_number VARCHAR(64) PRIMARY KEY,
    shipper VARCHAR(128) NOT NULL,
    consignee VARCHAR(128) NOT NULL,
    vessel_name VARCHAR(128) NOT NULL,
    voyage_number VARCHAR(32) NOT NULL,
    pol VARCHAR(64) NOT NULL,
    pod VARCHAR(64) NOT NULL,
    total_containers INTEGER NOT NULL,
    gross_weight_mt REAL NOT NULL,
    customs_status VARCHAR(32) NOT NULL,
    issue_date VARCHAR(32) NOT NULL
);

-- 7. Crew Members Table (STCW & MLC 2006)
CREATE TABLE IF NOT EXISTS crew_members (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    rank VARCHAR(64) NOT NULL,
    department VARCHAR(32) NOT NULL,
    nationality VARCHAR(64) NOT NULL,
    flag_code VARCHAR(8) NOT NULL,
    passport_no VARCHAR(32) NOT NULL,
    seamans_book_no VARCHAR(32) NOT NULL,
    vessel_assigned VARCHAR(128) NOT NULL,
    onboard_since VARCHAR(32) NOT NULL,
    rest_hours_24h REAL NOT NULL,
    rest_hours_7d REAL NOT NULL,
    compliance_mlc VARCHAR(16) NOT NULL
);

-- 8. Crew Certificates Table (STCW Endorsements)
CREATE TABLE IF NOT EXISTS crew_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_id VARCHAR(32) NOT NULL,
    title VARCHAR(128) NOT NULL,
    code VARCHAR(32) NOT NULL,
    issue_date VARCHAR(32) NOT NULL,
    expiry_date VARCHAR(32) NOT NULL,
    is_valid BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (crew_id) REFERENCES crew_members(id) ON DELETE CASCADE
);

-- 9. Bridge Alarms Table (GMDSS Alarm Matrix)
CREATE TABLE IF NOT EXISTS bridge_alarms (
    id VARCHAR(32) PRIMARY KEY,
    timestamp VARCHAR(32) NOT NULL,
    level VARCHAR(16) NOT NULL,
    source VARCHAR(32) NOT NULL,
    vessel_name VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT 0,
    action_required TEXT NOT NULL
);

-- 10. Indexes for Fast Navigational Queries
CREATE INDEX IF NOT EXISTS idx_vessels_type ON vessels(type);
CREATE INDEX IF NOT EXISTS idx_vessels_status ON vessels(status);
CREATE INDEX IF NOT EXISTS idx_container_vessel_bay ON container_slots(vessel_id, bay);
CREATE INDEX IF NOT EXISTS idx_crew_vessel ON crew_members(vessel_assigned);
CREATE INDEX IF NOT EXISTS idx_alarms_ack ON bridge_alarms(acknowledged);
