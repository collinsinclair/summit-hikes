#!/Users/collinsinclair/Developer/summit-hikes/venv/bin/python3
"""
Simple FastAPI application for summit hikes database.
Provides RESTful endpoints for filtering and sorting hikes.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import List, Optional, Dict, Any
from pathlib import Path
import json
import math
from datetime import datetime, timedelta

app = FastAPI(title="Summit Hikes API")

# Enable CORS for web app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(__file__).parent / "summit_hikes.db"

# Denver coordinates (downtown Denver)
DENVER_LAT = 39.7392
DENVER_LON = -104.9903


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def dict_from_row(row):
    """Convert sqlite3.Row to dict."""
    return dict(zip(row.keys(), row))


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate crow-flies distance between two points using Haversine formula.
    Returns distance in miles."""
    R = 3959  # Earth's radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c


def is_in_season(start_month, end_month, buffer_days=15):
    """Check if current date is within climbing season, with buffer.
    Buffer allows seeing hikes that are about to come into season or about to go out."""
    current_date = datetime.now()
    current_year = current_date.year
    
    # Create season start and end dates
    if start_month <= end_month:
        # Season within same year (e.g., May to October)
        season_start = datetime(current_year, start_month, 1)
        # Get last day of end month
        if end_month == 12:
            season_end = datetime(current_year, 12, 31)
        else:
            season_end = datetime(current_year, end_month + 1, 1).replace(day=1) - timedelta(days=1)
    else:
        # Season crosses year boundary (e.g., November to March)
        if current_date.month >= start_month:
            # We're in the start year
            season_start = datetime(current_year, start_month, 1)
            season_end = datetime(current_year + 1, end_month + 1, 1).replace(day=1) - timedelta(days=1)
        else:
            # We're in the end year
            season_start = datetime(current_year - 1, start_month, 1)
            if end_month == 12:
                season_end = datetime(current_year, 12, 31)
            else:
                season_end = datetime(current_year, end_month + 1, 1).replace(day=1) - timedelta(days=1)
    
    # Apply buffer
    season_start_buffered = season_start - timedelta(days=buffer_days)
    season_end_buffered = season_end + timedelta(days=buffer_days)
    
    return season_start_buffered <= current_date <= season_end_buffered


@app.get("/")
def root():
    """API root endpoint."""
    return {
        "message": "Summit Hikes API",
        "endpoints": {
            "/hikes": "List all hikes with filtering and sorting",
            "/hikes/{id}": "Get single hike details",
            "/stats": "Get database statistics"
        }
    }


