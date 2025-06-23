import HikeCard from './HikeCard';
import './HikesDisplay.css';

function HikesDisplay({ 
  hikes, 
  totalCount, 
  filteredCount, 
  sortBy, 
  sortOrder, 
  onSortChange 
}) {
  // Sort options with display labels
  const sortOptions = [
    { value: 'number', label: 'Number' },
    { value: 'name', label: 'Name' },
    { value: 'difficulty_rating', label: 'Difficulty' },
    { value: 'round_trip_miles', label: 'Distance' },
    { value: 'total_elevation_gain', label: 'Elevation Gain' },
    { value: 'highest_peak_elevation', label: 'Peak Elevation' },
    { value: 'hiking_time_min', label: 'Min Hike Time' },
    { value: 'hiking_time_max', label: 'Max Hike Time' },
    { value: 'distance_from_denver', label: 'Distance from Denver' }
  ];

  return (
    <div className="hikes-display">
      {/* Results header */}
      <div className="results-header">
        <div className="results-count">
          Showing {filteredCount} of {totalCount} hikes
          {filteredCount < totalCount && (
            <span className="filter-active"> (filtered)</span>
          )}
        </div>
        
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => onSortChange(sortBy)}
            className="sort-order-button"
            aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Hikes grid */}
      {hikes.length === 0 ? (
        <div className="no-results">
          <p>No hikes match your current filters.</p>
          <p>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="hikes-grid">
          {hikes.map(hike => (
            <HikeCard key={hike.id} hike={hike} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HikesDisplay;