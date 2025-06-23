import './FilterControls.css';

function FilterControls({
  difficultyRange,
  distanceRange,
  elevationGainRange,
  hikeTimeRange,
  distanceFromDenverRange,
  selectedClasses,
  maxCrowdLevel,
  showFourteenersOnly,
  showOvernightOnly,
  showInSeasonOnly,
  onDifficultyRangeChange,
  onDistanceRangeChange,
  onElevationGainRangeChange,
  onHikeTimeRangeChange,
  onDistanceFromDenverRangeChange,
  onClassToggle,
  onCrowdLevelChange,
  onFourteenersToggle,
  onOvernightToggle,
  onInSeasonToggle,
  onResetFilters
}) {
  // Handler for difficulty range inputs
  const handleDifficultyMinChange = (e) => {
    const newMin = Number(e.target.value);
    if (newMin <= difficultyRange.max) {
      onDifficultyRangeChange({ ...difficultyRange, min: newMin });
    }
  };

  const handleDifficultyMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (newMax >= difficultyRange.min) {
      onDifficultyRangeChange({ ...difficultyRange, max: newMax });
    }
  };

  // Handler for distance range inputs
  const handleDistanceMinChange = (e) => {
    const newMin = Number(e.target.value);
    if (newMin <= distanceRange.max) {
      onDistanceRangeChange({ ...distanceRange, min: newMin });
    }
  };

  const handleDistanceMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (newMax >= distanceRange.min) {
      onDistanceRangeChange({ ...distanceRange, max: newMax });
    }
  };

  // Handler for elevation gain range inputs
  const handleElevationMinChange = (e) => {
    const newMin = Number(e.target.value);
    if (newMin <= elevationGainRange.max) {
      onElevationGainRangeChange({ ...elevationGainRange, min: newMin });
    }
  };

  const handleElevationMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (newMax >= elevationGainRange.min) {
      onElevationGainRangeChange({ ...elevationGainRange, max: newMax });
    }
  };

  // Handler for hike time range inputs
  const handleHikeTimeMinChange = (e) => {
    const newMin = Number(e.target.value);
    if (newMin <= hikeTimeRange.max) {
      onHikeTimeRangeChange({ ...hikeTimeRange, min: newMin });
    }
  };

  const handleHikeTimeMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (newMax >= hikeTimeRange.min) {
      onHikeTimeRangeChange({ ...hikeTimeRange, max: newMax });
    }
  };

  // Handler for distance from Denver range inputs
  const handleDistanceFromDenverMinChange = (e) => {
    const newMin = Number(e.target.value);
    if (newMin <= distanceFromDenverRange.max) {
      onDistanceFromDenverRangeChange({ ...distanceFromDenverRange, min: newMin });
    }
  };

  const handleDistanceFromDenverMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (newMax >= distanceFromDenverRange.min) {
      onDistanceFromDenverRangeChange({ ...distanceFromDenverRange, max: newMax });
    }
  };

  // Crowd level labels
  const crowdLevelLabels = ['Hermit', 'Low', 'Moderate', 'Medium', 'High'];

  return (
    <div className="filter-controls">
      <div className="filter-header">
        <h2>Filters</h2>
        <button 
          onClick={onResetFilters}
          className="reset-button"
        >
          Reset All
        </button>
      </div>

      {/* Difficulty Range */}
      <div className="filter-section">
        <h3>Difficulty</h3>
        <div className="range-inputs">
          <input
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={difficultyRange.min}
            onChange={handleDifficultyMinChange}
            className="range-input"
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={difficultyRange.max}
            onChange={handleDifficultyMaxChange}
            className="range-input"
          />
        </div>
        <div className="range-label">
          {difficultyRange.min}/10 - {difficultyRange.max}/10
        </div>
      </div>

      {/* Distance Range */}
      <div className="filter-section">
        <h3>Distance (miles)</h3>
        <div className="range-inputs">
          <input
            type="number"
            min="0"
            max="25"
            step="0.5"
            value={distanceRange.min}
            onChange={handleDistanceMinChange}
            className="range-input"
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            min="0"
            max="25"
            step="0.5"
            value={distanceRange.max}
            onChange={handleDistanceMaxChange}
            className="range-input"
          />
        </div>
      </div>

      {/* Elevation Gain Range */}
      <div className="filter-section">
        <h3>Elevation Gain (feet)</h3>
        <div className="range-inputs">
          <input
            type="number"
            min="0"
            max="10000"
            step="100"
            value={elevationGainRange.min}
            onChange={handleElevationMinChange}
            className="range-input"
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            min="0"
            max="10000"
            step="100"
            value={elevationGainRange.max}
            onChange={handleElevationMaxChange}
            className="range-input"
          />
        </div>
      </div>

      {/* Hike Time Range */}
      <div className="filter-section">
        <h3>Hike Time (hours)</h3>
        <div className="range-inputs">
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hikeTimeRange.min}
            onChange={handleHikeTimeMinChange}
            className="range-input"
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={hikeTimeRange.max}
            onChange={handleHikeTimeMaxChange}
            className="range-input"
          />
        </div>
      </div>

      {/* Distance from Denver Range */}
      <div className="filter-section">
        <h3>Distance from Denver (miles)</h3>
        <div className="range-inputs">
          <input
            type="number"
            min="0"
            max="200"
            step="5"
            value={distanceFromDenverRange.min}
            onChange={handleDistanceFromDenverMinChange}
            className="range-input"
          />
          <span className="range-separator">to</span>
          <input
            type="number"
            min="0"
            max="200"
            step="5"
            value={distanceFromDenverRange.max}
            onChange={handleDistanceFromDenverMaxChange}
            className="range-input"
          />
        </div>
      </div>

      {/* Class Selection */}
      <div className="filter-section">
        <h3>Class</h3>
        <div className="class-buttons">
          {[1, 2, 3].map(classNum => (
            <button
              key={classNum}
              onClick={() => onClassToggle(classNum)}
              className={`class-button ${selectedClasses.includes(classNum) ? 'active' : ''}`}
            >
              Class {classNum}
            </button>
          ))}
        </div>
      </div>

      {/* Crowd Level */}
      <div className="filter-section">
        <h3>Max Crowd Level</h3>
        <select 
          value={maxCrowdLevel} 
          onChange={(e) => onCrowdLevelChange(Number(e.target.value))}
          className="crowd-select"
        >
          {crowdLevelLabels.map((label, index) => (
            <option key={index + 1} value={index + 1}>
              {label} or less
            </option>
          ))}
        </select>
      </div>

      {/* Toggle Filters */}
      <div className="filter-section">
        <h3>Special Filters</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showFourteenersOnly}
            onChange={onFourteenersToggle}
          />
          <span>Fourteeners Only</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showOvernightOnly}
            onChange={onOvernightToggle}
          />
          <span>Good for Overnight</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showInSeasonOnly}
            onChange={onInSeasonToggle}
          />
          <span>In Season Only</span>
        </label>
      </div>
    </div>
  );
}

export default FilterControls;