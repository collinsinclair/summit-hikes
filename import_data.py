#!/usr/bin/env python3
"""
Import summit hikes data from JSON into SQLite database.
"""

import json
import sqlite3
import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional


def parse_difficulty(difficulty_str: str) -> float:
    """Extract numeric difficulty from 'X/10' format."""
    match = re.search(r'(\d+(?:\.\d+)?)/10', difficulty_str)
    return float(match.group(1)) if match else 0.0


def parse_class(class_str: str) -> float:
    """Map class descriptions to numeric values."""
    class_mappings = {
        '1': 1.0,
        '1; 2 for the last 0.5 mile': 1.5,
        '2': 2.0,
        '2 with long class 1 sections': 2.0,
        '2+': 2.3,
        '2+/3': 2.5,
        '2+; optional class 3 moves on summit': 2.3,
        '2/2+': 2.2,
        '3': 3.0,
        '3 with significant exposure': 3.0,
        '3/3+': 3.3,
        '3; class 2 hike in': 3.0
    }
    return class_mappings.get(class_str, 2.0)


def parse_crowd_level(crowd_str: str) -> Tuple[int, str]:
    """Map crowd descriptions to numeric values."""
    crowd_str_lower = crowd_str.lower()
    
    if 'hermit' in crowd_str_lower:
        return 1, crowd_str
    elif 'low' in crowd_str_lower and 'moderate' in crowd_str_lower:
        return 3, crowd_str
    elif 'low' in crowd_str_lower:
        return 2, crowd_str
    elif 'high' in crowd_str_lower:
        return 5, crowd_str
    elif 'moderate' in crowd_str_lower or 'medium' in crowd_str_lower:
        return 4, crowd_str
    else:
        return 3, crowd_str


def parse_distance(distance_str: str) -> float:
    """Extract miles from distance string."""
    match = re.search(r'(\d+(?:\.\d+)?)\s*miles', distance_str)
    return float(match.group(1)) if match else 0.0


def parse_hiking_time(time_str: str) -> Tuple[float, float]:
    """Parse hiking time range into min and max hours."""
    # Handle "X-Y hours" format first
    match = re.search(r'(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\s*hours', time_str)
    if match:
        return float(match.group(1)), float(match.group(2))
    
    # Handle "X days" format - convert to hours
    days_match = re.search(r'(\d+(?:\.\d+)?)\s*days?', time_str)
    if days_match:
        days = float(days_match.group(1))
        # Assume 8-12 hours of hiking per day for multi-day hikes
        min_hours = days * 8
        max_hours = days * 12
        return min_hours, max_hours
    
    # Handle single hour values like "4 hours"
    single_match = re.search(r'(\d+(?:\.\d+)?)\s*hours?', time_str)
    if single_match:
        hours = float(single_match.group(1))
        return hours, hours
    
    return 0.0, 0.0


def parse_elevation(elevation_str: str) -> int:
    """Extract elevation number from string."""
    match = re.search(r'(\d{1,2},?\d{3})', elevation_str.replace(',', ''))
    return int(match.group(1)) if match else 0


def parse_gps_coordinate(coord_str: str) -> float:
    """Convert GPS coordinate from degrees/minutes to decimal."""
    match = re.search(r"(\d+)°(\d+(?:\.\d+)?)'?\s*([NSEW])", coord_str)
    if match:
        degrees = float(match.group(1))
        minutes = float(match.group(2))
        direction = match.group(3)
        
        decimal = degrees + (minutes / 60)
        
        if direction in ['S', 'W']:
            decimal = -decimal
            
        return decimal
    return 0.0


def parse_gps(gps_str: str) -> Tuple[float, float]:
    """Parse GPS string into latitude and longitude."""
    parts = gps_str.split(',')
    if len(parts) == 2:
        lat = parse_gps_coordinate(parts[0].strip())
        lon = parse_gps_coordinate(parts[1].strip())
        return lat, lon
    return 0.0, 0.0


def parse_climbing_season(season_str: str) -> List[Tuple[int, int]]:
    """Parse climbing season text into month ranges."""
    month_map = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4,
        'may': 5, 'june': 6, 'july': 7, 'august': 8,
        'september': 9, 'october': 10, 'november': 11, 'december': 12,
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
        'may': 5, 'jun': 6, 'jul': 7, 'aug': 8,
        'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    
    if 'year-round' in season_str.lower():
        return [(1, 12)]
    
    seasons = []
    season_lower = season_str.lower()
    
    # Look for month ranges with dash/hyphen
    # Pattern: "Month-Month" or "Late/Early/Mid Month-Month"
    import re
    
    # Find all month names in order they appear
    month_positions = []
    found_nums = set()
    for month, num in month_map.items():
        pos = season_lower.find(month)
        if pos != -1 and num not in found_nums:
            month_positions.append((pos, month, num))
            found_nums.add(num)
    
    # Sort by position in string
    month_positions.sort(key=lambda x: x[0])
    
    # If we found exactly 2 months separated by a dash, it's a range
    if len(month_positions) == 2 and '-' in season_str:
        start_num = month_positions[0][2]
        end_num = month_positions[1][2]
        if start_num <= end_num:
            seasons.append((start_num, end_num))
        else:
            # Handle wrap-around (e.g., November-March)
            seasons.append((start_num, end_num))
    elif len(month_positions) == 1:
        # Single month mentioned
        month_num = month_positions[0][2]
        seasons.append((month_num, month_num))
    
    return seasons if seasons else [(6, 9)]  # Default to summer


