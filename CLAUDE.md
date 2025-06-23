# Summit Hikes Explorer - Project Documentation

## Overview
A web application for discovering and filtering 55 summit hikes in Colorado. Built with an emphasis on **simplicity, readability, and no magic**. The app allows users to filter hikes by difficulty, distance, elevation gain, terrain class, crowd levels, and special characteristics (fourteeners, overnight suitability).

## Architecture Decisions

### Backend: SQLite + Raw SQL + FastAPI
**Why this approach:**
- SQLite is perfect for read-heavy, single-user applications
- Raw SQL provides full control over query optimization
- FastAPI offers a simple, fast API layer without heavy abstractions
- No ORM magic - queries are explicit and debuggable

**Key files:**
- `database_schema.sql` - Pragmatic schema optimized for filtering/sorting
- `import_data.py` - Transforms natural language JSON into normalized database
- `simple_api.py` - Minimal FastAPI server with direct SQL queries

### Frontend: React + Vite (No Framework Magic)
**Why this approach:**
- React with Vite for fast development without webpack complexity
- **No state management library** - just useState in App.jsx
- **No CSS framework** - explicit styles in CSS files
- **No routing library** - single page application
- **No component library** - simple, custom components

**Key principles:**
- All state lives in `App.jsx` (single source of truth)
- Props flow down, callbacks flow up
- Verbose variable names (`filteredHikesList` not `filtered`)
- One component = one file = one clear purpose

## Data Transformations

### From JSON to Database:
- Difficulty: "4.5/10" → 4.5 (numeric for sorting)
- Class: "2+" → 2.3 (numeric with original text preserved)
- Crowd: "Low to moderate" → 3 (1-5 scale)
- GPS: "39°49.681' N" → 39.828017 (decimal degrees)
- Distance: "7.28 miles" → 7.28
- Hiking time: "4.5-6 hours" → min: 4.5, max: 6.0
- Elevations: "10,300'" → 10300 (integer)

### Database Design:
- Main `hikes` table with denormalized fields for performance
- Separate `peaks` table for multi-peak hikes (normalized)
- `trailheads` table with parsed GPS coordinates
- `climbing_seasons` table for seasonal data
- Views like `hikes_with_peaks` for common queries

## Component Structure

```
App.jsx (all state management)
├── SearchBar.jsx (text search only)
├── FilterControls.jsx (all filter UI)
├── HikesDisplay.jsx (results + sorting)
│   └── HikeCard.jsx (individual hike)
└── LoadingSpinner.jsx (loading state)
```

## Engineering Principles Applied

1. **Explicit over Implicit**: No hidden state updates, no context magic
2. **Readable over Clever**: Long function names that describe what they do
3. **Simple over Powerful**: Direct fetch() calls instead of axios
4. **Predictable over Flexible**: Fixed component structure, clear data flow

## Key Implementation Details

### Filtering Logic
- All filtering happens client-side in `getFilteredHikes()`
- Each filter is applied sequentially with early returns
- Empty filter selections mean "show all" (no filtering)

### API Design
- RESTful endpoints with query parameters for filtering
- Returns denormalized data to minimize client-side joins
- Pagination support built-in but not used in frontend

### Boolean Handling
- SQLite returns booleans as 0/1 integers
- Frontend checks explicitly: `hike.is_overnight === 1`
- This avoids JavaScript truthy/falsy confusion

## Development Setup

1. **Backend**: Python virtual environment at `./venv`
   - Dependencies: fastapi, uvicorn
   - Database: SQLite file `summit_hikes.db`
   - Run: `./venv/bin/python simple_api.py`

2. **Frontend**: Standard Vite React app
   - No special dependencies beyond React
   - Run: `npm run dev` in `summit-hikes-app/`

## Future Considerations

### If extending this app, maintain these principles:
1. Keep all state in App.jsx until it becomes truly unmanageable
2. Add features through new filter types, not architectural changes
3. Resist the urge to add routing unless building distinct pages
4. Keep the API simple - add endpoints, not GraphQL
5. If adding tests, test the filtering logic primarily

### Potential improvements that fit the philosophy:
- Add more sort options (by start elevation, by time)
- Add map view using Leaflet (as a separate component)
- Add export functionality (CSV download)
- Add favorite hikes (localStorage only)
- Add print-friendly view

### What NOT to add:
- Redux or other state management
- Server-side rendering
- Authentication (this is a read-only app)
- Complex caching strategies
- Microservices

## Running the Complete App

```bash
# Option 1: Use the provided script
./run_app.sh

# Option 2: Run manually
# Terminal 1 - Backend
./venv/bin/python simple_api.py

# Terminal 2 - Frontend  
cd summit-hikes-app && npm run dev
```

Backend runs on http://localhost:8000
Frontend runs on http://localhost:5173

## Philosophy Summary

This project demonstrates that modern web apps don't need complex abstractions. By choosing boring technology and writing explicit code, we've created a maintainable, performant application that any developer can understand in minutes rather than hours.