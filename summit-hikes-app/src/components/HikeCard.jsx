import './HikeCard.css';

function HikeCard({ hike }) {
  // Format elevation with commas
  const formatElevation = (elevation) => {
    return elevation.toLocaleString();
  };

  // Get difficulty color based on rating
  const getDifficultyColor = (rating) => {
    if (rating <= 3) return 'easy';
    if (rating <= 6) return 'moderate';
    if (rating <= 8) return 'hard';
    return 'extreme';
  };

  // Get crowd level label
  const getCrowdLabel = (level) => {
    const labels = ['', 'Hermit', 'Low', 'Moderate', 'Medium', 'High'];
    return labels[level] || 'Unknown';
  };

  return (
    <div className="hike-card">
      {/* Header */}
      <div className="hike-header">
        <h3 className="hike-name">
          {hike.number}. {hike.name}
        </h3>
        <div className="hike-header-badges">
          {hike.is_overnight === 1 && (
            <span className="overnight-badge">Overnight</span>
          )}
          {hike.is_in_season && (
            <span className="in-season-badge">In Season</span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="hike-description">{hike.description}</p>

      {/* Key stats */}
      <div className="hike-stats">
        <div className="stat">
          <span className="stat-label">Distance:</span>
          <span className="stat-value">{hike.round_trip_miles} miles</span>
        </div>
        
        <div className="stat">
          <span className="stat-label">Time:</span>
          <span className="stat-value">
            {hike.hiking_time_min}-{hike.hiking_time_max} hours
          </span>
        </div>
        
        <div className="stat">
          <span className="stat-label">Elevation Gain:</span>
          <span className="stat-value">
            {formatElevation(hike.total_elevation_gain)}'
          </span>
        </div>
        
        <div className="stat">
          <span className="stat-label">Highest Peak:</span>
          <span className="stat-value">
            {formatElevation(hike.highest_peak_elevation)}'
            {hike.highest_peak_elevation >= 14000 && (
              <span className="fourteener-badge">14er</span>
            )}
          </span>
        </div>
        
        {hike.distance_from_denver && (
          <div className="stat">
            <span className="stat-label">From Denver:</span>
            <span className="stat-value">{hike.distance_from_denver} miles</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="hike-badges">
        <span className={`badge difficulty-${getDifficultyColor(hike.difficulty_rating)}`}>
          {hike.difficulty_label}
        </span>
        <span className="badge class-badge">
          Class {hike.class_text}
        </span>
        <span className="badge crowd-badge">
          {getCrowdLabel(hike.crowd_level_numeric)}
        </span>
      </div>

      {/* Peaks info if multiple */}
      {hike.peak_count > 1 && (
        <div className="peaks-info">
          <strong>Peaks:</strong> {hike.all_peaks}
        </div>
      )}

      {/* Terrain */}
      <div className="terrain-info">
        <strong>Terrain:</strong> {hike.terrain}
      </div>

      {/* Climbing Seasons */}
      {hike.climbing_seasons && hike.climbing_seasons.length > 0 && (
        <div className="season-info">
          <strong>Season:</strong> {hike.climbing_seasons.map(s => s.season_text).join(', ')}
        </div>
      )}

      {/* Gear advisor if present */}
      {hike.gear_advisor && (
        <div className="gear-info">
          <strong>Gear:</strong> {hike.gear_advisor}
        </div>
      )}

      {/* GPS Coordinates */}
      {hike.latitude && hike.longitude && (
        <div className="gps-info">
          <strong>Trailhead GPS:</strong> {hike.latitude.toFixed(6)}°, {hike.longitude.toFixed(6)}°
        </div>
      )}
    </div>
  );
}

export default HikeCard;