def parse_peaks(hike: Dict) -> List[Tuple[Optional[str], int]]:
    """Extract peak information from hike data."""
    peaks = []
    
    if 'peak_elevation' in hike:
        # Single peak
        elevation = parse_elevation(hike['peak_elevation'])
        peaks.append((None, elevation))  # No separate name for single peaks
    elif 'peak_elevations' in hike:
        # Multiple peaks
        peak_text = hike['peak_elevations']
        # Parse entries like "Green Mountain: 8,144'; Bear Peak: 8,461'"
        peak_matches = re.findall(r'([^:;]+):\s*(\d{1,2},?\d{3})', peak_text)
        for name, elev in peak_matches:
            peaks.append((name.strip(), parse_elevation(elev)))
    
    return peaks


def import_hikes(json_path: Path, db_path: Path):
    """Import hikes from JSON file into SQLite database."""
    # Load JSON data
    with open(json_path, 'r') as f:
        hikes_data = json.load(f)
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    schema_path = Path(__file__).parent / 'database_schema.sql'
    with open(schema_path, 'r') as f:
        cursor.executescript(f.read())
    
    # Import each hike
    for hike in hikes_data:
        # Parse fields
        difficulty_num = parse_difficulty(hike['difficulty'])
        class_num = parse_class(hike['class'])
        crowd_num, crowd_text = parse_crowd_level(hike['crowd_level'])
        distance = parse_distance(hike['round_trip_distance'])
        time_min, time_max = parse_hiking_time(hike['hiking_time'])
        start_elev = parse_elevation(hike['start_elevation'])
        gain = parse_elevation(hike['total_elevation_gain'])
        is_overnight = hike.get('label') == 'GOOD OVERNIGHT'
        
        # Insert hike
        cursor.execute('''
            INSERT INTO hikes (
                id, number, name, description, round_trip_miles,
                hiking_time_min, hiking_time_max, difficulty_rating,
                difficulty_label, class_numeric, class_text,
                start_elevation, total_elevation_gain, terrain,
                crowd_level_numeric, crowd_level_text, is_overnight,
                gear_advisor, location
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            hike['number'], hike['number'], hike['name'], hike['description'],
            distance, time_min, time_max, difficulty_num, hike['difficulty'],
            class_num, hike['class'], start_elev, gain, hike['terrain'],
            crowd_num, crowd_text, is_overnight, hike.get('gear_advisor'),
            hike.get('location')
        ))
        
        hike_id = hike['number']
        
        # Insert peaks
        peaks = parse_peaks(hike)
        for i, (peak_name, elevation) in enumerate(peaks):
            cursor.execute('''
                INSERT INTO peaks (hike_id, peak_name, elevation, is_primary)
                VALUES (?, ?, ?, ?)
            ''', (hike_id, peak_name, elevation, i == 0))
        
        # Insert trailhead
        if 'trailhead_gps' in hike:
            lat, lon = parse_gps(hike['trailhead_gps'])
            trailhead_name = re.search(r'\(([^)]+)\)', hike['start_elevation'])
            trailhead_name = trailhead_name.group(1) if trailhead_name else 'Main Trailhead'
            
            cursor.execute('''
                INSERT INTO trailheads (hike_id, name, latitude, longitude, elevation)
                VALUES (?, ?, ?, ?, ?)
            ''', (hike_id, trailhead_name, lat, lon, start_elev))
        
        # Insert climbing seasons
        season_text = hike.get('best_time_to_climb', '')
        seasons = parse_climbing_season(season_text)
        for start_month, end_month in seasons:
            cursor.execute('''
                INSERT INTO climbing_seasons (hike_id, start_month, end_month, season_text)
                VALUES (?, ?, ?, ?)
            ''', (hike_id, start_month, end_month, season_text))
        
        # Handle bonus peaks if present
        if 'bonus_peaks' in hike:
            # This would need custom parsing based on the format
            pass
    
    conn.commit()
    conn.close()
    print(f"Successfully imported {len(hikes_data)} hikes into {db_path}")


if __name__ == '__main__':
    script_dir = Path(__file__).parent
    import_hikes(script_dir / 'hikes.json', script_dir / 'summit_hikes.db')