# Summit Hikes Explorer - Frontend

A simple, clean React application for discovering summit hikes through filtering and sorting.

## Features

- **Search**: Free text search across hike names and descriptions
- **Filtering**: 
  - Difficulty range (1-10)
  - Distance range
  - Elevation gain range
  - Terrain class (1, 2, 3)
  - Crowd levels
  - Fourteeners only toggle
  - Overnight-suitable hikes toggle
- **Sorting**: By number, name, difficulty, distance, elevation gain, or peak elevation
- **Responsive Design**: Works on desktop and mobile devices

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

## Connecting to the API

The app currently uses mock data. To connect to the real API:

1. Start the backend API server (see parent directory)
2. In `App.jsx`, replace the mock data loading with:
```javascript
const response = await fetch('http://localhost:8000/hikes');
const data = await response.json();
setAllHikes(data);
```

## Code Structure

- `App.jsx` - Main component with all state management
- `components/` - Simple, single-purpose components
  - `SearchBar` - Text search input
  - `FilterControls` - All filter UI elements
  - `HikesDisplay` - Results grid with sorting
  - `HikeCard` - Individual hike display
  - `LoadingSpinner` - Loading state
- `utils/` - Helper functions
  - `mockData.js` - Sample data for development
  - `api.js` - API fetch functions (ready to use)

## Design Principles

- **Simplicity**: Straightforward code that's easy to follow
- **No Magic**: Explicit state management, no hidden abstractions
- **Readability**: Clear variable names and component structure
- **Performance**: Efficient filtering and sorting on the client side