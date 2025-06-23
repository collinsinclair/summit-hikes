-- Summit Hikes Database Schema
-- Optimized for SQLite with simplified structure for filtering/sorting

-- Main hikes table with denormalized fields for simpler queries
CREATE TABLE hikes (
    id INTEGER PRIMARY KEY,
    number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Distance and time as numeric for easy filtering
    round_trip_miles REAL NOT NULL,
    hiking_time_min REAL NOT NULL,
    hiking_time_max REAL NOT NULL,
    
    -- Difficulty as numeric for sorting
    difficulty_rating REAL NOT NULL,
    difficulty_label TEXT NOT NULL,
    
    -- Class as numeric with original text preserved
    class_numeric REAL NOT NULL,
    class_text TEXT NOT NULL,
    
    -- Elevations as integers
    start_elevation INTEGER NOT NULL,
    total_elevation_gain INTEGER NOT NULL,
    
    -- Keep terrain as text
    terrain TEXT NOT NULL,
    
    -- Simplified crowd level
    crowd_level_numeric INTEGER NOT NULL,
    crowd_level_text TEXT NOT NULL,
    
    -- Boolean flags
    is_overnight BOOLEAN DEFAULT FALSE,
    
    -- Optional fields
    gear_advisor TEXT,
    location TEXT
);

-- Separate table for peaks (one-to-many relationship)
CREATE TABLE peaks (
    id INTEGER PRIMARY KEY,
    hike_id INTEGER NOT NULL,
    peak_name TEXT,
    elevation INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (hike_id) REFERENCES hikes(id) ON DELETE CASCADE
);

-- Trailheads with parsed GPS coordinates
CREATE TABLE trailheads (
    id INTEGER PRIMARY KEY,
    hike_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    elevation INTEGER,
    FOREIGN KEY (hike_id) REFERENCES hikes(id) ON DELETE CASCADE
);

-- Climbing seasons parsed from text
CREATE TABLE climbing_seasons (
    id INTEGER PRIMARY KEY,
    hike_id INTEGER NOT NULL,
    start_month INTEGER NOT NULL,
    end_month INTEGER NOT NULL,
    season_text TEXT NOT NULL,
    FOREIGN KEY (hike_id) REFERENCES hikes(id) ON DELETE CASCADE,
    CHECK (start_month >= 1 AND start_month <= 12),
    CHECK (end_month >= 1 AND end_month <= 12)
);

-- Indexes for common filter/sort operations
CREATE INDEX idx_hikes_difficulty ON hikes(difficulty_rating);
CREATE INDEX idx_hikes_class ON hikes(class_numeric);
CREATE INDEX idx_hikes_crowd ON hikes(crowd_level_numeric);
CREATE INDEX idx_hikes_elevation_gain ON hikes(total_elevation_gain);
CREATE INDEX idx_hikes_distance ON hikes(round_trip_miles);
CREATE INDEX idx_hikes_start_elevation ON hikes(start_elevation);
CREATE INDEX idx_hikes_time ON hikes(hiking_time_max);
CREATE INDEX idx_peaks_elevation ON peaks(elevation);
CREATE INDEX idx_peaks_hike ON peaks(hike_id);

-- Views for common queries
CREATE VIEW hikes_with_peaks AS
SELECT 
    h.*,
    GROUP_CONCAT(p.peak_name || ' (' || p.elevation || ''')', ', ') as all_peaks,
    MAX(p.elevation) as highest_peak_elevation,
    COUNT(p.id) as peak_count
FROM hikes h
LEFT JOIN peaks p ON h.id = p.hike_id
GROUP BY h.id;

CREATE VIEW fourteeners AS
SELECT DISTINCT h.*
FROM hikes h
JOIN peaks p ON h.id = p.hike_id
WHERE p.elevation >= 14000;