@app.get("/hikes")
def get_hikes(
    # Filtering parameters
    max_difficulty: Optional[float] = Query(None, ge=1, le=10),
    min_difficulty: Optional[float] = Query(None, ge=1, le=10),
    max_distance: Optional[float] = Query(None, gt=0),
    min_distance: Optional[float] = Query(None, gt=0),
    max_time: Optional[float] = Query(None, gt=0),
    min_time: Optional[float] = Query(None, gt=0),
    max_elevation_gain: Optional[int] = Query(None, gt=0),
    min_elevation_gain: Optional[int] = Query(None, gt=0),
    max_class: Optional[float] = Query(None, ge=1, le=4),
    max_crowd: Optional[int] = Query(None, ge=1, le=5),
    fourteeners_only: bool = Query(False),
    overnight_only: bool = Query(False),
    in_season_only: bool = Query(False),
    search: Optional[str] = Query(None),
    max_distance_from_denver: Optional[float] = Query(None, gt=0),
    min_distance_from_denver: Optional[float] = Query(None, gt=0),
    
    # Sorting parameters
    sort_by: str = Query("number", pattern="^(number|name|difficulty_rating|round_trip_miles|total_elevation_gain|highest_peak_elevation|class_numeric|hiking_time_min|hiking_time_max|distance_from_denver)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    
    # Pagination
    limit: int = Query(100, ge=1, le=100),
    offset: int = Query(0, ge=0)
) -> List[Dict[str, Any]]:
    """Get filtered and sorted list of hikes."""
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Build WHERE clause
    where_conditions = []
    params = []
    
    if max_difficulty is not None:
        where_conditions.append("difficulty_rating <= ?")
        params.append(max_difficulty)
    
    if min_difficulty is not None:
        where_conditions.append("difficulty_rating >= ?")
        params.append(min_difficulty)
    
    if max_distance is not None:
        where_conditions.append("round_trip_miles <= ?")
        params.append(max_distance)
    
    if min_distance is not None:
        where_conditions.append("round_trip_miles >= ?")
        params.append(min_distance)
    
    if max_time is not None:
        where_conditions.append("hiking_time_max <= ?")
        params.append(max_time)
    
    if min_time is not None:
        where_conditions.append("hiking_time_min >= ?")
        params.append(min_time)
    
    if max_elevation_gain is not None:
        where_conditions.append("total_elevation_gain <= ?")
        params.append(max_elevation_gain)
    
    if min_elevation_gain is not None:
        where_conditions.append("total_elevation_gain >= ?")
        params.append(min_elevation_gain)
    
    if max_class is not None:
        where_conditions.append("class_numeric <= ?")
        params.append(max_class)
    
    if max_crowd is not None:
        where_conditions.append("crowd_level_numeric <= ?")
        params.append(max_crowd)
    
    if fourteeners_only:
        where_conditions.append("highest_peak_elevation >= 14000")
    
    if overnight_only:
        where_conditions.append("is_overnight = 1")
    
    if search:
        where_conditions.append("(name LIKE ? OR description LIKE ?)")
        search_term = f"%{search}%"
        params.extend([search_term, search_term])
    
    # Build query with trailhead join for distance calculation
    query = """
        SELECT DISTINCT
            h.*,
            t.latitude,
            t.longitude,
            ROUND(
                3959 * ACOS(
                    COS(RADIANS(?)) * COS(RADIANS(t.latitude)) *
                    COS(RADIANS(t.longitude) - RADIANS(?)) +
                    SIN(RADIANS(?)) * SIN(RADIANS(t.latitude))
                ), 1
            ) as distance_from_denver
        FROM hikes_with_peaks h
        LEFT JOIN trailheads t ON h.id = t.hike_id
    """
    
    # Add Denver coordinates for distance calculation
    params = [DENVER_LAT, DENVER_LON, DENVER_LAT] + params
    
    if where_conditions:
        query += " WHERE " + " AND ".join(where_conditions)
    
    # Handle distance filtering
    if max_distance_from_denver is not None or min_distance_from_denver is not None:
        having_conditions = []
        if max_distance_from_denver is not None:
            having_conditions.append("distance_from_denver <= ?")
            params.append(max_distance_from_denver)
        if min_distance_from_denver is not None:
            having_conditions.append("distance_from_denver >= ?")
            params.append(min_distance_from_denver)
        
        query += " GROUP BY h.id"
        if having_conditions:
            query += " HAVING " + " AND ".join(having_conditions)
    else:
        query += " GROUP BY h.id"
    
    query += f" ORDER BY {sort_by} {sort_order.upper()}"
    query += f" LIMIT {limit} OFFSET {offset}"
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    # Convert rows and add distance calculation and season data
    results = []
    hike_ids = [row['id'] for row in rows]
    
    # Get all climbing seasons for the hikes
    seasons_data = {}
    if hike_ids:
        placeholders = ','.join('?' * len(hike_ids))
        cursor.execute(
            f"SELECT hike_id, start_month, end_month, season_text FROM climbing_seasons WHERE hike_id IN ({placeholders})",
            hike_ids
        )
        for season_row in cursor.fetchall():
            season = dict_from_row(season_row)
            hike_id = season['hike_id']
            if hike_id not in seasons_data:
                seasons_data[hike_id] = []
            seasons_data[hike_id].append({
                'start_month': season['start_month'],
                'end_month': season['end_month'],
                'season_text': season['season_text']
            })
    
    for row in rows:
        hike = dict_from_row(row)
        # Ensure distance is included
        if 'latitude' in hike and 'longitude' in hike and hike['latitude'] and hike['longitude']:
            hike['distance_from_denver'] = round(calculate_distance(
                DENVER_LAT, DENVER_LON, hike['latitude'], hike['longitude']
            ), 1)
        
        # Add season data
        hike_id = hike['id']
        hike['climbing_seasons'] = seasons_data.get(hike_id, [])
        
        # Check if hike is in season
        hike['is_in_season'] = False
        for season in hike['climbing_seasons']:
            if is_in_season(season['start_month'], season['end_month']):
                hike['is_in_season'] = True
                break
        
        # Apply in-season filter if requested
        if not in_season_only or hike['is_in_season']:
            results.append(hike)
    
    conn.close()
    
    return results


@app.get("/hikes/{hike_id}")
def get_hike(hike_id: int) -> Dict[str, Any]:
    """Get detailed information for a single hike."""
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get hike details
    cursor.execute("SELECT * FROM hikes WHERE id = ?", (hike_id,))
    hike = cursor.fetchone()
    
    if not hike:
        conn.close()
        raise HTTPException(status_code=404, detail="Hike not found")
    
    hike_dict = dict_from_row(hike)
    
    # Get peaks
    cursor.execute(
        "SELECT peak_name, elevation FROM peaks WHERE hike_id = ? ORDER BY elevation DESC",
        (hike_id,)
    )
    hike_dict['peaks'] = [dict_from_row(row) for row in cursor.fetchall()]
    
    # Get trailheads
    cursor.execute(
        "SELECT name, latitude, longitude, elevation FROM trailheads WHERE hike_id = ?",
        (hike_id,)
    )
    trailheads = cursor.fetchall()
    hike_dict['trailheads'] = [dict_from_row(row) for row in trailheads]
    
    # Get climbing seasons
    cursor.execute(
        "SELECT start_month, end_month, season_text FROM climbing_seasons WHERE hike_id = ?",
        (hike_id,)
    )
    hike_dict['climbing_seasons'] = [dict_from_row(row) for row in cursor.fetchall()]
    
    # Check if hike is in season
    hike_dict['is_in_season'] = False
    for season in hike_dict['climbing_seasons']:
        if is_in_season(season['start_month'], season['end_month']):
            hike_dict['is_in_season'] = True
            break
    
    conn.close()
    
    return hike_dict


@app.get("/stats")
def get_stats() -> Dict[str, Any]:
    """Get database statistics."""
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            COUNT(*) as total_hikes,
            COUNT(CASE WHEN highest_peak_elevation >= 14000 THEN 1 END) as fourteeners,
            AVG(round_trip_miles) as avg_distance,
            AVG(total_elevation_gain) as avg_elevation_gain,
            AVG(difficulty_rating) as avg_difficulty,
            MIN(round_trip_miles) as shortest_distance,
            MAX(round_trip_miles) as longest_distance,
            MIN(highest_peak_elevation) as lowest_peak,
            MAX(highest_peak_elevation) as highest_peak
        FROM hikes_with_peaks
    """)
    
    stats = dict_from_row(cursor.fetchone())
    
    # Get difficulty distribution
    cursor.execute("""
        SELECT difficulty_label, COUNT(*) as count
        FROM hikes
        GROUP BY difficulty_label
        ORDER BY difficulty_rating
    """)
    stats['difficulty_distribution'] = [dict_from_row(row) for row in cursor.fetchall()]
    
    # Get class distribution
    cursor.execute("""
        SELECT class_text, COUNT(*) as count
        FROM hikes
        GROUP BY class_text
        ORDER BY class_numeric
    """)
    stats['class_distribution'] = [dict_from_row(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return stats


if __name__ == "__main__":
    import uvicorn
    
    # Check if database exists
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        print("Please run import_data.py first to create the database")
        exit(1)
    
    print("Starting Summit Hikes API on http://localhost:8000")
    print("API documentation available at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)