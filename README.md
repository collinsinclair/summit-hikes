# Summit Hikes Database

A SQLite-based solution for storing and querying summit hike information, designed for building filtering/sorting web applications.

## Overview

This project transforms natural language hike descriptions from JSON into a normalized SQLite database with:
- Numeric values for filtering/sorting (difficulty, distance, time, etc.)
- Enumerated crowd levels and terrain classes
- Normalized peak and trailhead data
- Simplified querying for web applications

## Files

- `database_schema.sql` - SQLite schema with optimized structure
- `data_transformations.md` - Documentation of all data transformations
- `import_data.py` - Python script to import JSON data into SQLite
- `example_queries.sql` - Common query patterns for filtering/sorting
- `simple_api.py` - FastAPI application providing REST endpoints

## Setup

1. Install dependencies:
```bash
pip install fastapi uvicorn
```

2. Import the data:
```bash
python import_data.py
```

3. (Optional) Start the API server:
```bash
python simple_api.py
```

## Database Design

The schema uses a pragmatic approach optimized for read-heavy operations:

- **Main hikes table**: Contains denormalized fields for efficient filtering
- **Peaks table**: Normalized to handle multi-peak hikes
- **Trailheads table**: Stores GPS coordinates in decimal format
- **Climbing seasons table**: Parsed month ranges for seasonal filtering
- **Views**: Pre-joined data for common queries

## Key Transformations

- Difficulty: "4.5/10" → 4.5 (numeric)
- Class: "2+" → 2.3 (numeric with preserved text)
- Crowd: "Low to moderate" → 3 (1-5 scale)
- GPS: "39°49.681' N" → 39.828017 (decimal)
- Distance: "7.28 miles" → 7.28
- Time: "4.5-6 hours" → min: 4.5, max: 6.0

## API Usage

The FastAPI application provides:
- `GET /hikes` - List hikes with filtering, sorting, and pagination
- `GET /hikes/{id}` - Get detailed hike information
- `GET /stats` - Database statistics

Example query:
```
GET /hikes?max_difficulty=5&max_distance=10&fourteeners_only=true&sort_by=difficulty_rating
```